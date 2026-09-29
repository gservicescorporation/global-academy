import Link from "next/link";
import React from "react";
import { FaRightLong } from "react-icons/fa6";

export default function HowToSignUp() {
  const steps = [
    {
      stepNumber: 1,
      title: "Acesse o site",
      description: "Vá para o menu e clique em 'Cursos' e depois em 'Ver todos'.",
    },
    {
      stepNumber: 2,
      title: "Escolha o curso",
      description:
        "Procure o curso que deseja, e veja todas as informações sobre o curso.",
    },
    {
      stepNumber: 3,
      title: "Fazer inscrição",
      description: `Clique no botão "Inscrever-se" que levará para o formulário de inscrição.`,
    },
    {
      stepNumber: 4,
      title: "Preencher formulário",
      description: `Em seguida preencha o formulário de inscrição, escolha o curso.`,
    },
    {
      stepNumber: 5,
      title: "E pronto!",
      description: `Depois de enviar o formulário, entraremos em contacto.`,
    },
  ];


  return (
    <div className="lg:py-20 lg:px-24 max-lg:px-8 max-lg:py-14 bg-secondary w-full flex justify-center">
      <div className="text-center items-center flex flex-col gap-14 max-lg:gap-8 w-full max-w-6xl">
        <div className="flex flex-col items-center gap-3">
          <span className="primary-title">Como funciona</span>
          <h1 className="text-3xl font-bold max-lg:text-xl text-primary-black">
            Como fazer a inscrição?
          </h1>
          <p className="text-primary-gray">Siga os passos abaixo, aproveite e faça já a sua inscrição.</p>
        </div>

        <ul className="flex-wrap flex gap-8 items-center justify-center">
          {steps.map((item, index) => (
            <React.Fragment key={index}>
              <li className="surface-card flex flex-col gap-2 items-center justify-center text-primary-black py-4 px-6 w-64 h-52">
                <span className="flex items-center justify-center bg-linear-to-br from-primary-500 to-primary p-2 rounded-full text-lg text-white font-semibold w-12 h-12">
                  {item.stepNumber}
                </span>

                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{item.title}</span>

                  <span className="text-sm text-primary-gray">{item.description}</span>
                </div>
              </li>

              {steps && (index + 1) % 3 !== 0 && index < steps.length - 1 && (
                <FaRightLong className="text-xl max-lg:hidden text-primary-300" />
              )}
            </React.Fragment>
          ))}
        </ul>

        <Link
          href="/courses"
          className="primary-btn text-lg px-8 py-2.5">
          Aderir à uma formação
        </Link>
      </div>
    </div>
  );
}
