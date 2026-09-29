import Image from "next/image";
import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";

export default function IniciativeCard({
  title,
  description,
  imgUrl,
  link,
  isActive,
}: {
  title: string;
  description: string;
  imgUrl: string;
  link: string;
  isActive?: boolean;
}) {
  return (
    <div className="surface-card flex max-lg:flex-col gap-6 max-lg:gap-2 items-center w-full p-3">
      <Image
        src={imgUrl}
        alt={"Iniciativa"}
        width={313}
        height={241}
        className="object-cover rounded-xl w-full h-53 max-w-xs max-lg:w-full max-lg:h-44 object-center"
      />

      <div className="flex flex-col gap-6 max-lg:p-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <h2 className="text-xl font-semibold text-primary">{title}</h2>

            {isActive && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-4 py-1.5 font-semibold">
                Últimos ingressos!
              </span>
            )}
          </div>
          <p className="text-primary-gray max-lg:text-justify max-lg:text-sm">
            {description.length > 200
              ? description.slice(0, 200) + "..."
              : description}
          </p>
        </div>

        <Link href={link} className="primary-btn flex w-fit max-lg:w-full max-lg:justify-center items-center gap-2">
          Saber mais <MdArrowOutward />
        </Link>
      </div>
    </div>
  );
}
