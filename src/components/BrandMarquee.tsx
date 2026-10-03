/** Marquesina lenta de marcas (solo las del inventario demo). Decorativa: aria-hidden. */
const brands = ["Lamborghini", "Porsche", "Mercedes-Benz", "BMW", "Ford"];

export function BrandMarquee() {
  const row = [...brands, ...brands, ...brands, ...brands];
  return (
    <div aria-hidden className="marquee relative overflow-hidden border-y border-line bg-bg py-7 md:py-9">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,var(--bg),transparent)] md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,var(--bg),transparent)] md:w-48" />
      <div className="marquee-track flex w-max items-center">
        {row.map((b, i) => (
          <span key={i} className="flex items-center">
            <span className="serif-title px-8 text-[1.6rem] font-normal tracking-[0.12em] text-ink/55 md:px-12 md:text-[2.1rem]">{b}</span>
            <span className="h-1 w-1 rotate-45 bg-accent/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
