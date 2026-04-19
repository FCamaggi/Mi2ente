import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { studentsApi } from '../../api/students.api';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

function parseStudentTag(raw, fallbackListNumber) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const [lastName = '', ...firstNameParts] = trimmed.split(',').map((part) => part.trim());
  const firstName = firstNameParts.join(', ').trim();
  if (!lastName || !firstName) return null;

  return {
    listNumber: fallbackListNumber,
    lastName,
    firstName
  };
}

export function StudentForm({ courseId, student, students = [], onClose, onSave }) {
  const editing = Boolean(student);
  const [mode, setMode] = useState(editing ? 'single' : 'batch');
  const [form, setForm] = useState({
    listNumber: student?.listNumber || '',
    lastName: student?.lastName || '',
    firstName: student?.firstName || '',
    guardianName: student?.guardianName || '',
    guardianPhone: student?.guardianPhone || '',
    guardianEmail: student?.guardianEmail || '',
    internalNotes: student?.internalNotes || ''
  });
  const [draftTag, setDraftTag] = useState('');
  const [batchTags, setBatchTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const nextListNumber = useMemo(() => {
    const max = students.reduce((current, item) => Math.max(current, item.listNumber || 0), 0);
    return max + batchTags.length + 1;
  }, [students, batchTags.length]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addTag = () => {
    const parsed = parseStudentTag(draftTag, nextListNumber);
    if (!parsed) {
      toast.error('Usa el formato "Apellidos, Nombre"');
      return;
    }
    setBatchTags((prev) => [...prev, parsed]);
    setDraftTag('');
  };

  const removeTag = (index) => {
    setBatchTags((prev) => prev.filter((_, current) => current !== index).map((item, idx) => ({
      ...item,
      listNumber: students.reduce((max, studentItem) => Math.max(max, studentItem.listNumber || 0), 0) + idx + 1
    })));
  };

  const handleBatchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing || mode === 'single') {
        if (!form.lastName.trim() || !form.firstName.trim()) {
          toast.error('Apellido y nombre son requeridos');
          return;
        }

        if (editing) {
          await studentsApi.update(courseId, student._id || student.id, form);
          toast.success('Alumno actualizado');
        } else {
          await studentsApi.create(courseId, form);
          toast.success('Alumno agregado');
        }
      } else {
        const pendingTag = draftTag.trim() ? parseStudentTag(draftTag, nextListNumber) : null;
        const payload = [...batchTags, ...(pendingTag ? [pendingTag] : [])];
        if (payload.length === 0) {
          toast.error('Agrega al menos un alumno');
          return;
        }
        await studentsApi.create(courseId, { students: payload });
        toast.success(`${payload.length} alumnos agregados`);
      }
      onSave?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen title={editing ? 'Editar alumno' : 'Nuevo alumno'} onClose={onClose}>
      {!editing && (
        <div className="mb-4 flex rounded-[var(--radius-sm)] border border-[var(--color-border)] overflow-hidden">
          {[
            { id: 'batch', label: 'Varios en lote' },
            { id: 'single', label: 'Uno a uno' }
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={`flex-1 px-3 py-2 text-sm transition-colors ${mode === option.id ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!editing && mode === 'batch' ? (
          <>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">Carga por lote</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">Escribe cada alumno como <strong>Apellidos, Nombre</strong> y presiona Enter.</p>
              <Input
                label="Alumno"
                value={draftTag}
                onChange={(e) => setDraftTag(e.target.value)}
                onKeyDown={handleBatchKeyDown}
                placeholder="Pérez Soto, Antonia"
              />
              <div className="mt-3 flex justify-end">
                <Button type="button" size="sm" onClick={addTag}>Agregar</Button>
              </div>
            </div>

            {batchTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {batchTags.map((item, index) => (
                  <button
                    key={`${item.listNumber}-${index}`}
                    type="button"
                    onClick={() => removeTag(index)}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-row-hover)] transition-colors"
                  >
                    #{item.listNumber} {item.lastName}, {item.firstName} ×
                  </button>
                ))}
              </div>
            )}

            <Textarea
              label="Pegar lista en bloque (opcional)"
              rows={4}
              placeholder={`Pérez Soto, Antonia\nGonzález Díaz, Tomás`}
              onBlur={(e) => {
                const rows = e.target.value.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
                if (rows.length === 0) return;
                const parsed = rows
                  .map((row, idx) => parseStudentTag(row, students.reduce((max, item) => Math.max(max, item.listNumber || 0), 0) + batchTags.length + idx + 1))
                  .filter(Boolean);
                if (parsed.length > 0) {
                  setBatchTags((prev) => [...prev, ...parsed]);
                  e.target.value = '';
                }
              }}
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Input label="N° de lista *" type="number" min="1" value={form.listNumber} onChange={set('listNumber')} required />
              <Input label="Apellidos *" value={form.lastName} onChange={set('lastName')} required className="col-span-2" />
            </div>
            <Input label="Nombre *" value={form.firstName} onChange={set('firstName')} required />
            <details className="group">
              <summary className="text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">Datos del apoderado (opcional)</summary>
              <div className="mt-3 flex flex-col gap-3">
                <Input label="Nombre apoderado" value={form.guardianName} onChange={set('guardianName')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Teléfono" value={form.guardianPhone} onChange={set('guardianPhone')} />
                  <Input label="Email apoderado" type="email" value={form.guardianEmail} onChange={set('guardianEmail')} />
                </div>
              </div>
            </details>
          </>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{editing ? 'Guardar' : mode === 'batch' ? 'Crear alumnos' : 'Agregar alumno'}</Button>
        </div>
      </form>
    </Modal>
  );
}
