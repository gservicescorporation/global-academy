"use client";

import React from "react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function EffectFadePictures() {
  const imgUrl: string[] = [
    "https://ik.imagekit.io/globalsc/mr-nov-2023/38.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/12.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/16.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/19.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/22.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/23.jpg",
  ];

  return (
    <Swiper
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      slidesPerView={1}
      speed={2000}
      modules={[EffectFade, Autoplay]}
      effect="fade"
      className="w-full max-w-lg">
      {imgUrl.map((url, index) => (
        <SwiperSlide key={index}>
          <Image
            src={url}
            alt={"Events"}
            width={500}
            height={500}
            className="object-cover w-full rounded-lg"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
