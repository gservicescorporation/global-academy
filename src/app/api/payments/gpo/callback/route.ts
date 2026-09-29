import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus, setPaymentStatus, PaymentStatus } from "@/lib/payments/store";

// 1 = Pagamento efetuado com Sucesso, 3 = Cancelado/Expirado, 4 = Falhado/Recusado, 5 = Erro
const OPERATION_STATUS_MAP: Record<number, PaymentStatus> = {
  1: "paid",
  3: "expired",
  4: "failed",
  5: "failed",
};

/**
 * AppyPay's docs don't specify a signature header for this webhook, so as a
 * minimal check we only accept callbacks for merchantTransactionIds we
 * actually issued (tracked in the payments store).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.merchantTransactionId !== "string" ||
    typeof body.operationStatus !== "number"
  ) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const existing = await getPaymentStatus(body.merchantTransactionId).catch(() => null);
  if (!existing) {
    console.warn("Callback GPO para merchantTransactionId desconhecido", {
      merchantTransactionId: body.merchantTransactionId,
    });
    return NextResponse.json({ error: "Transação desconhecida" }, { status: 404 });
  }

  const status = OPERATION_STATUS_MAP[body.operationStatus] ?? "failed";

  try {
    await setPaymentStatus(body.merchantTransactionId, {
      status,
      amount: body.operationData?.amount ?? existing.amount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Falha ao gravar estado do pagamento (callback GPO)", error);
    return NextResponse.json({ error: "Falha ao gravar estado" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
