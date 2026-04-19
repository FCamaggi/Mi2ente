import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses.api';
import { schoolsApi } from '../../api/schools.api';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function CourseForm({ course, onClose, onSave }) {
  const editing = Boolean(course);
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.list
  });
  const activeSchools = schools.filter(s => s.isActive);
  // Determine initial schoolId: prefer course.schoolId, fall back to matching by name
  const initialSchoolId = course?.schoolId
    || schools.find(s => s.name === course?.school)?._id
    || '';
  const [form, setForm] = useState({
    name: course?.name || '',
    subject: course?.subject || '',
    level: course?.level || '',
    schoolId: initialSchoolId,
    academicYear: course?.academicYear || new Date().getFullYear(),
    description: course?.description || '',
    gradeConfig: {
      minGrade: course?.gradeConfig?.minGrade ?? 1.0,
      maxGrade: course?.gradeConfig?.maxGrade ?? 7.0,
      passGrade: course?.gradeConfig?.passGrade ?? 4.0,
      decimals: course?.gradeConfig?.decimals ?? 1
    }
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setGradeField = (field, parser = parseFloat) => (e) => {
    setForm((prev) => ({
      ...prev,
      gradeConfig: { ...prev.gradeConfig, [field]: parser(e.target.value) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre del curso es requerido');
      return;
    }
    if (form.gradeConfig.minGrade >= form.gradeConfig.maxGrade) {
      toast.error('La nota mínima debe ser menor a la máxima');
      return;
    }
    if (form.gradeConfig.passGrade < form.gradeConfig.minGrade || form.gradeConfig.passGrade > form.gradeConfig.maxGrade) {
      toast.error('La nota de aprobación debe quedar dentro del rango');
      return;
    }

    setLoading(true);
    try {
      // Enrich payload with school name derived from selected schoolId
      const selectedSchool = schools.find(s => s._id === form.schoolId);
      const payload = { ...form, school: selectedSchool?.name || '' };
      if (editing) {
        await coursesApi.update(course._id || course.id, payload);
        toast.success('Curso actualizado');
      } else {
        await coursesApi.create(payload);
        toast.success('Curso creado');
      }
      onSave?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen title={editing ? 'Editar curso' : 'Nuevo curso'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nombre del curso *" value={form.name} onChange={set('name')} placeholder="Ej: Lenguaje 2°B" required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Asignatura" value={form.subject} onChange={set('subject')} placeholder="Lenguaje y Comunicación" />
          <Input label="Nivel" value={form.level} onChange={set('level')} placeholder="2° Básico" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activeSchools.length > 0 ? (
            <Select label="Colegio" value={form.schoolId} onChange={set('schoolId')}>
              <option value="">Sin colegio</option>
              {activeSchools.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Colegio</label>
              <p className="text-sm text-[var(--color-text-secondary)] px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface-2)]">
                <Link to="/profile" onClick={onClose} className="text-[var(--color-primary-500)] hover:underline">
                  Añade un colegio en tu perfil
                </Link>
              </p>
            </div>
          )}
          <Input label="Año académico" type="number" value={form.academicYear} onChange={set('academicYear')} min="2000" max="2099" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nota mínima" type="number" step="0.1" min="1" max="7" value={form.gradeConfig.minGrade} onChange={setGradeField('minGrade')} />
          <Input label="Nota máxima" type="number" step="0.1" min="1" max="7" value={form.gradeConfig.maxGrade} onChange={setGradeField('maxGrade')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nota de aprobación" type="number" step="0.1" min="1" max="7" value={form.gradeConfig.passGrade} onChange={setGradeField('passGrade')} />
          <Select label="Decimales en promedio" value={form.gradeConfig.decimals} onChange={setGradeField('decimals', (value) => parseInt(value, 10))}>
            <option value={0}>Sin decimales</option>
            <option value={1}>1 decimal</option>
            <option value={2}>2 decimales</option>
          </Select>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{editing ? 'Guardar cambios' : 'Crear curso'}</Button>
        </div>
      </form>
    </Modal>
  );
}
