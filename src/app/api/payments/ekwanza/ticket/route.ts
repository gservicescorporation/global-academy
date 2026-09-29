import { NextRequest, NextResponse } from "next/server";
import { createTicket, EkwanzaApiError } from "@/lib/ekwanza/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.amount !== "number" ||
    typeof body.referenceCode !== "string" ||
    typeof body.mobileNumber !== "string"
  ) {
    return NextResponse.json(
      { error: "amount, referenceCode e mobileNumber são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const ticket = await createTicket({
      amount: body.amount,
      referenceCode: body.referenceCode,
      mobileNumber: body.mobileNumber,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof EkwanzaApiError) {
      return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    }

    console.error("Erro ao criar código de pagamento e-kwanza", error);
    return NextResponse.json(
      { error: "Erro inesperado ao criar código de pagamento" },
      { status: 500 }
    );
  }
}
