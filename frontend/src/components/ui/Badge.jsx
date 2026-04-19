export function Badge({ situacion }) {
  if (situacion === 'aprobado') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: 'var(--color-grade-ok)', color: 'var(--color-grade-ok-text)' }}
      >
        ✓ Aprobado/a
      </span>
    );
  }
  if (situacion === 'reprobado') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: 'var(--color-grade-fail)', color: 'var(--color-grade-fail-text)' }}
      >
        ✗ Reprobado/a
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
      — Sin notas
    </span>
  );
}

export function CategoryBadge({ category }) {
  const map = {
    academica:  { label: 'Académica',  bg: 'var(--badge-academic-bg)',  color: 'var(--badge-academic-text)' },
    conductual: { label: 'Conductual', bg: 'var(--badge-conduct-bg)',   color: 'var(--badge-conduct-text)' },
    positiva:   { label: 'Positiva',   bg: 'var(--badge-positive-bg)',  color: 'var(--badge-positive-text)' },
    apoderado:  { label: 'Apoderado',  bg: 'var(--badge-guardian-bg)',  color: 'var(--badge-guardian-text)' },
    otro:       { label: 'Otro',       bg: 'var(--badge-other-bg)',     color: 'var(--badge-other-text)' },
  };
  const { label, bg, color } = map[category] || map.otro;
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
