'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { deleteCourseAction, saveCourseAction } from '@/app/admin/actions';
import { Repeater, StringList } from '@/components/admin/Repeater';
import { ImageField, ImageListField } from '@/components/admin/media';
import { Select, TextArea, TextInput, Toggle, btn, useAction, useUnsavedWarning } from '@/components/admin/ui';
import type { CourseForm, SessionInput } from '@/server/courses';

const TABS = ['Geral', 'Aparência', 'Programa', 'Turmas', 'Formadores', 'Preços', 'FAQ', 'Galeria'] as const;
type Tab = (typeof TABS)[number];

const STATUS_OPTIONS = [
  { value: 'soon', label: 'Em breve' },
  { value: 'open', label: 'Inscrições abertas' },
  { value: 'done', label: 'Realizada' },
];
const CURRENCY_OPTIONS = [
  { value: 'AOA', label: 'Kwanza (AOA)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dólar (USD)' },
];
const LEVEL_OPTIONS = ['Iniciante', 'Intermédio', 'Avançado'].map((v) => ({ value: v, label: v }));

export function CourseEditor({ initial, trainers }: { initial: CourseForm; trainers: { value: string; label: string }[] }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [initialData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>('Geral');
  const { pending, call } = useAction();
  const [deleting, setDeleting] = useState(false);
  const dirty = JSON.stringify(data) !== JSON.stringify(initialData);
  useUnsavedWarning(dirty);
  const tabId = useId();

  const set = <K extends keyof CourseForm>(key: K, v: CourseForm[K]) => setData((d) => ({ ...d, [key]: v }));
  const setContent = <K extends keyof CourseForm['content']>(key: K, v: CourseForm['content'][K]) => setData((d) => ({ ...d, content: { ...d.content, [key]: v } }));

  const tabErrorField: Record<Tab, string[]> = {
    Geral: ['title', 'slug', 'status', 'area', 'shortDescription', 'description', 'focus'],
    Aparência: ['imageUrl'],
    Programa: ['content.modules'],
    Turmas: ['sessions'],
    Formadores: ['trainerIds'],
    Preços: ['price', 'currency', 'duration', 'dateLabel', 'modality', 'venue', 'language', 'certificate', 'level', 'published', 'featured', 'position'],
    FAQ: ['content.faq'],
    Galeria: ['content.gallery'],
  };
  const tabHasError = (t: Tab) => tabErrorField[t].some((f) => Object.keys(errors).some((e) => e === f || e.startsWith(`${f}.`) || e.startsWith(`${f}[`)));

  async function onSave() {
    const res = await call(() => saveCourseAction(data.id, data), { success: 'Curso guardado.', refresh: false });
    if (res.ok && res.data) {
      setErrors({});
      router.push(`/admin/cursos/${res.data.id}`);
      router.refresh();
    } else {
      setErrors(res.ok ? {} : (res.fields ?? {}));
      const firstField = res.ok ? undefined : Object.keys(res.fields ?? {})[0];
      const failedTab = TABS.find((t) => firstField && tabErrorField[t].some((f) => firstField === f || firstField.startsWith(`${f}.`) || firstField.startsWith(`${f}[`)));
      if (failedTab) setTab(failedTab);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (!window.confirm('Apagar este curso? Só é possível se não tiver inscrições.')) return;
    setDeleting(true);
    const res = await call(() => deleteCourseAction(data.id as string), { refresh: false });
    setDeleting(false);
    if (res.ok) router.push('/admin/cursos');
  }

  return (
    <div className="grid gap-6 pb-24">
      {dirty && <div role="status" className="sticky top-[88px] z-20 rounded-2xl bg-gold-soft px-4 py-2.5 text-sm font-medium text-ink shadow-sm">Tem alterações por guardar.</div>}

      <div role="tablist" aria-label="Secções do curso" className="flex flex-wrap gap-1 rounded-2xl bg-background p-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${tabId}-${t}`}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === t ? 'bg-paper text-royal shadow-sm' : 'text-tertiary hover:text-ink'}`}
          >
            {t}
            {tabHasError(t) && <span aria-hidden className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-600" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`${tabId}-${tab}`} className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
        {tab === 'Geral' && (
          <div className="grid gap-5">
            <TextInput label="Título" value={data.title} onChange={(v) => set('title', v)} error={errors.title} required />
            <TextInput label="Endereço (slug)" value={data.slug} onChange={(v) => set('slug', v)} error={errors.slug} hint="Deixe vazio para gerar automaticamente a partir do título." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Estado" value={data.status} onChange={(v) => set('status', v as CourseForm['status'])} options={STATUS_OPTIONS} error={errors.status} required />
              <TextInput label="Área de formação" value={data.area} onChange={(v) => set('area', v)} error={errors.area} hint="Ex.: Seguros, Gestão e liderança." />
            </div>
            <TextArea label="Descrição curta" rows={2} value={data.shortDescription} onChange={(v) => set('shortDescription', v)} error={errors.shortDescription} hint="Aparece nos cartões." required />
            <TextArea label="Descrição completa" rows={7} value={data.description} onChange={(v) => set('description', v)} error={errors.description} hint="Um parágrafo por linha." />
            <TextArea label="Foco do programa" rows={3} value={data.focus} onChange={(v) => set('focus', v)} error={errors.focus} hint="Frase de destaque sobre o objetivo geral." />
          </div>
        )}

        {tab === 'Aparência' && (
          <div className="grid gap-5">
            <ImageField label="Imagem de capa" value={data.imageUrl} onChange={(v) => set('imageUrl', v)} aspect="aspect-video" error={errors.imageUrl} />
          </div>
        )}

        {tab === 'Programa' && (
          <Repeater<CourseForm['content']['modules'][number]>
            label="Módulos"
            hint="Cada módulo pode ter vários tópicos."
            items={data.content.modules}
            onChange={(v) => setContent('modules', v)}
            create={() => ({ title: '', topics: [] })}
            itemTitle={(m) => m.title}
            addLabel="Adicionar módulo"
            empty="Ainda não há módulos."
            error={errors['content.modules']}
            render={(m, update) => (
              <>
                <TextInput label="Título do módulo" value={m.title} onChange={(v) => update({ title: v })} />
                <StringList label="Tópicos" value={m.topics} onChange={(v) => update({ topics: v })} placeholder="Ex.: Introdução à gestão de sinistros" />
              </>
            )}
          />
        )}

        {tab === 'Turmas' && <SessionsTab sessions={data.sessions} onChange={(v) => set('sessions', v)} error={errors.sessions} />}

        {tab === 'Formadores' && (
          <div className="grid gap-2 sm:grid-cols-2">
            {trainers.length === 0 && <p className="text-sm text-tertiary">Adicione formadores primeiro.</p>}
            {trainers.map((t) => (
              <label key={t.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-2.5 has-checked:border-royal has-checked:bg-royal/5">
                <input
                  type="checkbox"
                  checked={data.trainerIds.includes(t.value)}
                  onChange={(e) => set('trainerIds', e.target.checked ? [...data.trainerIds, t.value] : data.trainerIds.filter((v) => v !== t.value))}
                  className="h-4 w-4 accent-royal"
                />
                {t.label}
              </label>
            ))}
          </div>
        )}

        {tab === 'Preços' && (
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Preço por participante" type="number" step="any" value={data.price} onChange={(v) => set('price', Number(v))} error={errors.price} hint="0 mostra “Sob consulta”." />
              <Select label="Moeda" value={data.currency} onChange={(v) => set('currency', v as CourseForm['currency'])} options={CURRENCY_OPTIONS} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Carga horária" value={data.duration} onChange={(v) => set('duration', v)} hint="Ex.: 4 horas · 2 dias" />
              <TextInput label="Data (texto)" value={data.dateLabel} onChange={(v) => set('dateLabel', v)} hint="Usado quando ainda não há turma marcada." />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Modalidade" value={data.modality} onChange={(v) => set('modality', v)} />
              <TextInput label="Local" value={data.venue} onChange={(v) => set('venue', v)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Idioma" value={data.language} onChange={(v) => set('language', v)} />
              <TextInput label="Entidade certificadora" value={data.certificate} onChange={(v) => set('certificate', v)} hint="Ex.: INEFOP. Deixe vazio se não houver." />
            </div>
            <Select label="Nível" value={data.level} onChange={(v) => set('level', v)} options={LEVEL_OPTIONS} placeholder="—" />
            <TextInput label="Ordem" type="number" value={data.position} onChange={(v) => set('position', Number(v))} hint="Menor número aparece primeiro." />
            <Toggle label="Mostrar em destaque na página inicial" checked={data.featured} onChange={(v) => set('featured', v)} />
            <Toggle label="Publicado" checked={data.published} onChange={(v) => set('published', v)} />
          </div>
        )}

        {tab === 'FAQ' && (
          <Repeater<CourseForm['content']['faq'][number]>
            label="Perguntas frequentes"
            items={data.content.faq}
            onChange={(v) => setContent('faq', v)}
            create={() => ({ q: '', a: '' })}
            itemTitle={(f) => f.q}
            addLabel="Adicionar pergunta"
            empty="Ainda não há perguntas."
            error={errors['content.faq']}
            render={(f, update) => (
              <>
                <TextInput label="Pergunta" value={f.q} onChange={(v) => update({ q: v })} />
                <TextArea label="Resposta" rows={3} value={f.a} onChange={(v) => update({ a: v })} />
              </>
            )}
          />
        )}

        {tab === 'Galeria' && <ImageListField label="Galeria de fotos" value={data.content.gallery} onChange={(v) => setContent('gallery', v)} hint="Carregue fotos ou cole links (ex.: fotos da edição já realizada)." />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur-xl lg:left-[272px] lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <button type="button" onClick={onSave} disabled={pending} className={btn.primary}>
              {pending ? 'A guardar…' : 'Guardar'}
            </button>
            <button type="button" onClick={() => router.push('/admin/cursos')} className={btn.secondary}>
              Cancelar
            </button>
          </div>
          {data.id && (
            <button type="button" onClick={onDelete} disabled={deleting} className={btn.danger}>
              {deleting ? 'A apagar…' : 'Apagar curso'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionsTab({ sessions, onChange, error }: { sessions: SessionInput[]; onChange: (v: SessionInput[]) => void; error?: string }) {
  return (
    <Repeater<SessionInput>
      label="Turmas"
      hint="Datas, local e vagas de cada edição deste curso."
      items={sessions}
      onChange={onChange}
      create={() => ({ startDate: '', endDate: '', location: '', seats: 20, published: true })}
      itemTitle={(s) => (s.startDate ? `${s.startDate} → ${s.endDate || '…'}` : 'Nova turma')}
      addLabel="Adicionar turma"
      empty="Ainda não há turmas marcadas."
      error={error}
      render={(s, update) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Data de início" type="date" value={s.startDate} onChange={(v) => update({ startDate: v })} required />
            <TextInput label="Data de fim" type="date" value={s.endDate} onChange={(v) => update({ endDate: v })} required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Local" value={s.location} onChange={(v) => update({ location: v })} />
            <TextInput label="Vagas" type="number" value={s.seats} onChange={(v) => update({ seats: Number(v) })} hint={s.taken ? `${s.taken} já inscritos.` : undefined} />
          </div>
          <Toggle label="Publicada" checked={s.published} onChange={(v) => update({ published: v })} />
        </>
      )}
    />
  );
}
