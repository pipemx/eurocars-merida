import Image from "next/image";
import Link from "next/link";

/**
 * Logotipo real de Eurocars, extraído del archivo proporcionado (sin redibujar).
 * Provisional hasta recibir el original vectorial.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Eurocars Mérida — inicio" className={`block ${className}`}>
      <Image
        src="/eurocars/brand/wordmark-extracted-light.webp"
        alt="Eurocars"
        width={607}
        height={77}
        priority
        sizes="180px"
        className="h-auto w-full"
      />
    </Link>
  );
}
