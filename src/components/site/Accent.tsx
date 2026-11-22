import { Fragment } from 'react';

/**
 * Texto entre *asteriscos* (convenção dos títulos no painel) ganha o marcador azul (.hl),
 * desenhado pelo GSAP quando o título entra no ecrã.
 */
export function Accent({ text, className = '' }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <span key={i} className={`hl ${className}`}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** Versão em texto simples (metadados, atributos alt). */
export const plain = (text?: string | null) => (text ?? '').replace(/\*/g, '');
