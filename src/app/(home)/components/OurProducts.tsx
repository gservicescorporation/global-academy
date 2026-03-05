import { productsData } from "@/app/data/productsData";
import ProductsCaroussel from "./ProductsCaroussel";

export default function OurProducts() {
  return (
    <section className=" lg:py-18 lg:px-24 max-lg:px-8 max-lg:py-12 bg-primary w-full  flex justify-center">
      <div className="text-center text-white items-center flex flex-col gap-6 max-lg:gap-4 w-full max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold max-lg:text-lg">
            Confira os nossos cursos
          </h1>
          <p className="max-w-225 max-lg:text-sm">
            Nossos cursos são projetados para capacitar profissionais e líderes
            com conhecimentos estratégicos e práticos, alinhados às demandas do
            mercado global.
          </p>
        </div>

        <hr className="border border-white/50 w-80 max-lg:w-40" />

        <ProductsCaroussel productsData={productsData} />
      </div>
    </section>
  );
}
