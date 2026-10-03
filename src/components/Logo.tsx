import Image from "next/image";
import Link from "next/link";

/** Logotipo real de Eurocars extraído del archivo proporcionado (sin redibujar). */
export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Eurocars Mérida — inicio" className={`block ${className}`}>
      <Image
        src="/eurocars/brand/logo-extracted-light.webp"
        alt="Eurocars"
        width={635}
        height={439}
        priority={priority}
        sizes="140px"
        className="h-auto w-full"
      />
    </Link>
  );
}
