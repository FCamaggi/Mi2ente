import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { evaluationsApi } from '../../api/evaluations.api';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const EVAL_TYPES = [
  { value: 'prueba',       label: 'Prueba' },
  { value: 'tarea',        label: 'Tarea' },
  { value: 'trabajo',      label: 'Trabajo' },
  { value: 'disertacion',  label: 'Disertación' },
  { value: 'otro',         label: 'Otro' },
];

const emptyGroupRow = () => ({ name: '', type: 'prueba', weight: '', fixed: false });

export function EvaluationForm({ courseId, evaluation, onClose, onSave }) {
  const editing = Boolean(evaluation);
  const [mode, setMode] = useState('single');

  // ── Single form ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:        evaluation?.name        || '',
    type:        evaluation?.type        || 'prueba',
    weight:      evaluation?.weight      ?? '',
    date:        evaluation?.date ? evaluation.date.split('T')[0] : '',
    description: evaluation?.description || ''
  });
  const [singleLoading, setSingleLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return; }
    const weight = parseFloat(form.weight);
    if (Number.isNaN(weight) || weight < 0 || weight > 100) {
      toast.error('La ponderación debe estar entre 0 y 100'); return;
    }
    const payload = {
      ...form,
      weight,
      ...(editing && evaluation?.groupName
        ? { groupName: evaluation.groupName, groupWeight: evaluation.groupWeight ?? null }
        : { groupName: '', groupWeight: null })
    };
    setSingleLoading(true);
    try {
      if (editing) {
        await evaluationsApi.update(courseId, evaluation._id || evaluation.id, payload);
        toast.success('Evaluación actualizada');
      } else {
        await evaluationsApi.create(courseId, payload);
        toast.success('Evaluación creada');
      }
      onSave?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al guardar');
    } finally {
      setSingleLoading(false);
    }
  };

  // ── Group form ───────────────────────────────────────────────────────────
  const [groupName, setGroupName]     = useState('');
  const [groupWeight, setGroupWeight] = useState('');
  const [weightMode, setWeightMode]   = useState('equitativo');
  const [rows, setRows] = useState([emptyGroupRow(), emptyGroupRow(), emptyGroupRow()]);
  const [groupLoading, setGroupLoading] = useState(false);

  // Effective weight per row based on mode and fixed flags
  const computedWeights = useMemo(() => {
    if (weightMode === 'equitativo') {
      const w = rows.length > 0 ? 100 / rows.length : 0;
      return rows.map(() => w);
    }
    // personalizado: fixed rows keep their value, unfixed rows share the remainder equally
    const fixedSum = rows.reduce((s, r) => r.fixed ? s + (parseFloat(r.weight) || 0) : s, 0);
    const unfixedCount = rows.filter(r => !r.fixed).length;
    const remaining = Math.max(0, 100 - fixedSum);
    const autoW = unfixedCount > 0 ? remaining / unfixedCount : 0;
    return rows.map(r => r.fixed ? (parseFloat(r.weight) || 0) : autoW);
  }, [rows, weightMode]);

  const weightSum = computedWeights.reduce((s, w) => s + w, 0);
  const gw = parseFloat(groupWeight) || 0;

  const updateRow = (i, field, value) => {
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      if (field === 'weight') return { ...r, weight: value, fixed: true };
      return { ...r, [field]: value };
    }));
  };

  const unfixRow = (i) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, weight: '', fixed: false } : r));

  const addRow = () => setRows(p => [...p, emptyGroupRow()]);
  const removeRow = (i) => setRows(p => p.filter((_, idx) => idx !== i));

  const switchWeightMode = (newMode) => {
    setWeightMode(newMode);
    setRows(prev => prev.map(r => ({ ...r, weight: '', fixed: false })));
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) { toast.error('El nombre del grupo es requerido'); return; }
    if (!groupWeight || gw < 0 || gw > 100) {
      toast.error('La ponderación del grupo debe estar entre 0 y 100'); return;
    }
    const validIndices = rows.reduce((acc, r, i) => r.name.trim() ? [...acc, i] : acc, []);
    if (validIndices.length === 0) { toast.error('Agrega al menos una evaluación al grupo'); return; }
    if (Math.abs(weightSum - 100) > 0.5) {
      toast.error(`La suma de pesos dentro del grupo es ${weightSum.toFixed(1)}% (debe ser 100%)`); return;
    }

    setGroupLoading(true);
    try {
      await Promise.all(
        validIndices.map((origIdx, order) => evaluationsApi.create(courseId, {
          name:        rows[origIdx].name.trim(),
          type:        rows[origIdx].type,
          weight:      parseFloat(computedWeights[origIdx].toFixed(2)),
          groupName:   groupName.trim(),
          groupWeight: gw,
          date:        '',
          description: '',
          order,
        }))
      );
      toast.success(`Grupo "${groupName}" creado con ${validIndices.length} evaluaciones`);
      onSave?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al guardar');
    } finally {
      setGroupLoading(false);
    }
  };

  return (
    <Modal isOpen title={editing ? 'Editar evaluación' : 'Nueva evaluación'} onClose={onClose}>
      {/* Mode tabs — only when creating */}
      {!editing && (
        <div className="mb-5 flex rounded-[var(--radius-sm)] border border-[var(--color-border)] overflow-hidden">
          {[
            { id: 'single', label: 'Individual' },
            { id: 'group',  label: 'Grupo de evaluaciones' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`flex-1 px-3 py-2 text-sm transition-colors ${mode === opt.id
                ? 'bg-[var(--color-primary-500)] text-white font-medium'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Individual ── */}
      {mode === 'single' && (
        <form onSubmit={handleSubmitSingle} className="flex flex-col gap-4">
          <Input label="Nombre *" value={form.name} onChange={set('name')} required placeholder="Ej: Prueba 1 — Fracciones" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Tipo" value={form.type} onChange={set('type')}>
              {EVAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input
              label="Ponderación (%) *"
              type="number" step="0.1" min="0" max="100"
              value={form.weight} onChange={set('weight')} required placeholder="Ej: 25"
            />
          </div>
          <Input label="Fecha (opcional)" type="date" value={form.date} onChange={set('date')} />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={singleLoading}>{editing ? 'Guardar' : 'Crear evaluación'}</Button>
          </div>
        </form>
      )}

      {/* ── Group ── */}
      {mode === 'group' && (
        <form onSubmit={handleSubmitGroup} className="flex flex-col gap-4">
          {/* Group header */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 flex flex-col gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Definición del grupo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del grupo *"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Ej: Controles"
                required
              />
              <Input
                label="Peso total en la nota final (%) *"
                type="number" step="0.1" min="0" max="100"
                value={groupWeight}
                onChange={e => setGroupWeight(e.target.value)}
                placeholder="Ej: 30"
                required
              />
            </div>
            {groupName && groupWeight && (
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                El grupo <strong style={{ color: 'var(--color-text-primary)' }}>"{groupName}"</strong>{' '}
                equivale al <strong style={{ color: 'var(--color-text-primary)' }}>{groupWeight}%</strong> de la nota final.
              </p>
            )}
          </div>

          {/* Weight distribution mode */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Distribución del peso entre evaluaciones
            </p>
            <div className="flex rounded-[var(--radius-sm)] border border-[var(--color-border)] overflow-hidden w-fit">
              {[
                { id: 'equitativo',    label: 'Equitativo' },
                { id: 'personalizado', label: 'Personalizado' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => switchWeightMode(opt.id)}
                  className={`px-4 py-1.5 text-xs transition-colors ${weightMode === opt.id
                    ? 'bg-[var(--color-primary-500)] text-white font-medium'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {weightMode === 'equitativo'
                ? `Cada evaluación vale ${rows.length > 0 ? (100 / rows.length).toFixed(1) : 0}% dentro del grupo.`
                : 'Edita el peso de una fila para fijarlo. Las demás se redistribuyen automáticamente. Clic en 🔒 para desfijar.'}
            </p>
          </div>

          {/* Evaluation rows */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Evaluaciones del grupo
              </p>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: Math.abs(weightSum - 100) < 0.5 ? 'var(--color-grade-ok)' : 'var(--color-grade-fail)',
                  color: Math.abs(weightSum - 100) < 0.5 ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)',
                }}
              >
                {weightSum.toFixed(0)}% / 100%
              </span>
            </div>

            {rows.map((row, i) => (
              <div key={i} className="rounded-lg border border-[var(--color-border)] p-3" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs w-5 text-center shrink-0" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>
                  {/* Name — full width on its own line */}
                  <div className="flex-1 min-w-0">
                    <input
                      value={row.name}
                      onChange={e => updateRow(i, 'name', e.target.value)}
                      placeholder={`Nombre — Ej: Control ${i + 1}`}
                      className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="p-1.5 rounded hover:bg-red-100 text-red-500 shrink-0"
                      title="Eliminar fila"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>

                {/* Type + Weight in a row */}
                <div className="flex gap-2 pl-7">
                  <div className="flex-1">
                    <select
                      value={row.type}
                      onChange={e => updateRow(i, 'type', e.target.value)}
                      className="w-full px-2 py-2 text-sm rounded border focus:outline-none"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      {EVAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="w-32 shrink-0 flex items-center gap-1">
                    <input
                      type="number" step="0.01" min="0" max="100"
                      disabled={weightMode === 'equitativo'}
                      value={
                        weightMode === 'equitativo'
                          ? (100 / rows.length).toFixed(1)
                          : row.fixed ? row.weight : ''
                      }
                      placeholder={
                        weightMode === 'personalizado' && !row.fixed
                          ? computedWeights[i].toFixed(1)
                          : undefined
                      }
                      onChange={e => updateRow(i, 'weight', e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                      style={{
                        background: 'var(--color-surface)',
                        border: `1px solid ${weightMode === 'personalizado' && row.fixed ? 'var(--color-primary-400)' : 'var(--color-border)'}`,
                        color: 'var(--color-text-primary)',
                        opacity: weightMode === 'equitativo' ? 0.65 : 1,
                      }}
                    />
                    {weightMode === 'personalizado' && row.fixed ? (
                      <button
                        type="button"
                        onClick={() => unfixRow(i)}
                        title="Desfijar"
                        className="p-1 rounded shrink-0 text-base leading-none"
                        style={{ color: 'var(--color-primary-500)' }}
                      >
                        🔒
                      </button>
                    ) : (
                      <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>%</span>
                    )}
                  </div>
                  {groupWeight && (
                    <div className="w-14 shrink-0 text-center self-center">
                      <p className="text-xs font-mono font-semibold" style={{ color: 'var(--color-primary-500)' }}>
                        {((gw * computedWeights[i]) / 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="mt-1 flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-dashed transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar evaluación al grupo
            </button>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={groupLoading}>
              Crear grupo ({rows.filter(r => r.name.trim()).length} evaluaciones)
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
