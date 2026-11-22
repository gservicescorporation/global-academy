'use client';

import { useRouter } from 'next/navigation';
import { deleteMessageAction, setMessageReadAction } from '@/app/admin/actions';
import { useAction } from '@/components/admin/ui';

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const { pending, call } = useAction();

  return (
    <div className="mt-4 flex gap-4 text-sm font-semibold">
      <button type="button" disabled={pending} onClick={() => call(() => setMessageReadAction(id, !read))} className="text-royal hover:underline disabled:opacity-60">
        {read ? 'Marcar como nova' : 'Marcar como lida'}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Apagar esta mensagem?')) return;
          call(() => deleteMessageAction(id), { refresh: false }).then((res) => {
            if (res.ok) router.refresh();
          });
        }}
        className="text-red-600 hover:underline disabled:opacity-60"
      >
        Apagar
      </button>
    </div>
  );
}
