export type AnalyticsEvent =
  | "whatsapp_click"
  | "vehicle_view"
  | "inventory_filter"
  | "sell_car_start"
  | "finance_click"
  | "maps_click"
  | "social_click";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/** Empuja eventos a dataLayer (GTM/GA4). Sin proveedor configurado aún: no-op seguro. */
export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}
