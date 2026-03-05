import HeroTitle from "@/app/ui/HeroTitle";
import Image from "next/image";

export default function Page() {
  const cardInfo = [
    { img: "/partners/aec.svg" },
    { img: "/partners/aecipa.svg" },
    { img: "/partners/aes.svg" },
    { img: "/partners/sta_seguros.svg" },
    { img: "/partners/tda.svg" },
  ];

  return (
    <section className="w-full flex flex-col gap-8 items-center justify-center pb-8">
      <HeroTitle
        description={
          "Qualidade, transparência e rigor são princípios que cultivam relações de firmeza"
        }
        title={"Clientes e Parceiros"}
      />

      <div className="w-full max-w-6xl flex flex-wrap gap-8 justify-between max-lg:px-8 max-lg:justify-around">
        {cardInfo.map((item) => (
          <Image
            src={item.img}
            alt={"Cliente"} 
            width={100}
            height={100}
          />
        ))}
      </div>
    </section>
  );
}
