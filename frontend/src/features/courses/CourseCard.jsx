import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ChevronRight, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses.api';
import { CourseForm } from './CourseForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function CourseCard({ course, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState({
    name: `${course.name} (${(course.academicYear || new Date().getFullYear()) + 1})`,
    academicYear: (course.academicYear || new Date().getFullYear()) + 1
  });

  const id = course._id || course.id;
  const passRate = course.stats?.passRate ?? null;

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await coursesApi.remove(id);
      toast.success('Curso eliminado');
      setShowDelete(false);
      onUpdate?.();
    } catch {
      toast.error('Error al eliminar el curso');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    const nextStatus = course.status === 'archived' ? 'active' : 'archived';
    try {
      await coursesApi.update(id, { status: nextStatus });
      toast.success(nextStatus === 'archived' ? 'Curso archivado' : 'Curso reactivado');
      onUpdate?.();
    } catch {
      toast.error('Error al actualizar el curso');
    }
  };

  const handleDuplicate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await coursesApi.duplicate(id, {
        name: duplicateForm.name,
        academicYear: duplicateForm.academicYear
      });
      toast.success('Curso duplicado');
      setShowDuplicate(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'No se pudo duplicar el curso');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-md)] transition-shadow relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--color-text-primary)] truncate">{course.name}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {[course.school, course.academicYear].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] py-1 min-w-[160px]">
                <button onClick={() => { setShowEdit(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => { setShowDuplicate(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
                  <Copy size={14} /> Duplicar
                </button>
                <button onClick={() => { handleArchive(); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
                  <Archive size={14} /> {course.status === 'archived' ? 'Activar' : 'Archivar'}
                </button>
                <button onClick={() => { setShowDelete(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
          <span>{course.studentCount ?? 0} alumnos</span>
          <span>{course.evaluationCount ?? 0} evaluaciones</span>
        </div>

        {passRate !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--color-text-secondary)]">Aprobación</span>
              <span className="font-medium text-[var(--color-text-primary)]">{Math.round(passRate * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary-500)] rounded-full transition-all" style={{ width: `${Math.round(passRate * 100)}%` }} />
            </div>
          </div>
        )}

        {course.stats?.classAverage ? (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Promedio: <strong className="text-[var(--color-text-primary)]">{course.stats.classAverage.toFixed(1)}</strong>
          </p>
        ) : null}

        <Link
          to={`/courses/${id}`}
          className="flex items-center justify-center gap-1 mt-1 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-primary-500)] border border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors"
        >
          Ver curso <ChevronRight size={14} />
        </Link>
      </div>

      {showEdit && (
        <CourseForm course={course} onClose={() => setShowEdit(false)} onSave={() => { setShowEdit(false); onUpdate?.(); }} />
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Eliminar curso"
        message={`¿Eliminar "${course.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={actionLoading}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />

      <Modal isOpen={showDuplicate} title="Duplicar curso" onClose={() => setShowDuplicate(false)} size="sm">
        <form onSubmit={handleDuplicate} className="flex flex-col gap-4">
          <Input label="Nombre del nuevo curso" value={duplicateForm.name} onChange={(e) => setDuplicateForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <Input label="Año académico" type="number" value={duplicateForm.academicYear} onChange={(e) => setDuplicateForm((prev) => ({ ...prev, academicYear: parseInt(e.target.value, 10) }))} min="2000" max="2099" required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowDuplicate(false)}>Cancelar</Button>
            <Button type="submit" loading={actionLoading}>Duplicar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
