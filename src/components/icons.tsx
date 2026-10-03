import { brandPaths } from "./brand-paths";

type IconProps = { className?: string; title?: string };

function Brand({ path, className = "h-5 w-5", title }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
}

export const InstagramIcon = (p: IconProps) => <Brand path={brandPaths.instagram} {...p} />;
export const FacebookIcon = (p: IconProps) => <Brand path={brandPaths.facebook} {...p} />;
export const TiktokIcon = (p: IconProps) => <Brand path={brandPaths.tiktok} {...p} />;
export const WhatsappIcon = (p: IconProps) => <Brand path={brandPaths.whatsapp} {...p} />;

/** Wordmark "Google" con los colores de la marca, solo para atribuir la calificación. */
export function GoogleWordmark({ className = "" }: { className?: string }) {
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <span className={`font-sans font-medium tracking-[-0.02em] ${className}`} aria-label="Google">
      {letters.map(([l, c], i) => (
        <span key={i} style={{ color: c }} aria-hidden>
          {l}
        </span>
      ))}
    </span>
  );
}
