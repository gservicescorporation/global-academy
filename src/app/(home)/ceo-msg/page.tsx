import HeroTitle from "@/app/ui/HeroTitle";
import Image from "next/image";

export default function CeoMsg() {
  return (
    <section className="flex flex-col w-full items-center justify-center gap-8">
      <HeroTitle
        description={
          "Acompanhe a mensagem do nosso CEO e descubra como estamos moldando o caminho para o sucesso."
        }
        title={"Mensagem do CEO"}
      />

      <div className="max-w-6xl w-full flex max-lg:flex-col justify-center gap-8 pb-8 max-lg:px-8">
        <Image
          src={"/ceo.jpg"}
          alt={"Edson Katchievela"}
          width={400}
          height={400}
          className="object-cover rounded-lg lg:sticky top-24 max-lg:w-full h-100 object-top w-100"
        />

        <div className="flex flex-col gap-2 text-gray-600 max-lg:text-justify lg:w-1/2">
          <p>
            Recentemente, embarcamos em uma jornada extraordinária para
            transformar a Global Academy, alcançando avanços significativos em
            nossos objetivos para 2025. Nossa equipe é fundamental nesse
            processo, e estou profundamente inspirado pela paixão, determinação
            e talento que continuam a demonstrar. Nosso foco está no
            desenvolvimento profissional e no valor que impulsiona nossos
            clientes e acionistas. Pensando no futuro, a Global Academy tem
            oportunidades evidentes para continuar expandindo, especialmente por
            meio de formatos mais acessíveis e convenientes, em diversas áreas
            de formação e através do canal online.
          </p>

          <p>
            A Global Academy atingiu resultados acadêmicos recordes e consolidou
            sua liderança de mercado em Angola. Estou confiante de que
            continuará a prosperar em um cenário cada vez mais competitivo.
            Embora alguns questionem a necessidade urgente das formações
            acadêmicas, nós as consideramos indispensáveis.
          </p>

          <p>
            "Damos certeza à sua vida" não é apenas um slogan – é uma
            responsabilidade. Na Global Academy, nosso sucesso é impulsionado
            pela motivação, talento e resiliência de mais de 20 profissionais.
            Somos uma equipe dinâmica, resiliente e motivada a aprender e
            evoluir continuamente. Investimos no desenvolvimento de nossas
            habilidades para prosperar em uma era de transformação acelerada,
            impulsionada pela crescente digitalização. Não apenas aceitamos a
            mudança – nós a lideramos. Somos curiosos, audaciosos e determinados
            a moldar o futuro.
          </p>

          <p>
            Nossa empresa abriga uma instituição de formação profissional e
            faremos tudo para gerenciá-la e comunicá-la como um todo, como uma
            jornada educacional que começa com a qualificação acadêmica graduada
            e inclui programas de atividades culturais. Oferecendo um
            atendimento ao aluno ou formando, que deixa claro que a nossa
            cultura organizacional e o nosso propósito estão assentes na crença
            de que a educação é o caminho para transformar o mundo num lugar
            melhor para se viver.
          </p>

          <p>
            Agradecemos a todos os nossos stakeholders e parceiros pelo apoio
            contínuo e pelo papel essencial que desempenham na conquista de
            nossos objetivos coletivos. Por fim, agradeço à nossa equipe pelo
            compromisso em fazer o que é certo. Sua dedicação e empenho são
            fundamentais para nossa capacidade de servir melhor nossos clientes,
            estudantes e superar expectativas.
          </p>

          <b>
            <i>“Damos certeza a sua vida”</i>
            <p>CEO – Global Academy</p>
          </b>
        </div>
      </div>
    </section>
  );
}
