import { randomBytes } from 'crypto';

/**
 * Integração AppyPay (Multicaixa Express via GPO e pagamento por referência).
 * Mesmo contrato usado no site institucional (globalsc.ao).
 */

const TOKEN_URL = 'https://login.microsoftonline.com/auth.appypay.co.ao/oauth2/token';

export type AppyPayMethod = 'express' | 'reference';

export interface AppyPayReference {
  entity?: string;
  referenceNumber?: string;
  dueDate?: string;
}

export interface AppyPayChargeResult {
  chargeId: string;
  merchantTransactionId: string;
  reference?: AppyPayReference;
}

export type AppyPayStatus = 'paid' | 'cancelled' | 'pending';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function appyPayConfigured(): boolean {
  const e = process.env;
  return Boolean(
    e.GATEWAY_API_URL && e.APPY_CLIENT_ID && e.APPY_CLIENT_SECRET && e.APPY_RESOURCE &&
    e.APPYPAY_GPO_ID && e.APPYPAY_REF_ID && e.APPYPAY_MERCHANT_IDENTIFIER && e.APPYPAY_API_KEY
  );
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.APPY_CLIENT_ID!,
      client_secret: process.env.APPY_CLIENT_SECRET!,
      resource: process.env.APPY_RESOURCE!,
    }).toString(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`AppyPay token: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: string | number };
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (Number(data.expires_in) - 60) * 1000;
  return cachedToken;
}

async function gateway(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${process.env.GATEWAY_API_URL!.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

/** merchantTransactionId: máx. 15 caracteres alfanuméricos. */
function newMerchantTransactionId() {
  return `GA${randomBytes(8).toString('hex').toUpperCase()}`.slice(0, 15);
}

export async function createAppyPayCharge(input: {
  method: AppyPayMethod;
  amount: number;
  currency: string;
  description: string;
  phone: string;
  fullName: string;
  email: string;
}): Promise<AppyPayChargeResult> {
  const merchantTransactionId = newMerchantTransactionId();
  const body: Record<string, unknown> = {
    amount: input.amount,
    currency: input.currency,
    description: input.description.slice(0, 120),
    merchantTransactionId,
    paymentMethod: input.method === 'express' ? process.env.APPYPAY_GPO_ID : process.env.APPYPAY_REF_ID,
    options: {
      MerchantIdentifier: process.env.APPYPAY_MERCHANT_IDENTIFIER,
      ApiKey: process.env.APPYPAY_API_KEY,
    },
  };
  if (input.method === 'express') {
    body.paymentInfo = { phoneNumber: input.phone.replace(/\D/g, '').replace(/^244/, '') };
    body.notify = {
      name: input.fullName,
      telephone: input.phone,
      email: input.email,
      smsNotification: true,
      emailNotification: true,
    };
  }

  const { data } = await gateway('/charges', { method: 'POST', body: JSON.stringify(body) });
  const rs = data.responseStatus as { successful?: boolean; message?: string; reference?: AppyPayReference } | undefined;
  if (!rs?.successful) throw new Error(`AppyPay recusou a cobrança: ${rs?.message ?? 'sem mensagem'}`);

  return {
    chargeId: String(data.id ?? ''),
    merchantTransactionId,
    reference: rs.reference
      ? { entity: rs.reference.entity, referenceNumber: rs.reference.referenceNumber, dueDate: rs.reference.dueDate }
      : undefined,
  };
}

/** Consulta o estado real da cobrança no gateway (não confiar no corpo do webhook). */
export async function getAppyPayChargeStatus(chargeId: string): Promise<AppyPayStatus> {
  const { ok, data } = await gateway(`/charges/${encodeURIComponent(chargeId)}`);
  if (!ok) throw new Error('AppyPay: falha ao consultar a cobrança');
  const nested = (data.payment ?? data.responseStatus ?? {}) as { status?: string };
  const raw = String(nested.status ?? data.status ?? '').toLowerCase();
  if (raw === 'success' || raw === 'paid') return 'paid';
  if (raw === 'failed' || raw === 'cancelled' || raw === 'canceled' || raw === 'expired') return 'cancelled';
  return 'pending';
}
