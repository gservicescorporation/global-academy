"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// Local Next.js API routes — same origin, not the external NEXT_PUBLIC_API_URL backend.
async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "Erro ao processar pedido");
  }
  return data;
}

type Method = "qr" | "reference" | "multicaixaExpress";

interface PaymentStepProps {
  amount: number;
  mobileNumber: string;
  onConfirmed: () => void;
}

const POLL_INTERVAL_MS = 5000;

const METHODS: { id: Method; label: string; description: string }[] = [
  {
    id: "qr",
    label: "Código e-kwanza / QR",
    description: "Pague através da app e-kwanza lendo o código QR ou introduzindo o código.",
  },
  {
    id: "reference",
    label: "Referência (EMIS)",
    description: "Pague num ATM ou Internet Banking com a referência gerada.",
  },
  {
    id: "multicaixaExpress",
    label: "Multicaixa Express",
    description: "Confirme o pagamento diretamente no seu telemóvel.",
  },
];

function formatKz(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PaymentStep({ amount, mobileNumber, onConfirmed }: PaymentStepProps) {
  const [method, setMethod] = useState<Method | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "paid" | "failed">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const referenceCodeRef = useRef(`EKZ${Date.now()}`);
  const pollingIdRef = useRef<string | null>(null);
  const pollingKindRef = useRef<"ticket" | "gpo" | null>(null);

  useEffect(() => {
    if (status !== "pending" || !pollingIdRef.current || !pollingKindRef.current) return;

    const interval = setInterval(async () => {
      try {
        const url =
          pollingKindRef.current === "ticket"
            ? `/api/payments/ekwanza/ticket/${pollingIdRef.current}`
            : `/api/payments/gpo/status/${pollingIdRef.current}`;

        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === "paid") {
          setStatus("paid");
          onConfirmed();
        } else if (data.status === "expired" || data.status === "failed" || data.status === "cancelled") {
          setStatus("failed");
        }
      } catch {
        // ignore transient polling errors, try again on the next tick
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const startQr = async () => {
    setLoading(true);
    try {
      const data = await postJson("/api/payments/ekwanza/ticket", {
        amount,
        referenceCode: referenceCodeRef.current,
        mobileNumber,
      });
      setQrCode(data.qrCode);
      setTicketCode(data.code);
      pollingIdRef.current = data.code;
      pollingKindRef.current = "ticket";
      setStatus("pending");
    } catch (error: any) {
      toast.error("Não foi possível gerar o código de pagamento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startGpo = async (gpoMethod: "reference" | "multicaixaExpress") => {
    setLoading(true);
    try {
      const data = await postJson("/api/payments/gpo/charge", {
        amount,
        method: gpoMethod,
        phoneNumber: gpoMethod === "multicaixaExpress" ? mobileNumber : undefined,
      });
      setReference(data.reference ?? data.merchantTransactionId);
      pollingIdRef.current = data.merchantTransactionId;
      pollingKindRef.current = "gpo";
      setStatus("pending");
    } catch (error: any) {
      toast.error("Não foi possível iniciar o pagamento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (selected: Method) => {
    setMethod(selected);
    setStatus("idle");
    setQrCode(null);
    setTicketCode(null);
    setReference(null);

    if (selected === "qr") startQr();
    else startGpo(selected);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <p className="text-sm text-primary-gray">Valor a pagar</p>
        <p className="text-2xl font-bold text-primary">{formatKz(amount)}</p>
      </div>

      {status === "paid" ? (
        <div className="rounded-2xl bg-green-50 ring-1 ring-green-200 p-4 text-green-700">
          Pagamento confirmado com sucesso! Vamos reencaminhar você para o nosso WhatsApp.
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {METHODS.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={loading}
                onClick={() => handleSelect(item.id)}
                className={`text-left p-4 rounded-2xl ring-1 transition-all duration-300 cursor-pointer ${
                  method === item.id
                    ? "ring-primary-500 bg-primary-100"
                    : "ring-black/5 bg-white hover:ring-primary-300 hover:-translate-y-0.5 hover:shadow-md"
                }`}>
                <p className="font-semibold text-primary-black">{item.label}</p>
                <p className="text-xs text-primary-gray mt-1">{item.description}</p>
              </button>
            ))}
          </div>

          {loading && <p className="text-sm text-primary-gray">A preparar pagamento...</p>}

          {method === "qr" && qrCode && (
            <div className="surface-card hover:translate-y-0 hover:shadow-sm flex flex-col items-center gap-2 p-4">
              <Image
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code de pagamento"
                width={220}
                height={220}
                unoptimized
              />
              <p className="text-sm text-primary-gray">Código: {ticketCode}</p>
              <p className="text-xs text-primary-gray">A aguardar confirmação do pagamento...</p>
            </div>
          )}

          {method === "reference" && reference && (
            <div className="surface-card hover:translate-y-0 hover:shadow-sm p-4 flex flex-col gap-1">
              <p className="text-sm text-primary-gray">Referência de pagamento</p>
              <p className="text-xl font-bold text-primary">{reference}</p>
              <p className="text-xs text-primary-gray">A aguardar confirmação do pagamento...</p>
            </div>
          )}

          {method === "multicaixaExpress" && status === "pending" && (
            <div className="surface-card hover:translate-y-0 hover:shadow-sm p-4">
              <p className="text-sm text-primary-gray">
                Confirme o pagamento na app Multicaixa Express no seu telemóvel ({mobileNumber}).
              </p>
              <p className="text-xs text-primary-gray mt-1">A aguardar confirmação do pagamento...</p>
            </div>
          )}

          {status === "failed" && (
            <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-4 text-red-700 text-sm">
              O pagamento não foi confirmado (expirado, recusado ou cancelado). Tente novamente.
            </div>
          )}
        </>
      )}
    </div>
  );
}
