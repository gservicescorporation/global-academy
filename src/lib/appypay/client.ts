import { getAppyPayConfig } from "./config";

export type ChargeMethod = "reference" | "multicaixaExpress";

export interface CreateChargeParams {
  amount: number;
  merchantTransactionId: string;
  method: ChargeMethod;
  phoneNumber?: string;
  description?: string;
}

export class AppyPayApiError extends Error {
  constructor(message: string, public readonly httpStatus: number) {
    super(message);
    this.name = "AppyPayApiError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { oauthUrl, clientId, clientSecret, resource } = getAppyPayConfig();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    resource,
  });

  const response = await fetch(oauthUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new AppyPayApiError("Falha ao autenticar no gateway AppyPay", response.status);
  }

  const json = await response.json();
  // Expires slightly early to avoid using a token that expires mid-request.
  const expiresInSeconds = Number(json.expires_in ?? 3600);
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 30, 0) * 1000,
  };

  return cachedToken.value;
}

/**
 * Creates a Referência (EMIS) or Multicaixa Express (GPO) charge via AppyPay.
 * NOTE: the integration PDF doesn't document the response body shape — the
 * `raw` field is returned as-is so callers can inspect it once real sandbox
 * credentials are available, alongside a best-effort `reference` guess.
 */
export async function createCharge({
  amount,
  merchantTransactionId,
  method,
  phoneNumber,
  description,
}: CreateChargeParams): Promise<{ raw: unknown; reference?: string }> {
  const {
    chargesUrl,
    paymentMethodRef,
    paymentMethodGpo,
    merchantIdentifier,
    apiKey,
  } = getAppyPayConfig();

  if (method === "multicaixaExpress" && !phoneNumber) {
    throw new Error("phoneNumber é obrigatório para Multicaixa Express");
  }

  const token = await getAccessToken();

  const payload: Record<string, unknown> = {
    amount,
    currency: "AOA",
    description: description ?? "Inscrição Global Academy",
    merchantTransactionId,
    paymentMethod: method === "reference" ? paymentMethodRef : paymentMethodGpo,
    options: {
      MerchantIdentifier: merchantIdentifier,
      ApiKey: apiKey,
    },
  };

  if (method === "multicaixaExpress") {
    payload.paymentInfo = { phoneNumber };
  }

  const response = await fetch(chargesUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppyPayApiError("Falha ao criar cobrança AppyPay", response.status);
  }

  const reference =
    typeof raw === "object" && raw !== null && "reference" in raw
      ? String((raw as Record<string, unknown>).reference)
      : undefined;

  return { raw, reference };
}
