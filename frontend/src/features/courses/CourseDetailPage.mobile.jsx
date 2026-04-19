import { ClipboardList, Users, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'grades',      label: 'Notas',         icon: ClipboardList },
  { id: 'students',    label: 'Alumnos',        icon: Users },
  { id: 'evaluations', label: 'Evaluaciones',   icon: ClipboardList },
  { id: 'stats',       label: 'Estadísticas',   icon: BarChart3 },
];

const NAV_HEIGHT = 56;

export function CourseDetailPageMobile({ activeTab, onTabChange, children }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Scrollable content with bottom padding to clear the fixed nav */}
      <div
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
        style={{ paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))` }}
      >
        {children}
      </div>

      {/* Fixed bottom navigation */}
      <nav
        data-tour="course-tabs"
        aria-label="Secciones del curso"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
                style={{
                  color: active ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-primary-50)' : 'transparent',
                  minHeight: `${NAV_HEIGHT}px`,
                }}
                aria-label={label}
                aria-pressed={active}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
