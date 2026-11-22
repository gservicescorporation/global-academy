import { SettingsForm } from '@/components/admin/SettingsForm';
import { PageTitle } from '@/components/admin/ui';
import { getSettings } from '@/lib/queries';
import { SETTINGS } from '@/lib/settings-defs';

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <>
      <PageTitle title="Conteúdo da página" text="Textos e imagens da página inicial, de empresas, de contactos e do rodapé." />
      <SettingsForm defs={SETTINGS} values={s} />
    </>
  );
}
