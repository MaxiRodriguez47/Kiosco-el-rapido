export function formatPriceARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getTransferPrice(finalPrice: number): number {
  return finalPrice * 0.9;
}
