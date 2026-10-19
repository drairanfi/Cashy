import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useServicios } from '@/hooks/useServicios';
import { useMetas } from '@/hooks/useMetas';
import { useInsights } from '@/hooks/useInsights';
import { useUserStore } from '@/store/userStore';
import type { Servicio, Meta } from '@/types';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DashboardHeader } from '@/components/organisms/DashboardHeader';
import { InsightPanel } from '@/components/organisms/InsightPanel';
import { MetasSection } from '@/components/organisms/MetasSection';
import { ServiciosSection } from '@/components/organisms/ServiciosSection';
import { RegistroRapido } from '@/components/organisms/RegistroRapido';
import { UltimosMovimientos } from '@/components/organisms/UltimosMovimientos';
import { ModalServicio } from '@/components/organisms/ModalServicio';
import { ModalMeta } from '@/components/organisms/ModalMeta';
import { ModalConfigurarSueldo } from '@/components/organisms/ModalConfigurarSueldo';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';

export function Dashboard() {
  const user = useUserStore((s) => s.user);
  const { data: resumen, isLoading } = useDashboard();
  const { data: servicios = [] } = useServicios();
  const { data: metas = [] } = useMetas();
  const { data: insightsData } = useInsights();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [servicioModalOpen, setServicioModalOpen] = useState(false);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [sueldoModalOpen, setSueldoModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  const openCreateServicio = () => {
    setEditingServicio(null);
    setServicioModalOpen(true);
  };

  const openEditServicio = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setServicioModalOpen(true);
  };

  const openCreateMeta = () => {
    setEditingMeta(null);
    setMetaModalOpen(true);
  };

  const openEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setMetaModalOpen(true);
  };

  if (isLoading || !resumen) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando panel">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        nombre={user?.nombre ?? 'Usuario'}
        saldoDisponible={resumen.saldoDisponible}
        sueldo={resumen.sueldo}
        ingresos={resumen.ingresos}
        gastos={resumen.gastos}
        ahorros={resumen.ahorros}
        hasNotifications={!notificationsSeen && (insightsData?.insights.length ?? 0) > 0}
        onOpenNotifications={() => {
          setNotificationsSeen(true);
          setNotificationsOpen(true);
        }}
      />

      {resumen.sueldo === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Configurá tu sueldo para empezar</p>
          <p className="empty-state__text">
            El saldo disponible se calcula a partir de tu sueldo, servicios y metas.
          </p>
          <Button onClick={() => setSueldoModalOpen(true)}>Configurar sueldo</Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setSueldoModalOpen(true)}>
            Editar sueldo
          </Button>
        </div>
      )}

      <RegistroRapido />

      <UltimosMovimientos />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MetasSection metas={metas} onCrear={openCreateMeta} onEditar={openEditMeta} />
        <ServiciosSection servicios={servicios} onCrear={openCreateServicio} onEditar={openEditServicio} />
      </div>
      <ModalServicio
        open={servicioModalOpen}
        onClose={() => setServicioModalOpen(false)}
        servicio={editingServicio}
      />
      <ModalMeta open={metaModalOpen} onClose={() => setMetaModalOpen(false)} meta={editingMeta} />
      <ModalConfigurarSueldo
        open={sueldoModalOpen}
        onClose={() => setSueldoModalOpen(false)}
        currentMonto={resumen.sueldo}
      />
      <InsightPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </DashboardLayout>
  );
}
