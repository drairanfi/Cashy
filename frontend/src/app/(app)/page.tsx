'use client';

import { useState } from 'react';

import { Skeleton } from '@/components/atoms/skeleton';
import { InsightsPanel } from '@/domains/ai/components/organisms/insights-panel';
import { useInsights } from '@/domains/ai/hooks/use-insights';
import { DashboardHeader } from '@/domains/dashboard/components/organisms/dashboard-header';
import { RecentMovements } from '@/domains/dashboard/components/organisms/recent-movements';
import { useDashboard } from '@/domains/dashboard/hooks/use-dashboard';
import { MetaModal } from '@/domains/metas/components/organisms/meta-modal';
import { MetasSection } from '@/domains/metas/components/organisms/metas-section';
import { useMetas } from '@/domains/metas/hooks/use-metas';
import { useModulos } from '@/domains/modulos/hooks/use-modulos';
import { useSessionStore } from '@/store/session.store';
import type { Meta } from '@/types/meta.types';

export default function DashboardPage() {
  const user = useSessionStore(state => state.user);
  const { data: summary, isLoading } = useDashboard();
  const { data: metas = [] } = useMetas();
  const { data: insights } = useInsights();
  const { data: modulos = [] } = useModulos();
  const isMetasActivo = modulos.some(modulo => modulo.clave === 'metas' && modulo.activo);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [hasSeenInsights, setHasSeenInsights] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

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
        cuentas={summary.cuentas}
        hasNotifications={!hasSeenInsights && (insights?.insights.length ?? 0) > 0}
        onOpenNotifications={() => {
          setHasSeenInsights(true);
          setIsInsightsOpen(true);
        }}
      />

      <RecentMovements />

      {isMetasActivo && (
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
      )}

      <MetaModal
        open={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        meta={editingMeta}
      />

      <InsightsPanel open={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />
    </div>
  );
}
