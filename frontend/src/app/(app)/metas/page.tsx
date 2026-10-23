'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

import { useState } from 'react';

import { MetaModal } from '@/domains/metas/components/organisms/meta-modal';
import { MetasSection } from '@/domains/metas/components/organisms/metas-section';
import { useMetas } from '@/domains/metas/hooks/use-metas';
import type { Meta } from '@/types/meta.types';

export default function GoalsPage() {
  const { data: metas = [] } = useMetas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="metas" />
      </div>
      <MetasSection
        metas={metas}
        onCreate={() => {
          setEditingMeta(null);
          setIsModalOpen(true);
        }}
        onEdit={meta => {
          setEditingMeta(meta);
          setIsModalOpen(true);
        }}
      />
      <MetaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meta={editingMeta}
      />
    </>
  );
}
