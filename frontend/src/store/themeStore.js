import { create } from 'zustand';

export const THEMES = [
  { id: 'rosa',   name: 'Rosa Sakura',  emoji: '🌸', description: 'Suave y bonito' },
  { id: 'lila',   name: 'Lila Lavanda', emoji: '🪻', description: 'Elegante y relajante' },
  { id: 'oceano', name: 'Azul Océano',  emoji: '🌊', description: 'Profesional y tranquilo' },
  { id: 'bosque', name: 'Verde Bosque', emoji: '🌿', description: 'Natural y fresco' },
  { id: 'noche',  name: 'Noche Índigo', emoji: '🌙', description: 'Dark mode elegante' },
  { id: 'otono',  name: 'Otoño Cálido', emoji: '🍂', description: 'Tierra y atardecer' },
];

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('mi2ente-theme') || localStorage.getItem('profeapp-theme') || 'rosa',
  setTheme: (theme) => set({ theme }),
}));
