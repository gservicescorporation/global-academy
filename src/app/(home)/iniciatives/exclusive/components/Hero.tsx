import Link from "next/link";
import TimerLeft from "./TimerLeft";

export default function Hero() {
  return (
    <section className="flex w-full items-center justify-center relative h-screen max-lg:h-100">
      <video
        src={
          "https://global-services-corporation.github.io/images/miguel_relvas_confirmado.mp4"
        }
        muted
        loop
        playsInline
        autoPlay={true}
        className="pointer-events-none object-cover object-top w-full h-full rounded-lg"
      />

      <div className="absolute top-0 bg-gradient-to-t from-primary/50 to-primary/40  w-full h-full flex justify-center items-center">
        <div className="max-w-3xl w-full gap-8 h-full items-center justify-center flex flex-col py-24 max-lg:py-8 px-16 max-lg:px-8 text-white">
          <h1 className="hidden font-bold text-center text-4xl max-lg:text-2xl max-w-2xl">
            Programa Executivo em Gestão Estratégica de Organizações
          </h1>

          <Link
            href={"/registration"}
            className="px-12 py-4 text-2xl font-bold rounded-md bg-transparent hover:bg-orange-500 border border-white transition-colors duration-300 text-white cursor-pointer">
            Participar
          </Link>
          <TimerLeft />
        </div>
      </div>
    </section>
  );
}
