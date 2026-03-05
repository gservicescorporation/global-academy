"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Product from "./ProductCard";
import { Autoplay, Navigation } from "swiper/modules";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { ProductsInterface } from "@/app/interfaces/ProductsInterface";

export default function ProductsCaroussel({
  productsData,
}: {
  productsData: ProductsInterface[];
}) {
  return (
    <div className="w-full flex items-center justify-center">
      <button className="swiper-button-prev">
        <IoIosArrowDropleftCircle className="text-4xl" />
      </button>

      <Swiper
        slidesPerView={3}
        spaceBetween={15}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        speed={1000}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          1024: {
            slidesPerView: 2,
          },
          1136: {
            slidesPerView: 3,
          },
        }}
        modules={[Navigation, Autoplay]}>
        {productsData.map((product, index) => (
          <SwiperSlide
            key={index}
            className="py-8">
            <Product {...product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="swiper-button-next">
        <IoIosArrowDroprightCircle className="text-4xl" />
      </button>
    </div>
  );
}
