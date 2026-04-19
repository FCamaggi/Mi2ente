import { useThemeStore, THEMES } from '../../store/themeStore';
import { usersApi } from '../../api/users.api';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  const handleChange = async (id) => {
    setTheme(id);
    try { await usersApi.updateMe({ theme: id }); } catch {}
  };

  return (
    <div className="px-3 py-2" data-tour="theme-switcher">
      <p className="text-xs text-[var(--color-sidebar-text)] opacity-60 mb-2 uppercase tracking-wide">Tema</p>
      <div className="flex flex-wrap gap-1.5">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleChange(t.id)}
            title={t.name}
            className={`text-base leading-none p-1.5 rounded-[var(--radius-sm)] transition-all ${theme === t.id ? 'bg-[var(--color-sidebar-active)] ring-2 ring-white/30' : 'opacity-60 hover:opacity-100'}`}
          >
            {t.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
