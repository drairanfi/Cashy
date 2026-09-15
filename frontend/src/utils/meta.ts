export function mesesParaAlcanzar(montoObjetivo: number, montoMensual: number): number | null {
  if (montoMensual <= 0) return null;
  return Math.ceil(montoObjetivo / montoMensual);
}
