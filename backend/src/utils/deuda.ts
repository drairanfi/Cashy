export type Frecuencia = 'semanal' | 'quincenal' | 'mensual';

function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonths(base: Date, months: number): Date {
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  const day = base.getUTCDate();
  const targetMonth = month + months;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, targetMonth, Math.min(day, lastDay)));
}

export function generarFechas(
  primeraFecha: Date,
  frecuencia: Frecuencia,
  cantidad: number,
): Date[] {
  const base = toUtcMidnight(primeraFecha);
  const fechas: Date[] = [];

  for (let i = 0; i < cantidad; i += 1) {
    if (frecuencia === 'semanal') {
      fechas.push(addDays(base, 7 * i));
    } else if (frecuencia === 'quincenal') {
      fechas.push(addDays(base, 14 * i));
    } else {
      fechas.push(addMonths(base, i));
    }
  }

  return fechas;
}

export function dividirMonto(montoTotal: number, cantidad: number): number[] {
  const totalCents = Math.round(montoTotal * 100);
  const base = Math.floor(totalCents / cantidad);
  const remainder = totalCents - base * cantidad;

  const montos = Array.from({ length: cantidad }, () => base / 100);
  montos[cantidad - 1] = (base + remainder) / 100;
  return montos;
}
