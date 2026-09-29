import { NextRequest, NextResponse } from "next/server";
import { verifyCallbackSignature } from "@/lib/ekwanza/signature";
import { setPaymentStatus } from "@/lib/payments/store";

/**
 * Wallet ticket callback. Per the docs, this fires when the payment succeeds,
 * so its mere arrival (with a valid signature) means the ticket was paid —
 * status polling for this method still primarily relies on the live
 * GET /Ticket/{token}/{code} endpoint; this write is a convenience mirror.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature");
  const body = await request.json().catch(() => null);

  if (!signature || !body || typeof body.code !== "string" || typeof body.operationCode !== "string") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const isValid = verifyCallbackSignature(body.code, body.operationCode, signature);
  if (!isValid) {
    console.warn("Assinatura inválida no callback e-kwanza", { code: body.code });
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    await setPaymentStatus(body.code, {
      status: "paid",
      amount: Number(body.amount ?? 0),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Storage is a convenience mirror for this method — don't fail the callback
    // (which the docs say é-kwanza may retry) over a store outage.
    console.error("Falha ao gravar estado do pagamento (callback e-kwanza)", error);
  }

  return NextResponse.json({ status: "0" });
}
