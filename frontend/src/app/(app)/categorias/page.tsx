'use client';

import { useState } from 'react';

import { CategoriaModal } from '@/domains/categorias/components/organisms/categoria-modal';
import { CategoriasSection } from '@/domains/categorias/components/organisms/categorias-section';
import { useCategorias } from '@/domains/categorias/hooks/use-categorias';
import type { Categoria } from '@/types/categoria.types';

export default function CategoriesPage() {
  const { data: categorias = [], isLoading } = useCategorias();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  const openCreate = () => {
    setEditingCategoria(null);
    setIsModalOpen(true);
  };

  const openEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setIsModalOpen(true);
  };

  return (
    <>
      <CategoriasSection
        categorias={categorias}
        isLoading={isLoading}
        onCreate={openCreate}
        onEdit={openEdit}
      />
      <CategoriaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoria={editingCategoria}
      />
    </>
  );
}
