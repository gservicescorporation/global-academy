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
    <div className="flex max-lg:flex-col gap-6 max-lg:gap-2 items-center w-full bg-secondary rounded-md p-2">
      <Image
        src={imgUrl}
        alt={"Iniciativa"}
        width={313}
        height={241}
        className="object-cover rounded-lg w-full h-53 max-w-xs max-lg:w-full max-lg:h-44 object-center"
      />

      <div className="flex flex-col gap-6 max-lg:p-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <h2 className="text-xl font-semibold">{title}</h2>

            {isActive && (
              <span className="bg-blue-600 text-white text-xs rounded-md px-4 py-2 font-semibold">
                Últimos ingressos!
              </span>
            )}
          </div>
          <p className="text-gray-500 max-lg:text-justify max-lg:text-sm">
            {description.length > 200
              ? description.slice(0, 200) + "..."
              : description}
          </p>
        </div>

        <Link
          href={link}
          className="flex w-fit max-lg:w-full max-lg:justify-center font-medium gap-2 items-center px-6 py-2 rounded-md hover:bg-white  border border-primary hover:text-primary bg-primary text-white transition-colors duration-300">
          Saber mais <MdArrowOutward />
        </Link>
      </div>
    </div>
  );
}
