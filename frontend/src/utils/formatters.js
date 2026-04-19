import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'd MMM yyyy', { locale: es });
  } catch {
    return '';
  }
}

export function formatShortDate(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'd/MM', { locale: es });
  } catch {
    return '';
  }
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

export const CATEGORY_LABELS = {
  academica: 'Académica',
  conductual: 'Conductual',
  positiva: 'Positiva',
  apoderado: 'Apoderado',
  otro: 'Otro'
};

export const TYPE_LABELS = {
  prueba: 'Prueba',
  tarea: 'Tarea',
  trabajo: 'Trabajo',
  disertacion: 'Disertación',
  otro: 'Otro'
};
