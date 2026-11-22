import { PageTitle } from '@/components/admin/ui';
import { getSession } from '@/lib/auth';
import { listAdmins } from '@/server/users';
import { NewAdminForm } from './NewAdminForm';
import { AdminRow } from './AdminRow';
import { ChangePasswordForm } from './ChangePasswordForm';

export default async function UsersAdmin() {
  const [admins, session] = await Promise.all([listAdmins(), getSession()]);
  return (
    <>
      <PageTitle title="Utilizadores" text="Quem tem acesso ao painel." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
          <h2 className="text-base font-semibold text-ink">Administradores</h2>
          <ul className="mt-5 grid gap-3">
            {admins.map((a) => (
              <AdminRow key={a.id} admin={a} isSelf={a.id === session?.uid} />
            ))}
          </ul>
        </section>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
            <h2 className="text-base font-semibold text-ink">Adicionar administrador</h2>
            <NewAdminForm />
          </section>
          <section className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
            <h2 className="text-base font-semibold text-ink">A minha palavra-passe</h2>
            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </>
  );
}
