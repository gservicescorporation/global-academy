import Image from "next/image";

export default function CertifiedTraining() {
  return (
    <section className="flex justify-center items-center lg:py-20 lg:px-24 max-lg:px-8 max-lg:py-14 bg-white">
      <div className="max-w-6xl w-full flex flex-wrap justify-center gap-12 text-primary-black">
        <h1 className="text-4xl font-bold mx-auto max-lg:text-center max-lg:text-2xl text-primary-black">
          Formação Certificada
        </h1>

        <div className="bg-secondary rounded-3xl p-8 flex flex-col gap-6 max-lg:gap-4 max-w-128.75 max-lg:text-center max-lg:items-center">
          <h2 className="font-semibold text-primary-500">
            Cursos de grande impacto profissional.
          </h2>
          <p className="text-primary-gray max-lg:text-sm">
            A Global Academy, uma divisão da Global Services Corporation,
            oferece cursos exclusivos para capacitação de líderes e
            profissionais que buscam excelência no mercado.{" "}
          </p>
          <h2 className="font-semibold text-primary-500">Somos certificados por:</h2>
          <Image
            src={"/inefop.png"}
            alt={""}
            width={100}
            height={80}
          />
        </div>
      </div>
    </section>
  );
}
