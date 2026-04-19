import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluationsApi } from '../../api/evaluations.api';
import { TYPE_LABELS, formatDate } from '../../utils/formatters';
import { EvaluationForm } from './EvaluationForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function EvaluationsList({ courseId, evaluations, totalWeight, weightValid, onUpdate }) {
  const [editingEval, setEditingEval] = useState(null);
  const [deletingEval, setDeletingEval] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const groups = useMemo(() => {
    const map = new Map();

    evaluations.forEach((evaluation) => {
      const key = evaluation.groupName || `__single__${evaluation._id || evaluation.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: evaluation.groupName || 'Sin grupo',
          groupWeight: evaluation.groupName ? evaluation.groupWeight : null,
          items: []
        });
      }
      map.get(key).items.push(evaluation);
    });

    return Array.from(map.values());
  }, [evaluations]);

  const handleDelete = async () => {
    if (!deletingEval) return;
    setLoadingDelete(true);
    try {
      await evaluationsApi.remove(courseId, deletingEval._id || deletingEval.id);
      toast.success('Evaluación eliminada');
      setDeletingEval(null);
      onUpdate?.();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      {!weightValid && (
        <div className="mb-4 px-4 py-2 border rounded-[var(--radius-sm)] text-sm flex items-center gap-2" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-border)', color: 'var(--color-warning)' }}>
          ⚠️ Las ponderaciones suman <strong>{totalWeight.toFixed(1)}%</strong>. Ajusta para que sumen 100%.
        </div>
      )}
      {evaluations.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">Sin evaluaciones. Crea la primera.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
              <div className="px-4 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">{group.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {group.groupWeight !== null ? `Grupo: ${group.groupWeight}% total` : 'Evaluaciones independientes'}
                    </p>
                  </div>
                  {group.groupWeight !== null && (
                    <span className="text-xs rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-[var(--color-primary-600)]">
                      {group.items.length} evaluaciones
                    </span>
                  )}
                </div>
              </div>

              {group.items.map((ev, i) => (
                <div key={ev._id || ev.id} className={`flex items-center gap-3 px-4 py-3 group ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--color-text-primary)] truncate">{ev.name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)] shrink-0">{TYPE_LABELS[ev.type] || ev.type}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--color-text-secondary)] flex-wrap">
                      <span className="font-semibold text-[var(--color-primary-500)]">
                        {ev.groupName ? `${ev.weight}% dentro del grupo` : `${ev.weight}%`}
                      </span>
                      {ev.groupName && <span className="text-[var(--color-text-primary)]">Efectiva: {ev.effectiveWeight?.toFixed?.(1) ?? ev.effectiveWeight}%</span>}
                      {ev.date && <span>{formatDate(ev.date)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setEditingEval(ev)} className="p-1.5 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeletingEval(ev)} className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-right text-[var(--color-text-secondary)]">
        Total del curso:{' '}
        <strong style={{ color: weightValid ? 'var(--color-grade-ok-text)' : 'var(--color-warning)' }}>
          {totalWeight.toFixed(1)}%
        </strong>
        {weightValid && <span className="ml-1" style={{ color: 'var(--color-grade-ok-text)' }}>✓</span>}
      </div>

      {editingEval && (
        <EvaluationForm courseId={courseId} evaluation={editingEval} onClose={() => setEditingEval(null)} onSave={() => { setEditingEval(null); onUpdate?.(); }} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingEval)}
        title="Eliminar evaluación"
        message={deletingEval ? `¿Eliminar "${deletingEval.name}"? Se borrarán sus notas.` : ''}
        confirmLabel="Eliminar"
        loading={loadingDelete}
        onClose={() => setDeletingEval(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
