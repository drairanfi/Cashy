import { useState } from 'react';
import {
  useCategorias,
  useCreateCategoria,
  useDeleteCategoria,
} from '@/hooks/useCategorias';
import { GASTO_CATEGORIAS, type Categoria } from '@/types';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { PageHeader } from '@/components/molecules/PageHeader';
import { AddCard } from '@/components/molecules/AddCard';
import { ItemCard } from '@/components/molecules/ItemCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ListSkeleton } from '@/components/molecules/ListSkeleton';
import { Badge } from '@/components/atoms/Badge';
import { TagIcon } from '@/components/atoms/Icon';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalCategoria } from '@/components/organisms/ModalCategoria';

export function Categorias() {
  const { data: categorias = [], isLoading } = useCategorias();
  const createCategoria = useCreateCategoria();
  const deleteCategoria = useDeleteCategoria();

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Categoria | null>(null);

  const openModal = () => {
    setError(null);
    setModalOpen(true);
  };

  const handleCreate = (nombre: string) => {
    createCategoria.mutate(nombre, {
      onSuccess: () => setModalOpen(false),
      onError: (err) => setError((err as Error).message),
    });
  };

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Categorías' }]} />
      <PageHeader title="Categorías" subtitle="Organizá tus gastos por tipo" />

      <section className="section">
        <h2 className="section__title">Personalizadas</h2>
        <div className="section__list" aria-busy={isLoading}>
          <AddCard
            title="Agregar nueva categoría"
            hint="Creá una categoría para clasificar tus gastos"
            onClick={openModal}
          />
          {isLoading ? (
            <ListSkeleton count={2} />
          ) : categorias.length === 0 ? (
            <EmptyState
              icon={<TagIcon size={24} />}
              title="Todavía no creaste categorías propias"
              text="Armá tus propias categorías para clasificar mejor tus gastos."
              actionLabel="Nueva categoría"
              onAction={openModal}
            />
          ) : (
            categorias.map((categoria) => (
              <ItemCard
                key={categoria.id}
                titulo={categoria.nombre}
                onDelete={() => setToDelete(categoria)}
              />
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Predeterminadas</h2>
        <div className="section__list">
          {GASTO_CATEGORIAS.map((categoria) => (
            <ItemCard
              key={categoria}
              titulo={categoria}
              badge={<Badge tone="neutral">Predeterminada</Badge>}
            />
          ))}
        </div>
      </section>

      <ModalCategoria
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        error={error}
        submitting={createCategoria.isPending}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar categoría"
        message={`¿Eliminar "${toDelete?.nombre}"?`}
        onConfirm={() => {
          if (toDelete) deleteCategoria.mutate(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}
