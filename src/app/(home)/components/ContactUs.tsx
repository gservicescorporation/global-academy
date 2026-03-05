"use client";

import { api } from "@/api/config";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IoIosArrowDropright } from "react-icons/io";
import { toast } from "react-toastify";

type InputValues = {
  fullname: string;
  email: string;
  phone: string;
  description: string;
};

export default function ContactUs() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputValues>();

  const onSubmit: SubmitHandler<InputValues> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/academy/contact-us", {
        name: data.fullname,
        email: data.email,
        contact: data.phone,
        subject: data.description,
      });

      if (response.status === 200) {
        toast.success("Email de contacto enviado!");
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error("Erro ao enviar e-mail", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center bg-primary lg:py-18 lg:px-24 max-lg:px-0 max-lg:py-12">
      <div className="max-w-6xl w-full flex flex-wrap gap-12 justify-center text-white items-center">
        <div className="max-w-130 w-full flex flex-col text-center items-center px-5 py-6 gap-2">
          <h2 className="text-lg font-semibold">
            Preencha o formulário para entrar em contacto.
          </h2>
          <p className="max-lg:text-sm">
            Nossos cursos são projetados para capacitar profissionais e líderes
            com conhecimentos estratégicos e práticos, alinhados às demandas do
            mercado global.
          </p>
          <IoIosArrowDropright className="text-3xl max-lg:rotate-90" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center bg-white px-8 py-8.5 gap-4 max-lg:rounded-none rounded-lg text-gray-500 w-116">
          <h1 className="font-bold text-center text-primary">
            ENTRE EM CONTACTO
          </h1>

          <div className="w-full">
            <input
              type="text"
              placeholder="Nome completo"
              {...register("fullname", {
                required: "Nome é obrigatório",
                minLength: {
                  value: 3,
                  message: "Nome deve ter pelo menos 3 caracteres",
                },
                maxLength: {
                  value: 50,
                  message: "Nome deve ter no máximo 50 caracteres",
                },
              })}
              className="primary-input w-full"
            />
            <span className="text-red-500 text-xs">
              {errors.fullname?.message}
            </span>
          </div>

          <div className="w-full">
            <input
              type="email"
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "E-mail inválido",
                },
              })}
              placeholder="Email"
              className="primary-input w-full"
            />
            <span className="text-red-500 text-xs">
              {errors.email?.message}
            </span>
          </div>

          <div className="w-full">
            <input
              type="tel"
              {...register("phone", {
                required: "Telefone é obrigatório",
                pattern: {
                  value: /^[0-9]{9,15}$/,
                  message: "Número de telefone inválido",
                },
              })}
              placeholder="Contacto"
              className="primary-input w-full"
            />
            <span className="text-red-500 text-xs">
              {errors.phone?.message}
            </span>
          </div>

          <div className="w-full">
            <textarea
              rows={4}
              {...register("description", {
                required: "Mensagem é obrigatória",
                minLength: {
                  value: 10,
                  message: "A mensagem deve ter pelo menos 10 caracteres",
                },
                maxLength: {
                  value: 500,
                  message: "A mensagem deve ter no máximo 500 caracteres",
                },
              })}
              placeholder="Assunto "
              className="primary-input w-full resize-none"
            />
            <span className="text-red-500 text-xs">
              {errors.description?.message}
            </span>
          </div>

          <button
            type="submit"
            className="primary-btn py-2 px-4 rounded-md"
            disabled={loading}
            aria-busy={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </section>
  );
}
