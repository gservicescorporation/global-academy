import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { getSettings } from '@/lib/queries';
import { logout } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [s, settings] = await Promise.all([requireAdmin(), getSettings()]);
  return (
    <AdminShell
      email={s.email}
      logoUrl={settings.logo_url}
      siteName={settings.site_name}
      logoutAction={logout}
      uploadMode={process.env.UPLOADTHING_TOKEN ? 'uploadthing' : 'local'}
    >
      {children}
    </AdminShell>
  );
}
