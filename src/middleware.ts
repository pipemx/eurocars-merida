import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/** Redirige rutas sin idioma a /es o /en (cookie elegida > Accept-Language > es). */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const cookie = req.cookies.get("ec-locale")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const locale = cookie && isLocale(cookie) ? cookie : /^en\b/i.test(accept.trim()) ? "en" : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|eurocars|favicon|robots.txt|sitemap.xml|.*\\..*).*)"],
};
