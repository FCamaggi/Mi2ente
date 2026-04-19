import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function ThemeProvider({ children }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mi2ente-theme', theme);
    localStorage.removeItem('profeapp-theme');
  }, [theme]);

  return children;
}
