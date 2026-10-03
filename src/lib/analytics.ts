export type AnalyticsEvent =
  | "whatsapp_click"
  | "vehicle_view"
  | "vehicle_share"
  | "share_whatsapp"
  | "share_facebook"
  | "copy_vehicle_link"
  | "inventory_filter"
  | "inventory_search"
  | "sell_car_start"
  | "sell_car_submit"
  | "finance_click"
  | "maps_click"
  | "instagram_click"
  | "facebook_click"
  | "tiktok_click"
  | "theme_changed"
  | "language_changed";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/**
 * Empuja eventos a dataLayer (GTM/GA4 cuando se configure). Añade idioma y tema.
 * No envía datos personales.
 */
export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  const root = document.documentElement;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, language: root.lang, theme: root.dataset.theme ?? "dark", ...params });
}
