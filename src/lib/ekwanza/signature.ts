import { createHmac, timingSafeEqual } from "crypto";
import { getEkwanzaConfig } from "./config";

/**
 * Per the É-kwanza integration docs, the callback's x-signature is
 * HMAC-SHA256, keyed with the merchant API Key, over the concatenation of:
 * Código + Código da operação + Número de registo do parceiro + Token de notificação.
 */
export function computeCallbackSignature(code: string, operationCode: string): string {
  const { apiKey, merchantRegistrationNumber, notificationToken } = getEkwanzaConfig();
  const payload = `${code}${operationCode}${merchantRegistrationNumber}${notificationToken}`;
  return createHmac("sha256", apiKey).update(payload).digest("hex");
}

export function verifyCallbackSignature(
  code: string,
  operationCode: string,
  receivedSignature: string
): boolean {
  const expected = computeCallbackSignature(code, operationCode);

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(receivedSignature, "hex");

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, receivedBuf);
}
