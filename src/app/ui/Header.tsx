"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { MdArrowOutward } from "react-icons/md";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import NavMenu from "./NavMenu";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/courses?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="relative sticky top-0 z-50 flex text-white justify-center max-lg:justify-between items-center w-full py-3 px-8 max-lg:px-8 bg-primary/55 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_-12px_rgba(11,18,51,0.45)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent"
      />

      <div className="justify-between flex items-center w-full lg:max-w-6xl relative ">
        <Link
          href={"/"}
          className="p-2 rounded-md">
          <Image
            src={"/logo-black.png"}
            alt={"Logotipo Global Services Corporation"}
            width={80}
            height={34}
            className="object-contain w-24 max-lg:w-20 invert"
          />
        </Link>

        <div className="flex items-center">
          <button
            onClick={() => setMenuOpen(true)}
            className={`lg:hidden text-2xl text-white cursor-pointer ${
              isMenuOpen && "hidden"
            }`}>
            <FiMenu />
          </button>

          <button
            onClick={() => setMenuOpen(false)}
            className={`lg:hidden text-2xl text-white cursor-pointer ${
              !isMenuOpen && "hidden"
            }`}>
            <IoMdClose />
          </button>

          <div
            className={`w-full flex items-center justify-between gap-4 px-4 rounded-lg max-lg:absolute max-lg:rounded-2xl left-0 max-lg:top-15 max-lg:flex-col max-lg:w-full transition-all duration-500 ease-in-out transform ${
              isMenuOpen
                ? "max-lg:translate-y-0 max-lg:opacity-100 max-lg:visible"
                : "max-lg:-translate-y-5 max-lg:opacity-0 max-lg:invisible"
            }`}>

            <div className="max-lg:hidden flex gap-2 items-center w-full bg-white/10 backdrop-blur-sm border border-white/20 max-w-72 text-white/60 px-4 py-2 rounded-full shadow-inner focus-within:border-white/40 transition-colors duration-300">
              <CiSearch
                className="text-2xl cursor-pointer text-white/80"
                onClick={handleSearch}
              />

              <input
                type="text"
                placeholder="Pesquisar cursos"
                className="w-full outline-none bg-transparent text-white placeholder-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <ul className="p-2 max-lg:bg-primary/70 max-lg:backdrop-blur-2xl max-lg:border max-lg:border-white/10 max-lg:shadow-2xl max-lg:rounded-2xl max-lg:w-full lg:items-center max-lg:flex-col justify-end text-sm font-semibold flex gap-2">
              <NavMenu />
              <Link
                href={"/registration"}
                className="flex justify-center font-semibold gap-2 items-center min-w-34 px-4 py-2 rounded-full bg-white text-primary-500 shadow-md ring-1 ring-white/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Inscrever-se <MdArrowOutward />
              </Link>
            </ul>
          </div>
        </div>

        <Link
          href={"/registration"}
          className="hidden font-semibold gap-2 items-center px-4 py-2 rounded-full bg-white text-primary-500 shadow-md ring-1 ring-white/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          Inscrever-se <MdArrowOutward />
        </Link>
      </div>
    </header>
  );
}
