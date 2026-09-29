import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";
import EffectFadePictures from "./EffectFadePics";

export default function Hero() {
  return (
    <section className="relative overflow-hidden flex justify-center items-center gap-24 lg:py-20 lg:px-24 max-lg:px-8 max-lg:py-14">
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative w-full max-w-6xl flex flex-wrap justify-center items-center gap-12 max-lg:gap-6">
        <div className="flex flex-col gap-5 w-full max-w-lg max-lg:mx-auto max-lg:text-center max-lg:order-2">
          <span className="primary-title">O conhecimento que transforma</span>

          <h1 className="text-5xl font-extrabold leading-tight max-lg:text-3xl text-primary-black">
            Global Academy –{" "}
            <span className="text-primary-500">O Conhecimento que Transforma</span>
          </h1>

          <p className="text-primary-gray max-lg:text-sm">
            Cursos de excelência para profissionais de alto nível.
          </p>

          <Link
            href={"/registration"}
            className="primary-btn inline-flex w-fit max-lg:mx-auto items-center gap-2">
            Quero me inscrever <MdArrowOutward />
          </Link>
        </div>

        <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-black/5 max-lg:order-1">
          <EffectFadePictures />
        </div>
      </div>
    </section>
  );
}
