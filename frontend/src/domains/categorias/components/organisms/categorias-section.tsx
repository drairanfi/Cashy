import { Tag } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { Categoria } from '@/types/categoria.types';

import { CategoriaCard } from '../molecules/categoria-card';
import { categoriasMessages } from '../../messages';

interface CategoriasSectionProps {
  categorias: Categoria[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (categoria: Categoria) => void;
}

export function CategoriasSection({
  categorias,
  isLoading,
  onCreate,
  onEdit
}: CategoriasSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {categoriasMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{categoriasMessages.subtitle}</p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {categoriasMessages.addAction}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={2} />
      ) : categorias.length === 0 ? (
        <EmptyState
          icon={<Tag className="size-5" />}
          title={categoriasMessages.empty.title}
          text={categoriasMessages.empty.text}
          actionLabel={categoriasMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {categorias.map(categoria => (
            <CategoriaCard key={categoria.id} categoria={categoria} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}
