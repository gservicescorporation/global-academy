'use client';

import { Trash2 } from 'lucide-react';
import { removeAdminAction } from '@/app/admin/actions';
import { btn, useAction } from '@/components/admin/ui';

export function AdminRow({ admin, isSelf }: { admin: { id: string; name: string; email: string; lastLoginAt: Date | null }; isSelf: boolean }) {
  const { pending, call } = useAction();
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">
          {admin.name} {isSelf && <span className="text-xs font-normal text-tertiary">(você)</span>}
        </p>
        <p className="truncate text-sm text-tertiary">{admin.email}</p>
        <p className="text-xs text-tertiary">{admin.lastLoginAt ? `Último acesso: ${new Date(admin.lastLoginAt).toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' })}` : 'Nunca entrou'}</p>
      </div>
      {!isSelf && (
        <button
          type="button"
          disabled={pending}
          aria-label={`Remover ${admin.name}`}
          onClick={() => {
            if (window.confirm(`Remover o acesso de ${admin.name}?`)) call(() => removeAdminAction(admin.id));
          }}
          className={btn.icon}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </li>
  );
}
