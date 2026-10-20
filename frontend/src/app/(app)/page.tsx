'use client';

import { useState } from 'react';

import { Skeleton } from '@/components/atoms/skeleton';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/domains/dashboard/components/organisms/dashboard-header';
import { QuickRegister } from '@/domains/dashboard/components/organisms/quick-register';
import { RecentMovements } from '@/domains/dashboard/components/organisms/recent-movements';
import { useDashboard } from '@/domains/dashboard/hooks/use-dashboard';
import { MetaModal } from '@/domains/metas/components/organisms/meta-modal';
import { MetasSection } from '@/domains/metas/components/organisms/metas-section';
import { useMetas } from '@/domains/metas/hooks/use-metas';
import { ServicioModal } from '@/domains/servicios/components/organisms/servicio-modal';
import { ServiciosSection } from '@/domains/servicios/components/organisms/servicios-section';
import { useServicios } from '@/domains/servicios/hooks/use-servicios';
import { SueldoPrompt } from '@/domains/sueldo/components/molecules/sueldo-prompt';
import { SueldoModal } from '@/domains/sueldo/components/organisms/sueldo-modal';
import { sueldoMessages } from '@/domains/sueldo/messages';
import { useSessionStore } from '@/store/session.store';
import type { Meta } from '@/types/meta.types';
import type { Servicio } from '@/types/servicio.types';

export default function DashboardPage() {
  const user = useSessionStore(state => state.user);
  const { data: summary, isLoading } = useDashboard();
  const { data: servicios = [] } = useServicios();
  const { data: metas = [] } = useMetas();

  const [isSueldoModalOpen, setIsSueldoModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isServicioModalOpen, setIsServicioModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando panel">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="size-10 rounded-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        nombre={user?.nombre ?? 'Usuario'}
        saldoDisponible={summary.saldoDisponible}
        sueldo={summary.sueldo}
        ingresos={summary.ingresos}
        gastos={summary.gastos}
        ahorros={summary.ahorros}
      />

      {summary.sueldo === 0 ? (
        <SueldoPrompt onConfigure={() => setIsSueldoModalOpen(true)} />
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setIsSueldoModalOpen(true)}>
            {sueldoMessages.editAction}
          </Button>
        </div>
      )}

      <QuickRegister />

      <RecentMovements />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MetasSection
          metas={metas}
          onCreate={() => {
            setEditingMeta(null);
            setIsMetaModalOpen(true);
          }}
          onEdit={meta => {
            setEditingMeta(meta);
            setIsMetaModalOpen(true);
          }}
        />
        <ServiciosSection
          servicios={servicios}
          onCreate={() => {
            setEditingServicio(null);
            setIsServicioModalOpen(true);
          }}
          onEdit={servicio => {
            setEditingServicio(servicio);
            setIsServicioModalOpen(true);
          }}
        />
      </div>

      <SueldoModal
        open={isSueldoModalOpen}
        onClose={() => setIsSueldoModalOpen(false)}
        currentAmount={summary.sueldo}
      />
      <MetaModal
        open={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        meta={editingMeta}
      />
      <ServicioModal
        open={isServicioModalOpen}
        onClose={() => setIsServicioModalOpen(false)}
        servicio={editingServicio}
      />
    </div>
  );
}
