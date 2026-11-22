'use client';

import { setEnrollmentStatusAction } from '@/app/admin/actions';
import { useAction } from '@/components/admin/ui';
import type { EnrollmentStatus } from '@/lib/entities';

export function EnrollmentStatusSelect({ id, status }: { id: string; status: EnrollmentStatus }) {
  const { pending, call } = useAction();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => call(() => setEnrollmentStatusAction(id, e.target.value), { success: 'Estado atualizado.' })}
      className="min-h-10 justify-self-start rounded-xl border border-line bg-paper px-3 py-2 text-sm disabled:opacity-60"
      aria-label="Estado da inscrição"
    >
      <option value="pending">Pendente</option>
      <option value="paid">Pago</option>
      <option value="cancelled">Cancelada</option>
    </select>
  );
}
