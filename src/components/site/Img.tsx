import Image, { type ImageProps } from 'next/image';

/**
 * next/image para imagens vindas do painel: caminhos locais (/media, /images) são otimizados;
 * ligações externas coladas no painel são servidas como estão, sem abrir o otimizador a qualquer domínio.
 */
export function Img({ src, unoptimized, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  const local = src.startsWith('/') && !src.startsWith('//');
  return <Image src={src} unoptimized={unoptimized ?? !local} {...props} />;
}
