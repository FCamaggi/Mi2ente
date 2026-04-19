export function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
      <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-text-primary)]'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{sub}</p>}
    </div>
  );
}
