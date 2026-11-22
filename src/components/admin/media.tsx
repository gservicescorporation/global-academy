'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { ChevronLeft, ChevronRight, ImagePlus, Link2, Plus, Trash2, X } from 'lucide-react';
import { createContext, useContext, useId, useRef, useState } from 'react';
import type { UploadRouter } from '@/app/api/uploadthing/core';
import { useToast } from './ToastProvider';
import { FieldShell, inputCls, Spinner } from './ui';

const { useUploadThing } = generateReactHelpers<UploadRouter>();

/** "uploadthing" quando há UPLOADTHING_TOKEN; senão o disco local do servidor. */
export const UploadModeContext = createContext<'uploadthing' | 'local'>('local');

const SAFE_URL = /^(https?:\/\/|\/)[^\s<>"']*$/i;
const isVideo = (u: string) => /\.(mp4|mov|webm)(\?|$)/i.test(u);

/** Envia ficheiros e devolve os URLs públicos; expõe o progresso (0–100). */
function useUploader(video = false) {
  const mode = useContext(UploadModeContext);
  const { push } = useToast();
  const [progress, setProgress] = useState<number | null>(null);
  const { startUpload } = useUploadThing(video ? 'media' : 'image', { onUploadProgress: (p) => setProgress(p) });

  const local = async (files: File[]) => {
    const urls: string[] = [];
    for (const [i, file] of files.entries()) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Falha no envio.');
      urls.push(data.url);
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    return urls;
  };

  const run = async (files: File[]): Promise<string[]> => {
    const accepted = files.filter((f) => f.type.startsWith('image/') || (video && f.type.startsWith('video/')));
    if (accepted.length < files.length) push({ type: 'error', message: 'Alguns ficheiros foram ignorados (formato não suportado).' });
    if (!accepted.length) return [];
    setProgress(0);
    try {
      if (mode === 'local') return await local(accepted);
      const res = await startUpload(accepted);
      return (res ?? []).map((r) => r.ufsUrl);
    } catch (err) {
      push({ type: 'error', message: (err as Error).message || 'Falha no envio.' });
      return [];
    } finally {
      setProgress(null);
    }
  };
  return { progress, run };
}

function Preview({ src, contain = false }: { src: string; contain?: boolean }) {
  if (isVideo(src)) return <video src={src} muted className="h-full w-full object-cover" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={`h-full w-full ${contain ? 'object-contain p-3' : 'object-cover'}`} />;
}

export function ImageField({
  label,
  hint,
  error,
  value,
  onChange,
  aspect = 'aspect-video',
  video = false,
  contain = false,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  aspect?: string;
  video?: boolean;
  contain?: boolean;
  required?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const { progress, run } = useUploader(video);
  const urlOk = !value || SAFE_URL.test(value);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const [url] = await run([files[0]]);
    if (url) onChange(url);
  };

  return (
    <FieldShell label={label} hint={hint} error={error ?? (urlOk ? undefined : 'Use um endereço que comece por https:// ou /.')} htmlFor={id} required={required}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`group relative overflow-hidden rounded-2xl border-2 border-dashed bg-background transition-colors ${over ? 'border-royal bg-royal/5' : 'border-line'} ${aspect}`}
      >
        {value && urlOk ? (
          <>
            <Preview src={value} contain={contain} />
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/75 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-tertiary transition hover:text-royal"
          >
            <ImagePlus className="h-6 w-6" aria-hidden />
            <span className="text-xs">Clique ou arraste {video ? 'uma imagem ou vídeo' : 'uma imagem'} para aqui</span>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 text-xs font-medium text-ink" role="status">
            <Spinner className="h-5 w-5 text-royal" /> A enviar… {progress}%
            <span className="h-1 w-32 overflow-hidden rounded-full bg-line">
              <span className="block h-full bg-royal transition-[width]" style={{ width: `${progress}%` }} />
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-tertiary" aria-hidden />
          <input id={id} value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="…ou cole o link da imagem" className={`${inputCls} pl-9`} />
        </div>
        <button type="button" onClick={() => input.current?.click()} className="shrink-0 rounded-xl border border-line bg-white px-3 text-xs font-medium hover:border-royal hover:text-royal">
          Carregar
        </button>
      </div>
      <input ref={input} type="file" accept={video ? 'image/*,video/mp4,video/webm' : 'image/*'} hidden onChange={(e) => onFiles(e.target.files)} />
    </FieldShell>
  );
}

export function ImageListField({
  label,
  hint,
  value,
  onChange,
  tile = 'aspect-[4/3]',
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  tile?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { progress, run } = useUploader();
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const [over, setOver] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls = await run(Array.from(files));
    if (urls.length) onChange([...value, ...urls]);
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-ink">
          {label} <span className="font-normal text-tertiary">({value.length})</span>
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPasting((v) => !v)} className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium hover:border-royal hover:text-royal">
            Colar links
          </button>
          <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-royal">
            Carregar ficheiros
          </button>
        </div>
      </div>
      {hint && <span className="text-xs text-tertiary">{hint}</span>}

      {pasting && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3">
          <textarea rows={3} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Um link por linha" className={inputCls} aria-label="Links das imagens" />
          <button
            type="button"
            onClick={() => {
              const urls = pasted
                .split(/\s+/)
                .map((s) => s.trim())
                .filter((s) => SAFE_URL.test(s));
              onChange([...value, ...urls]);
              setPasted('');
              setPasting(false);
            }}
            className="self-end rounded-lg bg-royal px-3 py-1.5 text-xs font-medium text-white"
          >
            Adicionar
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`grid grid-cols-2 gap-3 rounded-2xl border-2 border-dashed p-3 transition-colors sm:grid-cols-3 lg:grid-cols-4 ${over ? 'border-royal bg-royal/5' : 'border-line bg-background'}`}
      >
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className={`group relative overflow-hidden rounded-xl bg-white ring-1 ring-line ${tile}`}>
            <Preview src={src} />
            <span className="absolute top-1.5 left-1.5 rounded-md bg-ink/75 px-1.5 text-[10px] font-semibold text-white">{i + 1}</span>
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <div className="flex gap-1">
                <button type="button" aria-label={`Mover imagem ${i + 1} para trás`} onClick={() => move(i, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink shadow">
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" aria-label={`Mover imagem ${i + 1} para a frente`} onClick={() => move(i, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink shadow">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <button type="button" aria-label={`Remover imagem ${i + 1}`} onClick={() => onChange(value.filter((_, k) => k !== i))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow">
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => input.current?.click()} className={`flex flex-col items-center justify-center gap-1 rounded-xl text-tertiary transition hover:bg-white hover:text-royal ${tile}`}>
          {progress !== null ? (
            <>
              <Spinner className="h-5 w-5 text-royal" />
              <span className="text-xs">{progress}%</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" aria-hidden />
              <span className="text-xs">Adicionar (pode escolher várias)</span>
            </>
          )}
        </button>
      </div>
      <input ref={input} type="file" multiple accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
