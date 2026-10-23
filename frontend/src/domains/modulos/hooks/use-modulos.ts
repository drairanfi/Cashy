'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateRegistroModuloPayload, ModuloClave } from '@/types/modulo.types';

import { modulosApi } from '../api';

export function useModulos() {
  return useQuery({
    queryKey: ['modulos'],
    queryFn: modulosApi.list
  });
}

export function useModulosPersonalizados() {
  return useQuery({
    queryKey: ['modulos-personalizados'],
    queryFn: modulosApi.listPersonalizados
  });
}

function useInvalidateModulos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['modulos'] });
    queryClient.invalidateQueries({ queryKey: ['modulos-personalizados'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['cuentas'] });
  };
}

export function useSetModuloActivo() {
  const invalidate = useInvalidateModulos();

  return useMutation({
    mutationFn: (input: { clave: ModuloClave; activo: boolean }) =>
      modulosApi.setActivo(input.clave, input.activo),
    onSuccess: invalidate
  });
}

export function useDeleteModuloDatos() {
  const invalidate = useInvalidateModulos();

  return useMutation({
    mutationFn: (clave: ModuloClave) => modulosApi.removeDatos(clave),
    onSuccess: invalidate
  });
}

export function useCreateModuloPersonalizado() {
  const invalidate = useInvalidateModulos();

  return useMutation({
    mutationFn: (nombre: string) => modulosApi.createPersonalizado(nombre),
    onSuccess: invalidate
  });
}

export function useSetModuloPersonalizadoActivo() {
  const invalidate = useInvalidateModulos();

  return useMutation({
    mutationFn: (input: { id: string; activo: boolean }) =>
      modulosApi.setPersonalizadoActivo(input.id, input.activo),
    onSuccess: invalidate
  });
}

export function useRegistrosModulo(moduloId: string) {
  return useQuery({
    queryKey: ['modulos-registros', moduloId],
    queryFn: () => modulosApi.listRegistros(moduloId),
    enabled: Boolean(moduloId)
  });
}

export function useCreateRegistroModulo(moduloId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRegistroModuloPayload) =>
      modulosApi.createRegistro(moduloId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos-registros', moduloId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
    }
  });
}

export function useDeleteRegistroModulo(moduloId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registroId: string) => modulosApi.removeRegistro(moduloId, registroId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos-registros', moduloId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
    }
  });
}

export function useDeleteModuloPersonalizado() {
  const invalidate = useInvalidateModulos();

  return useMutation({
    mutationFn: (id: string) => modulosApi.removePersonalizado(id),
    onSuccess: invalidate
  });
}
