import type { Categoria } from '@/types/categoria.types';

import { categoriasMessages } from '../../messages';

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
}

export function CategoriaCard({ categoria, onEdit }: CategoriaCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="truncate font-medium text-foreground">{categoria.nombre}</p>
      <button
        type="button"
        onClick={() => onEdit(categoria)}
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        {categoriasMessages.card.edit}
      </button>
    </div>
  );
}
