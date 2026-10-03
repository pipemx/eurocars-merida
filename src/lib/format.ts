const mxn = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(price: number | null): string {
  return price === null ? "Precio a consultar" : `$${mxn.format(price)} MXN`;
}

export function formatMileage(km: number | null): string | null {
  return km === null ? null : `${mxn.format(km)} km`;
}
