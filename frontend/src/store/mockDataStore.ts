import { create } from 'zustand';
import type { Ahorro, Comida, Gasto, GimnasioRegistro } from '../types';

interface MockDataState {
  gastos: Gasto[];
  comidas: Comida[];
  gimnasio: GimnasioRegistro[];
  ahorros: Ahorro[];
  addGasto: (gasto: Omit<Gasto, 'id' | 'fecha'>) => void;
  removeGasto: (id: string) => void;
  addComida: (comida: Omit<Comida, 'id' | 'fecha'>) => void;
  removeComida: (id: string) => void;
  addGimnasio: (registro: Omit<GimnasioRegistro, 'id' | 'fecha'>) => void;
  removeGimnasio: (id: string) => void;
  addAhorro: (ahorro: Omit<Ahorro, 'id'>) => void;
  removeAhorro: (id: string) => void;
  aportarAhorro: (id: string, monto: number) => void;
}

const today = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

export const useMockDataStore = create<MockDataState>((set) => ({
  gastos: [
    { id: uid(), descripcion: 'Luz', monto: 25000, categoria: 'Hogar', fecha: today() },
    { id: uid(), descripcion: 'Netflix', monto: 15000, categoria: 'Ocio', fecha: today() },
    { id: uid(), descripcion: 'Sube', monto: 8000, categoria: 'Transporte', fecha: today() },
    { id: uid(), descripcion: 'Farmacia', monto: 12000, categoria: 'Salud', fecha: today() },
  ],
  comidas: [
    { id: uid(), descripcion: 'Almuerzo delivery', monto: 15000, fecha: today() },
    { id: uid(), descripcion: 'Supermercado', monto: 45000, fecha: today() },
    { id: uid(), descripcion: 'Cafetería', monto: 6000, fecha: today() },
  ],
  gimnasio: [
    { id: uid(), actividad: 'Mensualidad gym', monto: 30000, fecha: today() },
    { id: uid(), actividad: 'Suplementos', monto: 18000, fecha: today() },
    { id: uid(), actividad: 'Clases particulares', monto: 25000, fecha: today() },
  ],
  ahorros: [
    { id: uid(), nombre: 'Viaje a Brasil', objetivo: 1000000, actual: 400000 },
    { id: uid(), nombre: 'Fondo de emergencia', objetivo: 500000, actual: 500000 },
    { id: uid(), nombre: 'Playstation 5', objetivo: 800000, actual: 300000 },
  ],
  addGasto: (gasto) => set((s) => ({ gastos: [{ ...gasto, id: uid(), fecha: today() }, ...s.gastos] })),
  removeGasto: (id) => set((s) => ({ gastos: s.gastos.filter((g) => g.id !== id) })),
  addComida: (comida) =>
    set((s) => ({ comidas: [{ ...comida, id: uid(), fecha: today() }, ...s.comidas] })),
  removeComida: (id) => set((s) => ({ comidas: s.comidas.filter((c) => c.id !== id) })),
  addGimnasio: (registro) =>
    set((s) => ({ gimnasio: [{ ...registro, id: uid(), fecha: today() }, ...s.gimnasio] })),
  removeGimnasio: (id) => set((s) => ({ gimnasio: s.gimnasio.filter((r) => r.id !== id) })),
  addAhorro: (ahorro) => set((s) => ({ ahorros: [{ ...ahorro, id: uid() }, ...s.ahorros] })),
  removeAhorro: (id) => set((s) => ({ ahorros: s.ahorros.filter((a) => a.id !== id) })),
  aportarAhorro: (id, monto) =>
    set((s) => ({
      ahorros: s.ahorros.map((a) => (a.id === id ? { ...a, actual: a.actual + monto } : a)),
    })),
}));