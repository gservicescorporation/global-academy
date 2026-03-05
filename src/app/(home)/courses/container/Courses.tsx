"use client";

import { useEffect, useState } from "react";
import { productsData } from "@/app/data/productsData";
import HeroTitle from "@/app/ui/HeroTitle";
import Product from "../../components/ProductCard";
import { Pagination } from "@mui/material";
import { CiFilter } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 6;

export default function Courses() {
  const [page, setPage] = useState(1);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkload, setSelectedWorkload] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState("");

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredCourses = productsData.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedWorkload === "" || product.workload === selectedWorkload) &&
      (selectedCertificate === "" ||
        product.certificate === selectedCertificate)
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const displayedCourses = filteredCourses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section
      id="courses"
      className="flex flex-col justify-center items-center w-full">
      <HeroTitle
        description={
          "Transforme seu futuro com os cursos da Global Academy! Conhecimento de alto nível para líderes e profissionais que querem ir além."
        }
        title={"Cursos"}
      />

      <ul className="flex min-h-screen flex-wrap gap-x-3 gap-y-8 items-center px-8 py-12 justify-start max-lg:justify-center max-w-5xl w-full">
        <div className="flex justify-between gap-8 h-10 max-lg:gap-2 w-full">
          <div className="w-4/5 bg-gray-100 rounded-md py-1 px-5 flex justify-between items-center gap-2">
            <input
              type="text"
              id="search"
              className="outline-none w-full bg-transparent"
              placeholder="Pesquisar curso"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoIosSearch className="text-gray-500" />
          </div>

          <div className="relative w-1/5">
            <button
              onClick={() => setFilterOpen(!isFilterOpen)}
              className="w-full h-full hover:cursor-pointer bg-gray-100 rounded-md flex justify-center items-center gap-1 group hover:text-white hover:bg-primary transition-colors duration-500">
              <CiFilter className="group-hover:text-white" />
              <span className="max-lg:hidden">Filtrar</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg p-3">
                <div className="mb-2">
                  <label className="text-sm">Carga Horária</label>
                  <select
                    className="w-full border rounded p-1"
                    value={selectedWorkload}
                    onChange={(e) => setSelectedWorkload(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="10h">10h</option>
                    <option value="12h">12h</option>
                    <option value="15h">15h</option>
                    <option value="22h">22h</option>
                    <option value="30h">30h</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm">Certificação</label>
                  <select
                    className="w-full border rounded p-1"
                    value={selectedCertificate}
                    onChange={(e) => setSelectedCertificate(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="INEFOP">INEFOP</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {displayedCourses.length > 0 ? (
          displayedCourses.map((product, index) => (
            <li key={index}>
              <Product
                coverImg={product.coverImg}
                title={product.title}
                description={product.description}
                id={product.id}
                modality={product.modality}
                certificate={product.certificate}
                locale={product.locale}
                startDate={product.startDate}
                language={product.language}
                country={product.country}
                workload={product.workload}
              />
            </li>
          ))
        ) : (
          <li className="primary-label text-center">Nenhum curso encontrado</li>
        )}
      </ul>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_: React.ChangeEvent<unknown>, value: number) =>
          setPage(value)
        }
        color="primary"
        className="pb-8"
      />
    </section>
  );
}
