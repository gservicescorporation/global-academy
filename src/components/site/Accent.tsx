import { Fragment } from 'react';

/** Mostra em serif itálico o texto entre *asteriscos* (convenção usada nos títulos do painel). */
export function Accent({ text, className = 'serif-accent' }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <span key={i} className={className}>
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
