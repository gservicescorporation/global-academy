import { getEkwanzaConfig } from "./config";

export type EkwanzaTicketStatus = 0 | 1 | 2 | 3; // Pendente | Processado | Expirado | Cancelado

export interface CreateTicketParams {
  amount: number;
  referenceCode: string;
  mobileNumber: string;
}

export interface CreateTicketResult {
  code: string;
  qrCode: string;
  status: EkwanzaTicketStatus;
  expirationDate: string;
}

export interface TicketStatusResult {
  amount: number;
  code: string;
  creationDate: string;
  expirationDate: string;
  status: EkwanzaTicketStatus;
}

export class EkwanzaApiError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly ekwanzaStatus?: number
  ) {
    super(message);
    this.name = "EkwanzaApiError";
  }
}

export async function createTicket({
  amount,
  referenceCode,
  mobileNumber,
}: CreateTicketParams): Promise<CreateTicketResult> {
  const { notificationToken, ticketApiBaseUrl } = getEkwanzaConfig();

  const url = new URL(`${ticketApiBaseUrl}/Ticket/${notificationToken}`);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("referenceCode", referenceCode);
  url.searchParams.set("mobileNumber", mobileNumber);

  const response = await fetch(url, { method: "POST" });
  const body = await response.json();

  if (!response.ok) {
    throw new EkwanzaApiError(
      "Falha ao criar código de pagamento e-kwanza",
      response.status,
      body?.Status
    );
  }

  return {
    code: body.Code,
    qrCode: body.QRCode,
    status: body.Status,
    expirationDate: body.ExpirationDate,
  };
}

export async function getTicketStatus(
  ticketCode: string
): Promise<TicketStatusResult> {
  const { notificationToken, ticketApiBaseUrl } = getEkwanzaConfig();

  const url = `${ticketApiBaseUrl}/Ticket/${notificationToken}/${encodeURIComponent(
    ticketCode
  )}`;

  const response = await fetch(url, { method: "GET" });

  if (response.status === 404) {
    throw new EkwanzaApiError("Código de pagamento não encontrado", 404);
  }

  const body = await response.json();

  if (!response.ok) {
    throw new EkwanzaApiError(
      "Falha ao consultar estado do código de pagamento",
      response.status,
      body?.Status
    );
  }

  return {
    amount: body.Amount,
    code: body.Code,
    creationDate: body.CreationDate,
    expirationDate: body.ExpirationDate,
    status: body.Status,
  };
}
