import { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useServicios } from '../../hooks/useServicios';
import { useMetas } from '../../hooks/useMetas';
import { useUserStore } from '../../store/userStore';
import type { Servicio, Meta } from '../../types';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { DashboardHeader } from '../../components/organisms/DashboardHeader';
import { MetasSection } from '../../components/organisms/MetasSection';
import { ServiciosSection } from '../../components/organisms/ServiciosSection';
import { ModalServicio } from '../../components/organisms/ModalServicio';
import { ModalMeta } from '../../components/organisms/ModalMeta';
import { ModalConfigurarSueldo } from '../../components/organisms/ModalConfigurarSueldo';
import { Button } from '../../components/atoms/Button';

export function Dashboard() {
  const user = useUserStore((s) => s.user);
  const { data: resumen, isLoading } = useDashboard();
  const { data: servicios = [] } = useServicios();
  const { data: metas = [] } = useMetas();

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
        <p className="section__empty">Cargando...</p>
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
    </DashboardLayout>
  );
}
