"use client";

import AboutCourseModal from "@/app/ui/AboutCourseModal";
import Image from "next/image";

export default function Product({
  id,
  title,
  description,
  modality,
  certificate,
  locale,
  startDate,
  language,
  country,
  workload,
  coverImg,
}: {
  id: number;
  title: string;
  description: string;
  modality: string;
  certificate: string;
  locale: string;
  startDate: string;
  language: string;
  country: string;
  workload: string;
  coverImg: string;
}) {
  return (
    <div className="surface-card overflow-hidden max-w-78 w-full mx-auto">
      <Image
        src={coverImg}
        alt={"/"}
        width={300}
        height={190}
        className="w-full object-cover object-left-top h-50"
      />

      <div className="bg-white px-6 py-4 flex flex-col gap-3 w-full text-left h-56 justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary-500 font-bold max-lg:text-sm">
            {title.toUpperCase()}
          </h2>

          <p className="text-sm max-lg:text-xs text-primary-gray">
            {description.length > 100
              ? description.slice(0, 100) + "..."
              : description}
          </p>
        </div>

        <AboutCourseModal
          id={id}
          title={title}
          description={description}
          modality={modality}
          certificate={certificate}
          locale={locale}
          startDate={startDate}
          country={country}
          workload={workload}
          coverImg={coverImg}
          language={language}
        />
      </div>
    </div>
  );
}
