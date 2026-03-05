export default function HeroTitle({
  title,
  description,
}: {
  description: string;
  title: string;
}) {
  return (
    <section className="flex justify-center w-full items-center px-24 py-12 max-lg:px-8 bg-secondary">
      <div className="max-w-6xl flex items-center justify-center flex-col gap-4 text-center">
        <h1 className="text-3xl max-lg:text-lg text-primary-black font-bold">{title}</h1>
        <p className="max-lg:text-sm text-primary-gray italic">{description}</p>
      </div>
    </section>
  );
}
