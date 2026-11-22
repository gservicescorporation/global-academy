/**
 * Logótipo recolorido com a cor da marca (máscara CSS sobre o PNG/SVG transparente do painel).
 * A imagem invisível dá o tamanho; a camada por cima pinta-a.
 */
export function BrandLogo({ src, alt, className = 'h-9', color = 'bg-ink' }: { src: string; alt: string; className?: string; color?: string }) {
  const mask = { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'left center', WebkitMaskPosition: 'left center' } as const;
  return (
    <span className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={`w-auto opacity-0 ${className}`} />
      <span aria-hidden className={`absolute inset-0 ${color}`} style={mask} />
    </span>
  );
}
