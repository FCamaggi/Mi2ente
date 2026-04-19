import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TYPE_LABELS, formatDate } from '../../utils/formatters';

export function EvaluationsListMobile({ evaluations, groups, totalWeight, weightValid, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (evaluations.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
        Sin evaluaciones. Crea la primera.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-[var(--radius-md)] border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Group header */}
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b text-left"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
            onClick={() => toggle(group.id)}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {group.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {group.groupWeight !== null
                  ? `Grupo: ${group.groupWeight}% · ${group.items.length} evaluaciones`
                  : 'Evaluaciones independientes'}
              </p>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {expanded[group.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {/* Items */}
          {(expanded[group.id] ?? true) && group.items.map((ev, i) => (
            <div
              key={ev._id || ev.id}
              className={`px-4 py-3 flex flex-col gap-2 ${i > 0 ? 'border-t' : ''}`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {ev.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {TYPE_LABELS[ev.type] || ev.type}
                    {ev.date && ` · ${formatDate(ev.date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(ev)}
                    className="p-2 rounded"
                    style={{ color: 'var(--color-text-secondary)' }}
                    aria-label="Editar evaluación"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(ev)}
                    className="p-2 rounded"
                    style={{ color: '#f87171' }}
                    aria-label="Eliminar evaluación"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold" style={{ color: 'var(--color-primary-500)' }}>
                  {ev.groupName ? `${ev.weight}% en grupo` : `${ev.weight}%`}
                </span>
                {ev.groupName && (
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Efectiva: {ev.effectiveWeight?.toFixed?.(1) ?? ev.effectiveWeight}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="text-xs text-right mt-1" style={{ color: 'var(--color-text-secondary)' }}>
        Total del curso:{' '}
        <strong style={{ color: weightValid ? 'var(--color-grade-ok-text)' : 'var(--color-warning)' }}>
          {totalWeight.toFixed(1)}%
        </strong>
        {weightValid && <span className="ml-1" style={{ color: 'var(--color-grade-ok-text)' }}>✓</span>}
      </div>
    </div>
  );
}
