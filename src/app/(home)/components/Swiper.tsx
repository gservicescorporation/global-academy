"use client";

import Image from "next/image";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function SwiperComponent({ images }: { images: string[] }) {
  return (
    <Swiper
      slidesPerView={1}
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      speed={1000}
      loop
      modules={[Navigation, Autoplay]}
      className="w-full h-full">
      {images &&
        images.map((course, index) => (
          <SwiperSlide
            key={index}
            className="">
            <Image
              src={course}
              alt={course}
              width={1000}
              height={540}
              className="w-full object-cover max-lg:object-left h-full object-top"
            />
          </SwiperSlide>
        ))}
    </Swiper>
  );
}
