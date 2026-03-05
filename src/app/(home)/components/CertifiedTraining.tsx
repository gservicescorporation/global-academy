import Image from "next/image";

export default function CertifiedTraining() {
  return (
    <section className="flex justify-center items-center lg:py-18 lg:px-24 max-lg:px-8 max-lg:py-12 bg-secondary">
      <div className="max-w-6xl w-full flex flex-wrap justify-center gap-12 text-primary">
        <h1 className="text-4xl font-bold mx-auto max-lg:text-center max-lg:text-2xl">Formação Certificada</h1>

        <div className="flex flex-col gap-6 max-lg:gap-4 max-w-128.75 max-lg:text-center max-lg:items-center">
          <h2 className="font-semibold">
            Cursos de grande impacto profissional.
          </h2>
          <p className="text-gray-400 max-lg:text-sm">
            A Global Academy, uma divisão da Global Services Corporation,
            oferece cursos exclusivos para capacitação de líderes e
            profissionais que buscam excelência no mercado.{" "}
          </p>
          <h2 className="font-semibold">Somos certificados por:</h2>
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
