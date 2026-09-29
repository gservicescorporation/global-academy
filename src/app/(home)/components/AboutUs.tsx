import Image from "next/image";

export default function AboutUs() {
  return (
    <div
      id="#about"
      className="bg-white lg:py-20 lg:px-24 max-lg:px-8 max-lg:py-14 w-full flex justify-center items-center">
      <div className="max-w-6xl w-full flex flex-wrap gap-14 items-center justify-center">
        <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl shadow-primary/10 ring-1 ring-black/5">
          <Image
            src={"/about-us.png"}
            alt={"About Global Academy"}
            width={500}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="max-w-lg w-full flex flex-col gap-4 max-lg:text-center max-lg:items-center">
          <span className="primary-title">Sobre nós</span>
          <h3 className="text-3xl max-lg:text-xl font-bold text-primary-black">
            Por que fazer um curso na Global Academy?
          </h3>
          {[
            "A Global Academy, uma divisão da Global Services Corporation, oferece cursos exclusivos para capacitação de líderes e profissionais que buscam excelência no mercado. Com uma metodologia inovadora e conteúdos alinhados às tendências globais, preparamos você para os desafios do futuro.",
            "Nossos cursos são projetados para formar líderes, impulsionar carreiras e transformar negócios. Com conteúdos exclusivos e instrutores de referência, conectamos você às melhores práticas globais.",
          ].map((text, index) => (
            <p
              key={index}
              className="text-primary-gray max-lg:text-sm max-lg:text-justify">
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
