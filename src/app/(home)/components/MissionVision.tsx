import Image from "next/image";

export default function MissionVision() {
  return (
    <section className="bg-white lg:py-18 lg:px-24 max-lg:px-8 max-lg:py-12 w-full flex justify-center items-center">
      <div className="max-w-6xl w-full flex flex-wrap gap-12 items-center justify-center">
        <Image
          src={"/vision.png"}
          alt={"Mission and Vision Global Academy"}
          width={500}
          height={300}
        />

        <div className="max-w-lg w-full flex flex-col gap-4 max-lg:text-center max-lg:items-center  ">
          <h2 className="primary-title">Propósito</h2>
          <h3 className="text-2xl font-bold max-lg:text-lg">Missão</h3>
          {[
            "Capacitar líderes e profissionais com conhecimento de excelência, utilizando metodologias inovadoras e conteúdos alinhados às tendências globais, para impulsionar o sucesso no mercado.",
          ].map((text, index) => (
            <p
              key={index}
              className="text-gray-400 max-lg:text-justify max-lg:text-sm">
              {text}
            </p>
          ))}
          <h3 className="text-2xl font-bold max-lg:text-lg">Visão</h3>
          {[
            "Ser a principal referência em formação de líderes e profissionais de alto desempenho, promovendo inovação, crescimento e impacto positivo nos negócios e na sociedade.",
          ].map((text, index) => (
            <p
              key={index}
              className="text-gray-400 max-lg:text-justify max-lg:text-sm">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
