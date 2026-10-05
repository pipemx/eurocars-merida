import localFont from "next/font/local";

/** Fuentes self-hosted compartidas por el sitio público y el admin demo. */
export const jost = localFont({
  src: [
    { path: "../fonts/jost-latin-300-normal.woff2", weight: "300" },
    { path: "../fonts/jost-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/jost-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/jost-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-jost",
  display: "swap",
});

export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});
