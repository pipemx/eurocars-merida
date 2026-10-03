const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

export function formatPrice(price: number | null, placeholder = false): string {
  if (placeholder) return "$X,XXX,XXX MXN";
  return price === null ? "Precio a consultar" : `$${mxn.format(price)} MXN`;
}

export function formatMileage(km: number | null, placeholder = false): string | null {
  if (placeholder) return "XX,XXX km";
  return km === null ? null : `${mxn.format(km)} km`;
}
