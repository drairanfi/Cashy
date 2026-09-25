export function formatMoney(monto: number): string {
  return `$${monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`;
}
