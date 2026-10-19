import { create } from 'zustand';
import type { Usuario } from '@/types';

interface UserState {
  user: Usuario | null;
  sueldo: number | null;
  setUser: (user: Usuario | null) => void;
  setSueldo: (sueldo: number | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  sueldo: null,
  setUser: (user) => set({ user }),
  setSueldo: (sueldo) => set({ sueldo }),
  logout: () => set({ user: null, sueldo: null }),
}));
