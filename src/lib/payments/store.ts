export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface PaymentRecord {
  status: PaymentStatus;
  amount: number;
  updatedAt: string;
}

const TTL_SECONDS = 60 * 60; // 1h — enough for a student to complete a payment

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function restUrl(path: string): string {
  const base = required("UPSTASH_REDIS_REST_URL");
  return `${base.replace(/\/$/, "")}${path}`;
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${required("UPSTASH_REDIS_REST_TOKEN")}` };
}

/**
 * Stores/reads short-lived payment status so the AppyPay (GPO) webhook can be
 * correlated with the browser's status polling across separate serverless
 * invocations. Not used for the É-kwanza wallet ticket flow, which has its
 * own live status endpoint.
 */
export async function setPaymentStatus(
  id: string,
  record: PaymentRecord
): Promise<void> {
  const key = `payment:${id}`;
  const value = encodeURIComponent(JSON.stringify(record));

  const response = await fetch(restUrl(`/set/${key}/${value}?EX=${TTL_SECONDS}`), {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Falha ao gravar estado do pagamento");
  }
}

export async function getPaymentStatus(
  id: string
): Promise<PaymentRecord | null> {
  const key = `payment:${id}`;

  const response = await fetch(restUrl(`/get/${key}`), {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar estado do pagamento");
  }

  const body = await response.json();
  if (!body.result) {
    return null;
  }

  return JSON.parse(body.result) as PaymentRecord;
}
