"use client";

import { site } from "@/content/site";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./icons";

type Network = "instagram" | "facebook" | "tiktok";

const networks: Record<Network, { label: string; href: string; handle: string; event: AnalyticsEvent; Icon: typeof InstagramIcon }> = {
  instagram: { label: "Instagram", href: site.social.instagram, handle: "@eurocarsmerida", event: "instagram_click", Icon: InstagramIcon },
  facebook: { label: "Facebook", href: site.social.facebook, handle: "eurocarsmeridayuc", event: "facebook_click", Icon: FacebookIcon },
  tiktok: { label: "TikTok", href: site.social.tiktok, handle: "@eurocarsmid", event: "tiktok_click", Icon: TiktokIcon },
};

/**
 * Enlace social con microinteracción por marca (hover en desktop, :active en táctil).
 * Instagram: revela su gradiente · Facebook: acento azul · TikTok: desfase cian/rojo.
 */
export function SocialLink({ network, location, showHandle = false }: { network: Network; location: string; showHandle?: boolean }) {
  const n = networks[network];
  const brand = {
    instagram:
      "before:bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285aeb_95%)] group-hover/s:text-white group-active/s:text-white",
    facebook: "before:bg-[#1877f2] group-hover/s:text-white group-active/s:text-white",
    tiktok: "before:bg-[#111] group-hover/s:text-white group-active/s:text-white",
  }[network];

  return (
    <a
      href={n.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${n.label} (${n.handle})`}
      onClick={() => track(n.event, { location })}
      className="group/s relative inline-flex min-h-11 items-center gap-3"
    >
      <span
        className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-full transition-[transform,color] duration-300 ease-[var(--ease-editorial)] group-hover/s:-translate-y-0.5 group-active/s:scale-95 before:absolute before:inset-[6px] before:rounded-full before:opacity-0 before:scale-75 before:transition-[opacity,transform] before:duration-300 group-hover/s:before:opacity-100 group-hover/s:before:scale-100 group-active/s:before:opacity-100 group-active/s:before:scale-100 ${brand}`}
      >
        <span className="relative transition-transform duration-300 group-hover/s:scale-[1.06]">
          {network === "tiktok" ? (
            <span className="relative block">
              <TiktokIcon className="absolute inset-0 h-[17px] w-[17px] text-[#25f4ee] opacity-0 transition-[opacity,transform] duration-300 group-hover/s:-translate-x-[1.5px] group-hover/s:-translate-y-[1px] group-hover/s:opacity-100" />
              <TiktokIcon className="absolute inset-0 h-[17px] w-[17px] text-[#fe2c55] opacity-0 transition-[opacity,transform] duration-300 group-hover/s:translate-x-[1.5px] group-hover/s:translate-y-[1px] group-hover/s:opacity-100" />
              <TiktokIcon className="relative h-[17px] w-[17px]" />
            </span>
          ) : (
            <n.Icon className="h-[17px] w-[17px]" />
          )}
        </span>
      </span>
      {showHandle && <span className="text-[13px] opacity-75 transition-opacity group-hover/s:opacity-100">{n.handle}</span>}
      {/* Tooltip (solo puntero fino) */}
      {!showHandle && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[2px] bg-ink px-2 py-1 text-[11px] tracking-[0.06em] text-bg opacity-0 transition-[opacity,transform] duration-200 [@media(hover:hover)]:group-hover/s:translate-y-0 [@media(hover:hover)]:group-hover/s:opacity-100 group-focus-visible/s:opacity-100"
        >
          {n.label}
        </span>
      )}
    </a>
  );
}

export function SocialLinks({ location, className = "", showHandles = false }: { location: string; className?: string; showHandles?: boolean }) {
  return (
    <ul className={`flex items-center ${showHandles ? "flex-col items-start gap-1" : "gap-1"} ${className}`}>
      {(Object.keys(networks) as Network[]).map((n) => (
        <li key={n}>
          <SocialLink network={n} location={location} showHandle={showHandles} />
        </li>
      ))}
    </ul>
  );
}
