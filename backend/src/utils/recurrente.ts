export type Frecuencia = 'diaria' | 'semanal' | 'mensual' | 'anual';

export function toUtcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addFrequency(date: Date, frecuencia: Frecuencia, intervalo: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  switch (frecuencia) {
    case 'diaria':
      return new Date(date.getTime() + intervalo * 86_400_000);
    case 'semanal':
      return new Date(date.getTime() + intervalo * 7 * 86_400_000);
    case 'mensual': {
      const shifted = month + intervalo;
      const ty = year + Math.floor(shifted / 12);
      const tm = ((shifted % 12) + 12) % 12;
      return new Date(Date.UTC(ty, tm, Math.min(day, daysInMonth(ty, tm))));
    }
    case 'anual': {
      const ty = year + intervalo;
      return new Date(Date.UTC(ty, month, Math.min(day, daysInMonth(ty, month))));
    }
  }
}

export function fechasHasta(
  inicio: Date,
  frecuencia: Frecuencia,
  intervalo: number,
  hasta: Date,
  fin: string | null,
  limit = 240,
): Date[] {
  const end = fin ? toUtcMidnight(new Date(fin)) : null;
  const out: Date[] = [];
  let cursor = toUtcMidnight(inicio);
  while (cursor.getTime() <= hasta.getTime() && out.length < limit) {
    if (end && cursor.getTime() > end.getTime()) break;
    out.push(cursor);
    cursor = addFrequency(cursor, frecuencia, intervalo);
  }
  return out;
}
