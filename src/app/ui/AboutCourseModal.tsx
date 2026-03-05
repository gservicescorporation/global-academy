import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";

export default function AboutCourseModal({
  id,
  title,
  description,
  modality,
  certificate,
  locale,
  startDate,
  country,
  workload,
  language,
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
    <Dialog>
      <DialogTrigger className="primary-btn py-2 px-4 rounded-md">
        Ver curso
      </DialogTrigger>
      <DialogContent className="bg-white min-w-200 max-lg:min-w-80 p-0">
        <div className="flex max-lg:flex-col w-full">
          <Image
            src={coverImg}
            alt={"Course Cover"}
            width={400}
            height={400}
            className="w-1/2 max-lg:w-full max-lg:max-h-44 object-cover rounded-l-md object-left-top"
          />
          <div className="p-4 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="font-bold text-2xl max-lg:text-base text-primary-500">
                {title}
              </DialogTitle>
              <ul className="font-medium text-sm text-primary-500 max-lg:text-xs">
                <li>
                  Carga Horária: <span className="font-bold">{workload}</span>
                </li>
                <li>
                  Modalidade: <span className="font-bold">{modality}</span>
                </li>
                <li>
                  Local: <span className="font-bold">{locale}</span>
                </li>
                <li>
                  Certificação: <span className="font-bold">{certificate}</span>
                </li>
                <li>
                  Data de Início: <span className="font-bold">{startDate}</span>
                </li>
                <li>
                  Idioma: <span className="font-bold">{language}</span>
                </li>
              </ul>
              <DialogDescription className="max-lg:text-xs">
                {description ? description.slice(0, 300) + "..." : description}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2">
              <Link
                href={`/courses/about/${id}`}
                className="text-center secondary-btn px-4 py-2 rounded-md w-full max-lg:text-xs">
                Saber mais
              </Link>
              <Link
                href={"/registration"}
                className="text-center primary-btn px-4 py-2 rounded-md w-full max-lg:text-xs">
                Inscrever-se
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
