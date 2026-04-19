import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { GradeCell } from './GradeCell';
import { Badge } from '../ui/Badge';
import { getEffectiveWeight } from '../../utils/gradeHelpers';
import { formatShortDate } from '../../utils/formatters';

export function GradeGridMobile({
  students,
  evaluations,
  grades,
  course,
  onStudentClick,
  onSave,
}) {
  const [studentIndex, setStudentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const passGrade = course?.gradeConfig?.passGrade ?? 4.0;
  const decimals = course?.gradeConfig?.decimals ?? 1;

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      `${s.lastName} ${s.firstName}`.toLowerCase().includes(q)
    );
  }, [students, search]);

  const safeIndex = Math.min(studentIndex, Math.max(0, filteredStudents.length - 1));
  const student = filteredStudents[safeIndex];

  const avg = useMemo(() => {
    if (!student || evaluations.length === 0) return null;
    let sumProduct = 0;
    let sumWeights = 0;
    evaluations.forEach((ev) => {
      const id = ev._id || ev.id;
      const g = grades[`${student.id}_${id}`];
      const w = getEffectiveWeight(ev);
      if (g?.status === 'graded' && g.value != null) {
        sumProduct += g.value * w;
        sumWeights += w;
      }
    });
    if (sumWeights === 0) return null;
    return parseFloat((sumProduct / sumWeights).toFixed(decimals));
  }, [student, evaluations, grades, decimals]);

  const sit = avg !== null ? (avg >= passGrade ? 'aprobado' : 'reprobado') : 'sin_notas';

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, filteredStudents.length - 1));
    setStudentIndex(clamped);
  };

  if (!student) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Sin alumnos para mostrar.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-tour="grade-grid">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {showSearch ? (
          <input
            autoFocus
            value={search}
            onChange={(e) => { setSearch(e.target.value); setStudentIndex(0); }}
            onBlur={() => { if (!search) setShowSearch(false); }}
            placeholder="Buscar alumno..."
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
          />
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 text-sm w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-left"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Search size={14} />
            Buscar alumno...
          </button>
        )}
      </div>

      {/* Student navigator */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <button
          onClick={() => goTo(safeIndex - 1)}
          disabled={safeIndex === 0}
          className="p-2 rounded-[var(--radius-sm)] transition-colors disabled:opacity-30"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Alumno anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          className="flex flex-col items-center gap-0.5 flex-1 mx-2"
          onClick={() => onStudentClick?.(student)}
        >
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">
            {student.lastName}, {student.firstName}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {safeIndex + 1} / {filteredStudents.length}
          </span>
        </button>

        <button
          onClick={() => goTo(safeIndex + 1)}
          disabled={safeIndex === filteredStudents.length - 1}
          className="p-2 rounded-[var(--radius-sm)] transition-colors disabled:opacity-30"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Alumno siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Evaluations list */}
      <div className="flex-1 overflow-y-auto">
        {evaluations.length === 0 ? (
          <p className="p-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No hay evaluaciones definidas.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm" role="grid">
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                <th className="px-4 py-2 text-left text-xs font-medium border border-[var(--color-border)]" style={{ color: 'var(--color-text-secondary)' }}>
                  Evaluación
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium border border-[var(--color-border)] w-28" style={{ color: 'var(--color-text-secondary)' }}>
                  Nota
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev, i) => {
                const id = ev._id || ev.id;
                const g = grades[`${student.id}_${id}`];
                const rowBg = i % 2 === 1 ? 'var(--color-row-alt)' : 'var(--color-surface)';
                return (
                  <tr key={id} style={{ background: rowBg }}>
                    <td className="px-4 py-2 border border-[var(--color-border)]">
                      <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }} title={ev.name}>
                        {ev.name}
                      </div>
                      <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        <span style={{ color: 'var(--color-primary-500)' }}>{getEffectiveWeight(ev).toFixed(1)}%</span>
                        {ev.date && <span>{formatShortDate(ev.date)}</span>}
                      </div>
                    </td>
                    <GradeCell
                      value={g?.value ?? null}
                      status={g?.status ?? 'pending'}
                      passGrade={passGrade}
                      studentId={student.id}
                      evaluationId={id}
                      onSave={(payload) => onSave(student.id, id, payload)}
                      onNavigate={() => {}}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Average footer */}
      <div
        className="px-4 py-3 border-t border-[var(--color-border)] flex items-center justify-between"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Promedio
          </span>
          <Badge situacion={sit} />
        </div>
        <span
          className="text-xl font-bold font-mono"
          style={{
            color: avg !== null
              ? avg >= passGrade ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)'
              : 'var(--color-text-muted)'
          }}
        >
          {avg !== null ? avg.toFixed(decimals) : '—'}
        </span>
      </div>
    </div>
  );
}
