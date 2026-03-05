import Image from "next/image";
import Link from "next/link";
import { LuSendHorizontal } from "react-icons/lu";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-primary-500 w-full flex justify-center items-center lg:py-14 lg:px-16 max-lg:px-8 max-lg:py-12">
      <div className="max-w-6xl flex flex-col w-full gap-4 text-white text-sm">
        <ul className="flex flex-wrap w-full justify-between gap-4 max-lg:gap-14">
          <li className="lg:py-11 w-72.75 max-lg:w-full flex flex-col gap-3.5">
            <Image
              src={"/logo-black.png"}
              alt={"Global Services Corporation"}
              width={100}
              className="invert"
              height={42}
            />

            <p>
              Global Academy – Onde o conhecimento abre portas para o sucesso.
            </p>
          </li>

          <li className="flex flex-col gap-3.5 lg:py-11">
            <h2 className="font-semibold">Contactos</h2>

            <Link href={"tel:+244222731031"}>+244 222 731 031</Link>
            <Link href={"tel:+244941064919"}>+244 941 064 919</Link>
            <Link href={"mailto:globalacademy@globalsc.ao"}>
              globalacademy@globalsc.ao
            </Link>
          </li>

          <li className="flex flex-col gap-3.5 lg:py-11">
            <h2 className="font-semibold">Mídias Sociais</h2>

            <div className="flex gap-4 items-center">
              <Link target="_blank" href={"https://www.facebook.com/people/GlobalscAcademy/61575204794896/"}>
                <Facebook />
              </Link>
              <Link target="_blank" href={"https://www.instagram.com/globalacademy025"}>
                <Instagram />
              </Link>
              <Link  target="_blank" href={"https://www.linkedin.com/company/globalsc-academy/"}>
                <Linkedin />
              </Link>
            </div>
          </li>

          <li className="flex flex-col gap-3.5 lg:py-11 max-lg:w-full w-63.25">
            <h2 className="font-semibold">Newsletter</h2>

            <p>Fique por dentro do conhecimento que transforma</p>

            <form
              action=""
              className="bg-white rounded-md justify-between flex">
              <input
                type="text"
                className="w-full outline-none px-4 py-2 placeholder:text-gray-400 text-black"
                placeholder="Insira o seu email"
              />

              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md">
                <LuSendHorizontal />
              </button>
            </form>
          </li>
          
        </ul>

        <p className="text-sm max-lg:text-xs">
          © {new Date().getFullYear()} Global Services Corporation. Todos os
          direitos reservados.
        </p>
      </div>
    </footer>
  );
}
