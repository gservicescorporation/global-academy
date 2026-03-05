import { Suspense } from "react";
import Courses from "./container/Courses";

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="primary-label animate-pulse h-screen flex justify-center items-center px-12 py-24">
          Carregando...
        </div>
      }>
      <Courses />
    </Suspense>
  );
}
