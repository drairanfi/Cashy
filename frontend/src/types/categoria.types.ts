export interface Categoria {
  id: string;
  nombre: string;
}

export interface CreateCategoriaPayload {
  nombre: string;
}

export interface UpdateCategoriaPayload {
  nombre: string;
}
