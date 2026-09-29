import { productsData } from "@/app/data/productsData";
import ProductsCaroussel from "./ProductsCaroussel";

export default function OurProducts() {
  return (
    <section className="lg:py-20 lg:px-24 max-lg:px-8 max-lg:py-14 bg-secondary w-full flex justify-center">
      <div className="text-center items-center flex flex-col gap-6 max-lg:gap-4 w-full max-w-6xl">
        <div className="flex flex-col items-center gap-3">
          <span className="primary-title">Cursos</span>
          <h1 className="text-3xl font-bold max-lg:text-xl text-primary-black">
            Confira os nossos cursos
          </h1>
          <p className="max-w-225 text-primary-gray max-lg:text-sm">
            Nossos cursos são projetados para capacitar profissionais e líderes
            com conhecimentos estratégicos e práticos, alinhados às demandas do
            mercado global.
          </p>
        </div>

        <ProductsCaroussel productsData={productsData} />
      </div>
    </section>
  );
}
