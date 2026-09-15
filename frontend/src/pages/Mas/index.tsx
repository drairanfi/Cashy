import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { clearTokens } from '../../services/api/client';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { Button } from '../../components/atoms/Button';

export function Mas() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const logoutStore = useUserStore((s) => s.logout);

  const [notificaciones, setNotificaciones] = useState(true);
  const [resumenMensual, setResumenMensual] = useState(true);

  const handleLogout = () => {
    clearTokens();
    logoutStore();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <PageHeader title="Más" />

      <section className="section">
        <h2 className="section__title">Cuenta</h2>
        <div className="item-card">
          <div className="flex items-center gap-3">
            <span className="avatar">{user?.nombre.charAt(0).toUpperCase() ?? 'U'}</span>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-zinc-100">{user?.nombre ?? 'Usuario'}</p>
              <p className="text-xs text-zinc-400">{user?.email ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Preferencias</h2>
        <div className="flex flex-col gap-3">
          <div className="item-card">
            <p className="text-sm font-medium text-zinc-100">Notificaciones</p>
            <Toggle checked={notificaciones} onChange={setNotificaciones} />
          </div>
          <div className="item-card">
            <p className="text-sm font-medium text-zinc-100">Resumen mensual por email</p>
            <Toggle checked={resumenMensual} onChange={setResumenMensual} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Sesión</h2>
        <Button variant="danger" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </section>
    </DashboardLayout>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-violet-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}