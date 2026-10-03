"use client";

import { site } from "@/content/site";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./icons";

type Network = "instagram" | "facebook" | "tiktok";

const networks: Record<
  Network,
  { label: string; href: string; handle: string; event: AnalyticsEvent; Icon: typeof InstagramIcon; ring: string; fill: string; glow: string }
> = {
  instagram: {
    label: "Instagram",
    href: site.social.instagram,
    handle: "@eurocarsmerida",
    event: "instagram_click",
    Icon: InstagramIcon,
    ring: "conic-gradient(from 0deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)",
    fill: "radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)",
    glow: "#e1306c",
  },
  facebook: {
    label: "Facebook",
    href: site.social.facebook,
    handle: "eurocarsmeridayuc",
    event: "facebook_click",
    Icon: FacebookIcon,
    ring: "conic-gradient(from 0deg,#1877f2,#6aa9ff,#1877f2,#0b5fd1,#1877f2)",
    fill: "linear-gradient(160deg,#3b8cff,#1877f2 60%,#0b5fd1)",
    glow: "#1877f2",
  },
  tiktok: {
    label: "TikTok",
    href: site.social.tiktok,
    handle: "@eurocarsmid",
    event: "tiktok_click",
    Icon: TiktokIcon,
    ring: "conic-gradient(from 0deg,#25f4ee,#fe2c55,#25f4ee,#fe2c55,#25f4ee)",
    fill: "linear-gradient(135deg,#111 0%,#111 60%,#2a0b14 100%)",
    glow: "#25f4ee",
  },
};

/** Botón social: anillo de marca girando, latido periódico con relleno y resplandor de marca, rebote al interactuar. */
export function SocialLink({ network, location, index = 0, showHandle = false }: { network: Network; location: string; index?: number; showHandle?: boolean }) {
  const n = networks[network];
  return (
    <a
      href={n.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${n.label} (${n.handle})`}
      onClick={() => track(n.event, { location })}
      className="group/s relative inline-flex min-h-11 items-center gap-3"
    >
      <span className="social-btn" style={{ "--ring": n.ring, "--fill": n.fill, "--glow": n.glow, "--i": index } as React.CSSProperties}>
        {network === "tiktok" ? (
          <span className="relative block h-[17px] w-[17px]">
            <TiktokIcon className="tt-cyan absolute inset-0 h-[17px] w-[17px] text-[#25f4ee]" />
            <TiktokIcon className="tt-red absolute inset-0 h-[17px] w-[17px] text-[#fe2c55]" />
            <TiktokIcon className="relative h-[17px] w-[17px]" />
          </span>
        ) : (
          <n.Icon className="h-[17px] w-[17px]" />
        )}
      </span>
      {showHandle ? (
        <span className="text-[14px] opacity-80 transition-opacity group-hover/s:opacity-100">{n.handle}</span>
      ) : (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[2px] bg-ink px-2 py-1 text-[11px] tracking-[0.06em] text-bg opacity-0 transition-[opacity,transform] duration-200 [@media(hover:hover)]:group-hover/s:translate-y-0 [@media(hover:hover)]:group-hover/s:opacity-100 group-focus-visible/s:opacity-100"
        >
          {n.label}
        </span>
      )}
    </a>
  );
}

export function SocialLinks({ location, className = "", showHandles = false }: { location: string; className?: string; showHandles?: boolean }) {
  return (
    <ul className={`flex ${showHandles ? "flex-col items-start gap-2" : "items-center gap-2"} ${className}`}>
      {(Object.keys(networks) as Network[]).map((n, i) => (
        <li key={n}>
          <SocialLink network={n} location={location} index={i} showHandle={showHandles} />
        </li>
      ))}
    </ul>
  );
}
