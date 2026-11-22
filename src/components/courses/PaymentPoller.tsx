'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Enquanto o pagamento está pendente, volta a pedir a página a cada 6 s (máx. 15 min). */
export function PaymentPoller() {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - started > 15 * 60_000) return clearInterval(t);
      router.refresh();
    }, 6000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
