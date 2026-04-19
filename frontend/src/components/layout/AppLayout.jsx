import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Mi2enteLogo } from './Mi2enteLogo';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full sidebar-mobile-enter">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
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
