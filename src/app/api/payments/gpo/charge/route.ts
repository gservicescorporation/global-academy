import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createCharge, AppyPayApiError, ChargeMethod } from "@/lib/appypay/client";
import { setPaymentStatus } from "@/lib/payments/store";

const VALID_METHODS: ChargeMethod[] = ["reference", "multicaixaExpress"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.amount !== "number" ||
    !VALID_METHODS.includes(body.method) ||
    (body.method === "multicaixaExpress" && typeof body.phoneNumber !== "string")
  ) {
    return NextResponse.json(
      { error: "amount e method são obrigatórios (phoneNumber para Multicaixa Express)" },
      { status: 400 }
    );
  }

  const merchantTransactionId = `EKZQA${Date.now()}${randomUUID().slice(0, 6)}`;

  try {
    await setPaymentStatus(merchantTransactionId, {
      status: "pending",
      amount: body.amount,
      updatedAt: new Date().toISOString(),
    });

    const { raw, reference } = await createCharge({
      amount: body.amount,
      merchantTransactionId,
      method: body.method,
      phoneNumber: body.phoneNumber,
      description: body.description,
    });

    return NextResponse.json(
      { merchantTransactionId, reference, raw },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppyPayApiError) {
      return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    }

    console.error("Erro ao criar cobrança GPO", error);
    return NextResponse.json(
      { error: "Erro inesperado ao criar cobrança" },
      { status: 500 }
    );
  }
}
