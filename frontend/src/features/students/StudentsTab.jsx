import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { studentsApi } from '../../api/students.api';
import { StudentsTabMobile } from './StudentsTab.mobile';
import { useBreakpoint } from '../../hooks/useBreakpoint';

function EditableCell({ value, onSave, placeholder = '', className = '', type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const startEdit = () => {
    setDraft(value ?? '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value ?? '').trim()) {
      onSave(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setEditing(false); }
    if (e.key === 'Tab') { commit(); }
  };

  if (editing) {
    return (
      <td className={`border border-[var(--color-primary-500)] bg-[var(--color-bg)] p-0 ${className}`}>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-full px-3 py-2 bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
        />
      </td>
    );
  }

  return (
    <td
      className={`px-3 py-2 border border-[var(--color-border)] cursor-text ${className}`}
      onClick={startEdit}
      title="Clic para editar"
    >
      {value
        ? <span className="text-sm text-[var(--color-text-primary)]">{value}</span>
        : <span className="text-sm text-[var(--color-text-muted)] italic">{placeholder || '—'}</span>
      }
    </td>
  );
}

export function StudentsTab({ courseId, students, passGrade = 4.0, onStudentClick, onSave }) {
  const { isMobile } = useBreakpoint();
  const handleFieldSave = useCallback(async (student, field, value) => {
    const studentId = student._id || student.id;
    try {
      await studentsApi.update(courseId, studentId, { [field]: value });
      onSave?.();
    } catch {
      toast.error('No se pudo guardar el cambio');
    }
  }, [courseId, onSave]);

  if (isMobile) {
    return (
      <StudentsTabMobile
        courseId={courseId}
        students={students}
        passGrade={passGrade}
        onStudentClick={onStudentClick}
        onSave={onSave}
      />
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--color-text-secondary)] text-sm">
        No hay alumnos en este curso todavía.
      </div>
    );
  }

  return (
    <div className="overflow-auto flex-1">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: '480px' }}
      >
        <thead>
          <tr className="bg-[var(--color-surface-2)]">
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center w-10 text-xs">N°</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-left min-w-[160px] text-xs">Apellido(s)</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-left min-w-[140px] text-xs">Nombre(s)</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-left min-w-[160px] text-xs hidden md:table-cell">Apoderado</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-left min-w-[120px] text-xs hidden lg:table-cell">Tel. Apoderado</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center min-w-[72px] text-xs">Promedio</th>
            <th className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center w-16 text-xs">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, rowIdx) => {
            const rowBg = rowIdx % 2 === 1 ? 'bg-[var(--color-row-alt)]' : 'bg-[var(--color-surface)]';
            const avg = student.average;
            return (
              <tr key={student.id} className={rowBg}>
                <EditableCell
                  value={student.listNumber != null ? String(student.listNumber) : ''}
                  placeholder="N°"
                  type="text"
                  onSave={(v) => {
                    const n = parseInt(v, 10);
                    if (!Number.isNaN(n) && n > 0) handleFieldSave(student, 'listNumber', n);
                  }}
                  className="text-center text-xs text-[var(--color-text-secondary)]"
                />
                <EditableCell
                  value={student.lastName}
                  placeholder="Apellidos"
                  onSave={(v) => handleFieldSave(student, 'lastName', v)}
                />
                <EditableCell
                  value={student.firstName}
                  placeholder="Nombre"
                  onSave={(v) => handleFieldSave(student, 'firstName', v)}
                />
                <EditableCell
                  value={student.guardianName}
                  placeholder="—"
                  onSave={(v) => handleFieldSave(student, 'guardianName', v)}
                  className="hidden md:table-cell"
                />
                <EditableCell
                  value={student.guardianPhone}
                  placeholder="—"
                  onSave={(v) => handleFieldSave(student, 'guardianPhone', v)}
                  className="hidden lg:table-cell"
                />
                <td
                  className="px-3 py-2 border border-[var(--color-border)] text-center font-mono text-xs font-semibold select-none"
                  style={{
                    color: avg != null
                      ? avg >= passGrade ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)'
                      : 'var(--color-text-muted)'
                  }}
                >
                  {avg != null ? avg.toFixed(1) : '—'}
                </td>
                <td className="px-2 py-2 border border-[var(--color-border)] text-center select-none">
                  <button
                    onClick={() => onStudentClick?.(student)}
                    className="text-xs text-[var(--color-primary-500)] hover:underline transition-colors"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
