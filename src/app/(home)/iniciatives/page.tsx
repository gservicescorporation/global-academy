"use client";

import HeroTitle from "@/app/ui/HeroTitle";
import IniciativeCard from "./components/IniciativeCard";
import { iniciativesData } from "@/app/data/iniciativesData";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import { scrollToSection } from "@/app/utils/scrollTo";

export default function Iniciatives() {
  const eventsImages = [
    "https://ik.imagekit.io/globalsc/baw-fev-2024/9.jpg",
    "https://ik.imagekit.io/globalsc/baw-fev-2024/10.jpg",
    "https://ik.imagekit.io/globalsc/baw-fev-2024/11.jpg",
    "https://ik.imagekit.io/globalsc/baw-fev-2024/12.jpg",
    "https://ik.imagekit.io/globalsc/baw-fev-2024/13.jpg",
    "https://ik.imagekit.io/globalsc/baw-fev-2024/14.jpg",
    "https://ik.imagekit.io/globalsc/baw-jul-2024/3.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/37.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/38.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/39.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/33.jpg",
    "https://ik.imagekit.io/globalsc/mr-nov-2023/32.jpg",
  ];

  return (
    <section className="flex flex-col w-full items-center justify-center gap-8">
      <div className="w-full h-135 max-lg:h-80 relative">
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
          effect={"fade"}
          speed={3000}
          loop
          modules={[Autoplay, EffectFade]}
          className="w-full h-full">
          {eventsImages &&
            eventsImages.map((event, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={event}
                  alt={"Fotos dos eventos"}
                  width={1000}
                  height={540}
                  className="w-full object-cover max-lg:object-left h-full object-top"
                />
              </SwiperSlide>
            ))}
        </Swiper>

        <div className="absolute top-0 left-0 w-full h-full bg-primary/60 z-20 p-8 flex flex-col gap-5 justify-center items-center">
          <div className="max-w-xl  text-center text-6xl max-lg:text-2xl font-bold text-white">
            <h1 className="">{"Actividades".toUpperCase()}</h1>
            <p className="">GLOBAL ACADEMY</p>
            <p className="text-2xl max-lg:text-sm font-medium">
              Iniciativas que geram momentos inesquecíveis!
            </p>
          </div>

          <button
            onClick={() => {
              scrollToSection("activities", "start");
            }}
            className="max-lg:text-sm hover:bg-white transition-colors duration-300 cursor-pointer font-semibold px-8 py-4 rounded-full text-white hover:text-primary bg-primary border border-primary">
            Ver Actividades
          </button>
        </div>
      </div>

      <div
        className="max-w-6xl flex flex-col justify-center gap-8 pb-8 max-lg:px-8"
        id="activities">
        {/* <IniciativeCard
          title={"Programa Executivo em Gestão Estratégica de Organizações"}
          description={`Este programa é oferecido pela Global Academy, foi concebido com um ciclo de sessões
sobre temas da actualidade e de relevância para líderes das organizações governamentais
e empresarias. O programa brinda aos gestores de topo uma experiência única, que visa
desenvolver nos líderes habilidades, visão global e sistêmica de cultura empresarial competitiva.`}
          imgUrl={
            "/gestao-estrategica.jpeg"
          }
          link={`/iniciatives/exclusive`}
          isActive
        /> */}

        {iniciativesData.map((item, index) => (
          <IniciativeCard
            key={index}
            title={item.name}
            description={item.description}
            imgUrl={item.coverImgUrl}
            link={`/iniciatives/${item.id}`}
          />
        ))}
      </div>
    </section>
  );
}
