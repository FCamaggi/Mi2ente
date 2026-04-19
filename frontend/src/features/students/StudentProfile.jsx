import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentsApi } from '../../api/students.api';
import { observationsApi } from '../../api/observations.api';
import { Badge, CategoryBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export function StudentProfile({ courseId, student, course, onClose, onUpdate }) {
  const studentId = student._id || student.id;
  const passGrade = course?.gradeConfig?.passGrade ?? 4.0;
  const [obsText, setObsText] = useState('');
  const [obsCategory, setObsCategory] = useState('academica');
  const [savingObs, setSavingObs] = useState(false);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(false);
  const [observationToDelete, setObservationToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student', courseId, studentId],
    queryFn: () => studentsApi.getOne(courseId, studentId)
  });

  const handleDeleteStudent = async () => {
    setLoadingDelete(true);
    try {
      await studentsApi.remove(courseId, studentId);
      toast.success('Alumno eliminado');
      setConfirmDeleteStudent(false);
      onClose();
      onUpdate?.();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleAddObs = async (e) => {
    e.preventDefault();
    if (!obsText.trim()) return;
    setSavingObs(true);
    try {
      await observationsApi.create(courseId, studentId, { text: obsText.trim(), category: obsCategory });
      setObsText('');
      refetch();
      toast.success('Observación guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSavingObs(false);
    }
  };

  const handleDeleteObs = async () => {
    if (!observationToDelete) return;
    setLoadingDelete(true);
    try {
      await observationsApi.remove(courseId, studentId, observationToDelete._id || observationToDelete.id);
      setObservationToDelete(null);
      refetch();
      toast.success('Observación eliminada');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setLoadingDelete(false);
    }
  };

  const avg = data?.average;
  const sit = data?.situacion ?? student.situacion;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-md sm:max-w-md h-full bg-[var(--color-surface)] shadow-[0_0_40px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden" style={{ animation: 'slide-in-panel 250ms cubic-bezier(0.25,0.46,0.45,0.94)' }}>
          <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{student.lastName} {student.firstName}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">N° {student.listNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDeleteStudent(true)} className="p-1.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-grade-fail)] transition-colors" title="Eliminar alumno">
                <Trash2 size={16} />
              </button>
              <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? <LoadingSpinner className="py-8" /> : (
              <>
                <div
                  className="rounded-[var(--radius-lg)] p-5 mb-6 text-center"
                  style={{ background: avg !== null ? (avg >= passGrade ? 'var(--color-grade-ok)' : 'var(--color-grade-fail)') : 'var(--color-surface-2)' }}
                >
                  <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Promedio general</p>
                  <p
                    className="text-4xl font-bold font-mono"
                    style={{ color: avg !== null ? (avg >= passGrade ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)') : 'var(--color-text-muted)' }}
                  >
                    {avg !== null ? avg.toFixed(1) : '—'}
                  </p>
                  <div className="mt-2"><Badge situacion={sit} /></div>
                </div>

                {data?.grades && data.grades.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Notas por evaluación</h3>
                    <div className="flex flex-col gap-2">
                      {data.grades.map((g) => (
                        <div key={g.evaluationId} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <span className="text-[var(--color-text-primary)] truncate block">{g.evaluationName}</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {g.groupName ? `${g.effectiveWeight?.toFixed?.(1) ?? g.effectiveWeight}% · ${g.groupName}` : `${g.weight}%`}
                          </span>
                          </div>
                          <span
                            className="font-mono font-semibold ml-3"
                            style={{ color: g.value !== null ? (g.value >= passGrade ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)') : 'var(--color-text-muted)' }}
                          >
                            {g.status === 'absent' ? 'Aus' : g.status === 'exempt' ? 'Exen' : g.value !== null ? g.value.toFixed(1) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Observaciones</h3>

                  <form onSubmit={handleAddObs} className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 mb-4 flex flex-col gap-2">
                    <Textarea value={obsText} onChange={(e) => setObsText(e.target.value)} placeholder="Agregar observación..." rows={2} />
                    <div className="flex items-center gap-2">
                      <Select value={obsCategory} onChange={(e) => setObsCategory(e.target.value)} className="flex-1 text-xs py-1">
                        <option value="academica">Académica</option>
                        <option value="conductual">Conductual</option>
                        <option value="positiva">Positiva</option>
                        <option value="apoderado">Apoderado</option>
                        <option value="otro">Otro</option>
                      </Select>
                      <Button type="submit" size="sm" loading={savingObs} disabled={!obsText.trim()}>
                        <Plus size={14} /> Guardar
                      </Button>
                    </div>
                  </form>

                  {data?.observations?.length === 0 && (
                    <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">Sin observaciones</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {data?.observations?.map((obs) => (
                      <div key={obs._id || obs.id} className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 relative group">
                        <div className="flex items-center justify-between mb-1">
                          <CategoryBadge category={obs.category} />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[var(--color-text-muted)]">{formatDate(obs.date)}</span>
                            <button onClick={() => setObservationToDelete(obs)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-danger)] hover:bg-[var(--color-grade-fail)] transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)]">{obs.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteStudent}
        title="Eliminar alumno"
        message={`¿Eliminar a ${student.lastName} ${student.firstName}? Se borrarán sus notas y observaciones.`}
        confirmLabel="Eliminar"
        loading={loadingDelete}
        onClose={() => setConfirmDeleteStudent(false)}
        onConfirm={handleDeleteStudent}
      />

      <ConfirmDialog
        isOpen={Boolean(observationToDelete)}
        title="Eliminar observación"
        message="Esta observación se eliminará de forma permanente."
        confirmLabel="Eliminar"
        loading={loadingDelete}
        onClose={() => setObservationToDelete(null)}
        onConfirm={handleDeleteObs}
      />
    </>
  );
}
