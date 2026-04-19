import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Menu, LayoutDashboard, BookOpen, User, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Mi2enteLogo } from './Mi2enteLogo';

const NAV_ICONS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses',   icon: BookOpen,        label: 'Mis Cursos' },
  { to: '/profile',   icon: User,            label: 'Perfil' },
  { to: '/settings',  icon: Settings,        label: 'Configuración' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Desktop full sidebar (≥1024px) */}
      <div className="hidden lg:flex w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Tablet compact icon sidebar (768–1023px) */}
      <div
        className="hidden md:flex lg:hidden w-14 flex-shrink-0 flex-col items-center py-4 gap-1 border-r border-[var(--color-border)]"
        style={{ background: 'var(--color-sidebar-bg)' }}
      >
        <Mi2enteLogo className="h-5 w-5 mb-3" />
        {NAV_ICONS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `p-2.5 rounded-[var(--radius-sm)] transition-all ${
                isActive
                  ? 'bg-[var(--color-sidebar-active)] text-white'
                  : 'text-[var(--color-sidebar-text)] hover:bg-white/10'
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </div>

      {/* Mobile Sidebar overlay (<768px) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full sidebar-mobile-enter">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header (<768px) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
          >
            <Menu size={20} />
          </button>
          <Mi2enteLogo className="h-5 w-auto text-[var(--color-text-primary)]" />
        </header>

        <main key={location.pathname} className="flex-1 overflow-y-auto page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
