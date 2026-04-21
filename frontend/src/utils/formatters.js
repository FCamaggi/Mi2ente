import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function parseDisplayDate(date) {
  if (typeof date !== 'string') return date;
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return parseISO(date);
}

export function formatDate(date) {
  if (!date) return '';
  try {
    const d = parseDisplayDate(date);
    return format(d, 'd MMM yyyy', { locale: es });
  } catch {
    return '';
  }
}

export function formatShortDate(date) {
  if (!date) return '';
  try {
    const d = parseDisplayDate(date);
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
