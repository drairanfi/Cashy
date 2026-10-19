import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChatAssistant } from '@/components/organisms/ChatAssistant';
import {
  DumbbellIcon,
  HomeIcon,
  MoreIcon,
  PiggyIcon,
  TagIcon,
  UtensilsIcon,
  WalletIcon,
} from '@/components/atoms/Icon';

interface DashboardLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: 'Inicio', to: '/', icon: <HomeIcon /> },
  { label: 'Gastos', to: '/gastos', icon: <WalletIcon /> },
  { label: 'Comida', to: '/comida', icon: <UtensilsIcon /> },
  { label: 'Gimnasio', to: '/gimnasio', icon: <DumbbellIcon /> },
  { label: 'Ahorros', to: '/ahorros', icon: <PiggyIcon /> },
  { label: 'Categorías', to: '/categorias', icon: <TagIcon /> },
  { label: 'Más', to: '/mas', icon: <MoreIcon /> },
];

const TAB_LABELS = ['Inicio', 'Gastos', 'Ahorros', 'Categorías', 'Más'];

const TAB_ITEMS = NAV_ITEMS.filter((item) => TAB_LABELS.includes(item.label));

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="dashboard-shell">
      <header className="app-bar">
        <NavLink to="/" className="app-bar__brand">
          Cashy
        </NavLink>
        <button
          type="button"
          className="app-bar__menu"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="side-menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </header>

      {menuOpen && (
        <>
          <div
            className="side-menu__overlay"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="side-menu"
            className="side-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="side-menu__header">
              <span className="side-menu__brand">Cashy</span>
              <button
                ref={closeButtonRef}
                type="button"
                className="side-menu__close"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="side-menu__nav">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `side-menu__item ${isActive ? 'side-menu__item--active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}

      <div className="dashboard-main">
        <div className="dashboard-layout">
          <main className="dashboard-content">{children}</main>
        </div>
      </div>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {TAB_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            <span className="bottom-nav__icon">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <ChatAssistant />
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
