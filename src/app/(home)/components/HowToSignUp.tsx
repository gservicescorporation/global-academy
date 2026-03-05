import { Description } from "@radix-ui/react-dialog";
import Link from "next/link";
import { title } from "process";
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
    <div className="lg:py-18 lg:px-24 max-lg:px-8 max-lg:py-12 bg-primary w-full flex justify-center">
      <div className="text-center text-white items-center flex flex-col gap-14 max-lg:gap-8 w-full max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold max-lg:text-lg">
            Como fazer a inscrição?
          </h1>
          <p>Siga os passos abaixo, aproveite e faça já a sua inscrição.</p>
        </div>

        <ul className="flex-wrap flex gap-12 items-center justify-center">
          {steps.map((item, index) => (
            <React.Fragment key={index}>
              <li className="flex flex-col gap-2 items-center justify-center bg-secondary text-primary rounded-2xl py-4 px-6 w-64 h-52">
                <span className="bg-primary p-2 rounded-full text-lg text-secondary font-semibold w-12 h-12">
                  {item.stepNumber}
                </span>

                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{item.title}</span>

                  <span className="text-sm">{item.description}</span>
                </div>
              </li>

              {steps && (index + 1) % 3 !== 0 && index < steps.length - 1 && (
                <FaRightLong className="text-xl max-lg:hidden" />
              )}
            </React.Fragment>
          ))}
        </ul>

        <Link
          href="/courses"
          className="bg-white border border-white hover:bg-primary hover:text-white text-lg px-8 py-2 rounded-md text-primary font-bold animate-pulse hover:animate-none cursor-pointer transition-colors duration-300">
          Aderir à uma formação
        </Link>
      </div>
    </div>
  );
}
