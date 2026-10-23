import { apiFetch } from '@/lib/api/client';
import type {
  CreateRegistroModuloPayload,
  Modulo,
  ModuloClave,
  ModuloPersonalizado,
  RegistroModulo
} from '@/types/modulo.types';

export const modulosApi = {
  list: () => apiFetch<Modulo[]>('/modulos'),

  setActivo: (clave: ModuloClave, activo: boolean) =>
    apiFetch<Modulo>(`/modulos/${clave}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo })
    }),

  removeDatos: (clave: ModuloClave) =>
    apiFetch<Modulo>(`/modulos/${clave}`, { method: 'DELETE' }),

  listPersonalizados: () => apiFetch<ModuloPersonalizado[]>('/modulos-personalizados'),

  createPersonalizado: (nombre: string) =>
    apiFetch<ModuloPersonalizado>('/modulos-personalizados', {
      method: 'POST',
      body: JSON.stringify({ nombre })
    }),

  setPersonalizadoActivo: (id: string, activo: boolean) =>
    apiFetch<ModuloPersonalizado>(`/modulos-personalizados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo })
    }),

  removePersonalizado: (id: string) =>
    apiFetch<void>(`/modulos-personalizados/${id}`, { method: 'DELETE' }),

  listRegistros: (moduloId: string) =>
    apiFetch<RegistroModulo[]>(`/modulos-personalizados/${moduloId}/registros`),

  createRegistro: (moduloId: string, payload: CreateRegistroModuloPayload) =>
    apiFetch<RegistroModulo>(`/modulos-personalizados/${moduloId}/registros`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  removeRegistro: (moduloId: string, registroId: string) =>
    apiFetch<void>(`/modulos-personalizados/${moduloId}/registros/${registroId}`, {
      method: 'DELETE'
    })
};
