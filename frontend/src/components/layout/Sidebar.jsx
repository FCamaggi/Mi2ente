import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User, Settings, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Mi2enteLogo } from './Mi2enteLogo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Mis Cursos', icon: BookOpen },
  { to: '/profile', label: 'Perfil', icon: User },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <div className="flex flex-col gap-0.5">
          <Mi2enteLogo className="h-5 w-auto" />
          {user && (
            <p className="text-xs opacity-60 truncate max-w-[160px]">{user.name}</p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-[var(--color-sidebar-active)] text-white'
                  : 'text-[var(--color-sidebar-text)] hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme */}
      <div className="border-t border-white/10 pt-3">
        <ThemeSwitcher />
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-sidebar-text)] hover:bg-white/10 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
