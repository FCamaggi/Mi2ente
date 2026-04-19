import { create } from 'zustand';

export const THEMES = [
  { id: 'rosa',   name: 'Rosa Sakura',  emoji: '🌸', description: 'Suave y bonito' },
  { id: 'oceano', name: 'Azul Océano',  emoji: '🌊', description: 'Profesional y tranquilo' },
  { id: 'bosque', name: 'Verde Bosque', emoji: '🌿', description: 'Natural y fresco' },
  { id: 'noche',  name: 'Noche Índigo', emoji: '🌙', description: 'Dark mode elegante' },
  { id: 'otono',  name: 'Otoño Dorado', emoji: '🌻', description: 'Cálido y acogedor' },
];

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('mi2ente-theme') || localStorage.getItem('profeapp-theme') || 'rosa',
  setTheme: (theme) => set({ theme }),
}));
