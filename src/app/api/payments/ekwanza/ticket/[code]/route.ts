import { NextRequest, NextResponse } from "next/server";
import { getTicketStatus, EkwanzaApiError } from "@/lib/ekwanza/client";

const STATUS_LABELS = ["pending", "paid", "expired", "cancelled"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const ticket = await getTicketStatus(code);

    return NextResponse.json({
      code: ticket.code,
      amount: ticket.amount,
      creationDate: ticket.creationDate,
      expirationDate: ticket.expirationDate,
      status: STATUS_LABELS[ticket.status] ?? "pending",
    });
  } catch (error) {
    if (error instanceof EkwanzaApiError) {
      return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    }

    console.error("Erro ao consultar código de pagamento e-kwanza", error);
    return NextResponse.json(
      { error: "Erro inesperado ao consultar código de pagamento" },
      { status: 500 }
    );
  }
}
