import { productsData } from "@/app/data/productsData";
import Image from "next/image";
import React from "react";
import { use } from "react";
import { FaRightLong } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";
import { IoMdCalendar } from "react-icons/io";
import { LuMap } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import { MdClass, MdOutlinePlace } from "react-icons/md";
import { TbCertificate } from "react-icons/tb";
import Link from "next/link";
import SwiperComponent from "@/app/(home)/components/Swiper";

export default function AboutCourse({
  params,
}: {
  params: Promise<{
    courseId: string;
  }>;
}) {
  const { courseId } = use(params);
  const course = productsData.find(
    (course) => course.id === parseInt(courseId)
  );

  return (
    <section className="flex flex-col justify-center items-center lg:py-8 pb-8">
      <div className="max-w-6xl flex flex-col w-full lg:gap-4">
        <div
          className={`w-full relative h-120 bg-cover max-lg:bg-center rounded-md`}>
          {course?.images && <SwiperComponent images={course.images} />}
          <div className="w-1/2 z-30 absolute left-0 top-0 max-lg:w-full h-full lg:rounded-r-[100px] lg:rounded-l-md bg-primary/50 backdrop-blur-xs flex flex-col p-12 gap-4 text-white justify-center">
            <div>
              <p className="max-lg:text-sm">FORMAÇÃO EXECUTIVA</p>
              <h1 className="text-3xl max-lg:text-xl font-bold">
                {course?.title.toUpperCase()}
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <p className="secondary-title flex items-center gap-1">
                <LuMap className="text-lg" />
                {course?.country}
              </p>

              <p className="secondary-title flex items-center gap-1">
                <FiMapPin />
                {course?.locale}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between gap-12 max-lg:flex-col-reverse">
          <div className="lg:w-2/3 w-full flex flex-col gap-4 max-lg:px-8">
            <div className="flex flex-col w-full gap-2 max-lg:items-center max-lg:gap-4">
              <h1 className="primary-title">Sobre o curso</h1>
              <p className="primary-description">{course?.description}</p>
            </div>

            <div className="flex flex-col w-full max-lg:items-center max-lg:gap-2">
              <h2 className="text-primary text-lg font-bold">PÚBLICO ALVO</h2>

              <p className="primary-description">{course?.recipients}</p>
            </div>

            <div className="flex flex-col w-full max-lg:items-center max-lg:gap-2">
              <h2 className="text-primary text-lg font-bold">CANDIDATURA</h2>

              <p className="primary-description">{course?.candidacy}</p>
            </div>

            <div className="flex flex-col w-full max-lg:items-center max-lg:gap-2">
              <h2 className="text-primary text-lg font-bold">
                PRINCIPAIS VANTAGENS
              </h2>

              <ul className="flex flex-col gap-2">
                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">Debate</h1>
                  <p className="primary-description">{course?.debate}</p>
                </li>

                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">
                    Understanding
                  </h1>
                  <p className="primary-description">{course?.understanding}</p>
                </li>

                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">Focus</h1>
                  <p className="primary-description">{course?.focus}</p>
                </li>

                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">Exhibiton</h1>
                  <p className="primary-description">{course?.exhibition}</p>
                </li>

                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">Revaluation</h1>
                  <p className="primary-description">{course?.revaluation}</p>
                </li>

                <li className="primary-description">
                  <h1 className="font-medium text-primary-500">Time</h1>
                  <p className="primary-description">{course?.time}</p>
                </li>
              </ul>
            </div>

            <div className="flex flex-col w-full gap-4 max-lg:items-center max-lg:gap-4">
              <h2 className="text-primary text-lg font-bold">MAGISTÉRIO</h2>

              <ul className="flex flex-col gap-2 max-lg:gap-4">
                {course?.teaching?.map((teacher, index) => (
                  <li
                    className="flex gap-4 max-lg:gap-2 items-center lg:h-33 w-full max-lg:flex-col"
                    key={index}>
                    {teacher.imgUrl ? (
                      <Image
                        src={teacher.imgUrl}
                        alt={teacher.name}
                        width={136}
                        height={100}
                        className="rounded-md h-32 max-lg:h-64 max-lg:w-full min-w-34 object-cover object-top"
                      />
                    ) : (
                      <Image
                        src={"/unknown-user.jpg"}
                        alt={teacher.name}
                        width={136}
                        height={100}
                        className="rounded-md h-32 max-lg:h-64 max-lg:w-full min-w-34 object-cover object-top"
                      />
                    )}

                    <div>
                      <h3 className="font-semibold text-primary-500">
                        {teacher.name}
                      </h3>
                      <p className="primary-description text-sm">
                        {teacher.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <>
              <h2 className="text-primary text-lg font-bold">MÓDULOS</h2>

              <div className="flex flex-wrap w-full gap-2 items-center">
                {course?.modules?.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="flex justify-center items-center lg:w-54 w-full h-31 gap-4 p-4 rounded-md bg-primary/14 text-center">
                      <p className="font-bold text-sm text-primary-500">
                        {item.toUpperCase()}
                      </p>
                    </div>
                    {course.modules &&
                      (index + 1) % 3 !== 0 &&
                      index < course.modules.length - 1 && (
                        <FaRightLong className="text-primary-500 text-xl max-lg:hidden" />
                      )}
                  </React.Fragment>
                ))}
              </div>
            </>

            <div className="flex max-lg:items-center w-full flex-col gap-4">
              <h2 className="text-primary text-lg font-bold">CERTIFICAÇÃO e PARCEIROS</h2>

              <div className="flex flex-wrap w-full gap-2 items-center max-lg:justify-center">
                {course?.certificateImgUrls &&
                  course.certificateImgUrls.map((item, index) => (
                    <Image
                      key={index}
                      src={item}
                      alt={"Certificação"}
                      width={150}
                      height={150}
                    />
                  ))}
              </div>
            </div>
          </div>

          <aside className="lg:w-1/3 h-fit lg:rounded-md flex-col flex bg-white shadow lg:sticky lg:top-22">
            <nav className="p-4 lg:rounded-t-lg text-center bg-primary text-white font-bold">
              DETALHES DO CURSO
            </nav>
            <ul className="px-8 pt-2 pb-6 text-primary-500 w-full flex flex-col gap-2">
              <li className="font-semibold flex items-center gap-2 py-2">
                <IoMdCalendar /> Data de Início:{" "}
                <span className="font-normal">{course?.startDate}</span>{" "}
              </li>
              <li className="font-semibold flex items-center gap-2 py-2">
                <IoTimeOutline /> Duração:{" "}
                <span className="font-normal">{course?.workload}</span>{" "}
              </li>
              <li className="font-semibold flex items-center gap-2 py-2">
                <MdClass /> Modalidade:{" "}
                <span className="font-normal">{course?.modality}</span>{" "}
              </li>
              <li className="font-semibold flex items-center gap-2 py-2">
                <MdOutlinePlace /> Local:{" "}
                <span className="font-normal">{course?.locale}</span>{" "}
              </li>
              <li className="font-semibold flex items-center gap-2 py-2">
                <TbCertificate /> Certificação:
                <span className="font-normal">{course?.certificate}</span>{" "}
              </li>
              <li className="font-semibold flex items-center gap-2 py-2">
                <FiMapPin /> Status:{" "}
                <span className="font-normal">{course?.status}</span>{" "}
              </li>

              <Link
                href={"/registration"}
                className="text-center primary-btn px-4 py-2 rounded-md w-full max-lg:text-xs">
                Inscrever-se
              </Link>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
