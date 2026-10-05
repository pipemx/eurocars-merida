import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "./AdminBits";

/** Pantalla de sección preparada pero aún no construida (siguiente etapa del demo). */
export function ComingNext({ eyebrow, title, summary, bullets }: { eyebrow: string; title: string; summary: string; bullets: string[] }) {
  return (
    <div className="rise mx-auto max-w-[720px] pt-6 md:pt-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="serif-title mt-5 text-[clamp(2.4rem,5vw,3.8rem)] font-normal">{title}</h1>
      <p className="mt-6 font-serif text-[clamp(1.35rem,2.4vw,1.8rem)] italic leading-snug text-ink/90">{summary}</p>
      <ul className="mt-8 space-y-3 border-t border-line pt-6">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] text-ink/80">
            <span aria-hidden className="mt-[9px] h-px w-5 shrink-0 bg-accent" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-10 border border-line-strong/40 bg-surface px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Próxima etapa</p>
        <p className="mt-2 text-[16px]">Esta función forma parte de la siguiente etapa del demo.</p>
      </div>
      <Link href="/admin-demo/panel" className="group mt-8 inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        Volver al resumen <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} aria-hidden />
      </Link>
    </div>
  );
}
