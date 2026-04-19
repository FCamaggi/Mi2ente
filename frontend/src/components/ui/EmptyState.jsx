export function EmptyState({ emoji = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
