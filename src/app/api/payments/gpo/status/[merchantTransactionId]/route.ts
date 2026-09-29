import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/payments/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ merchantTransactionId: string }> }
) {
  const { merchantTransactionId } = await params;

  try {
    const record = await getPaymentStatus(merchantTransactionId);

    if (!record) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Erro ao consultar estado do pagamento GPO", error);
    return NextResponse.json(
      { error: "Erro inesperado ao consultar estado do pagamento" },
      { status: 500 }
    );
  }
}
