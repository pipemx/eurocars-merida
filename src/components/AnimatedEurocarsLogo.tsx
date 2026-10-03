"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "./providers/Preferences";

type Source = { src: string; type: string };

type Props = {
  /** Fuentes del video oficial (WebM primero, MP4 de respaldo). El video no se altera. */
  videoSrc: Source[];
  posterSrc: string;
  /** Logo estático: se usa en tema claro, con reduced-motion o si el video falla. */
  staticFallback: { dark: string; light: string; width: number; height: number };
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  className?: string;
  alt?: string;
};

/**
 * Logo animado de Eurocars. El video tiene fondo gris degradado (no negro), así que en tema
 * oscuro se muestra como una placa enmarcada; no se recorta ni se filtra. En tema claro se
 * muestra el logo estático monocromo.
 * El video se carga después del evento `load` para no competir con el LCP.
 */
export function AnimatedEurocarsLogo({
  videoSrc,
  posterSrc,
  staticFallback,
  autoplay = true,
  loop = true,
  muted = true,
  playsInline = true,
  className = "",
  alt = "Eurocars",
}: Props) {
  const { theme } = usePreferences();
  const ref = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"static" | "poster" | "video">("static");

  useEffect(() => {
    if (theme === "light") return setMode("static");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setMode("poster");
    setMode("poster");
    const start = () => setMode("video");
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 300);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [theme]);

  useEffect(() => {
    if (mode !== "video" || !autoplay) return;
    ref.current?.play().catch(() => setMode("poster"));
  }, [mode, autoplay]);

  // El fondo gris del video se presenta como placa metálica enmarcada (no se altera el video).
  const plate = "rounded-[3px] ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.8)]";

  if (mode === "static") {
    const src = theme === "light" ? staticFallback.light : staticFallback.dark;
    return (
      <span className={`relative block ${className}`}>
        <Image src={src} alt={alt} width={staticFallback.width} height={staticFallback.height} priority sizes="160px" className="h-auto w-full" />
      </span>
    );
  }

  return (
    <span className={`relative block aspect-[666/476] overflow-hidden ${plate} ${className}`} role="img" aria-label={alt}>
      {mode === "poster" ? (
        <Image src={posterSrc} alt="" fill sizes="160px" className="object-cover" />
      ) : (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster={posterSrc}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
          onError={() => setMode("poster")}
        >
          {videoSrc.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </span>
  );
}

export const eurocarsLogoProps = {
  videoSrc: [
    { src: "/eurocars/brand/logo-animado-480.webm", type: "video/webm" },
    { src: "/eurocars/brand/logo-animado-480.mp4", type: "video/mp4" },
  ],
  posterSrc: "/eurocars/brand/logo-animado-poster.webp",
  staticFallback: {
    dark: "/eurocars/brand/logo-extracted-light.webp",
    light: "/eurocars/brand/logo-mono-dark.webp",
    width: 635,
    height: 439,
  },
};
