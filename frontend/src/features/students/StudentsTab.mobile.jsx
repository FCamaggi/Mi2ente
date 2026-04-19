import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import { studentsApi } from '../../api/students.api';

export function StudentsTabMobile({ courseId, students, passGrade = 4.0, onStudentClick, onSave }) {
  const handleFieldSave = useCallback(async (student, field, value) => {
    const studentId = student._id || student.id;
    try {
      await studentsApi.update(courseId, studentId, { [field]: value });
      onSave?.();
    } catch {
      toast.error('No se pudo guardar el cambio');
    }
  }, [courseId, onSave]);

  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No hay alumnos en este curso todavía.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
      {students.map((student) => {
        const avg = student.average;
        const passing = avg != null && avg >= passGrade;
        return (
          <div
            key={student.id}
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: 'var(--color-surface)' }}
          >
            {/* List number */}
            <span
              className="text-xs font-mono w-6 text-center shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {student.listNumber ?? '—'}
            </span>

            {/* Name + guardian */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                {student.lastName}, {student.firstName}
              </p>
              {student.guardianName && (
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {student.guardianName}
                  {student.guardianPhone && ` · ${student.guardianPhone}`}
                </p>
              )}
            </div>

            {/* Average */}
            <span
              className="text-sm font-bold font-mono shrink-0 w-10 text-right"
              style={{
                color: avg != null
                  ? passing ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)'
                  : 'var(--color-text-muted)'
              }}
            >
              {avg != null ? avg.toFixed(1) : '—'}
            </span>

            {/* Detail arrow */}
            <button
              onClick={() => onStudentClick?.(student)}
              className="p-1.5 rounded shrink-0"
              style={{ color: 'var(--color-primary-500)' }}
              aria-label={`Ver detalle de ${student.firstName} ${student.lastName}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
