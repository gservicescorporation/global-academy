import Link from "next/link";
import EffectFadePictures from "./EffectFadePics";

export default function Hero() {
  return (
    <section className="flex justify-center items-center gap-24 lg:py-18 lg:px-24 max-lg:px-8 max-lg:py-12">
      <div className="w-full max-w-6xl flex flex-wrap justify-center items-center gap-12 max-lg:gap-6">
        <EffectFadePictures />

        <div className="flex flex-col gap-4 w-full max-w-lg max-lg:mx-auto max-lg:text-center">
          <h1 className="text-5xl font-bold max-lg:text-3xl">
            Global Academy – O Conhecimento que Transforma
          </h1>

          <p className="text-gray-500 max-lg:text-sm">
            Cursos de excelência para profissionais de alto nível.
          </p>

          <Link href={"/registration"} className="animate-pulse bg-primary cursor-pointer text-center hover:bg-white border border-primary hover:text-primary text-white rounded-md px-4 py-2 transition-colors duration-300">
            Quero me inscrever
          </Link>
        </div>
      </div>
    </section>
  );
}
