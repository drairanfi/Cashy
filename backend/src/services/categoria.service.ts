import type { Categoria } from '@prisma/client';
import { categoriaRepository } from '../repositories/categoria.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { CreateCategoriaInput } from '../schemas/categoria.schema.js';

function toDTO(categoria: Categoria) {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
  };
}

export async function listCategoriasUseCase(usuarioId: string) {
  const categorias = await categoriaRepository.findByUsuario(usuarioId);
  return categorias.map(toDTO);
}

export async function createCategoriaUseCase(usuarioId: string, data: CreateCategoriaInput) {
  const existentes = await categoriaRepository.findByUsuario(usuarioId);
  const duplicada = existentes.some(
    (c) => c.nombre.toLowerCase() === data.nombre.toLowerCase(),
  );
  if (duplicada) {
    throw new HttpError(409, 'Ya tenés una categoría con ese nombre');
  }

  const categoria = await categoriaRepository.create(usuarioId, data.nombre);
  return toDTO(categoria);
}

export async function deleteCategoriaUseCase(usuarioId: string, id: string) {
  const categoria = await categoriaRepository.findById(id);
  if (!categoria || categoria.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Categoría no encontrada');
  }

  return categoriaRepository.remove(id);
}
