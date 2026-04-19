import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { GradeCell } from './GradeCell';
import { GradeStats } from './GradeStats';
import { GradeGridMobile } from './GradeGrid.mobile';
import { Badge } from '../ui/Badge';
import { gradesApi } from '../../api/grades.api';
import { formatShortDate } from '../../utils/formatters';
import { useStats } from '../../hooks/useStats';
import { getEffectiveWeight, getCourseWeightTotal } from '../../utils/gradeHelpers';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export function GradeGrid({
  students,
  evaluations,
  grades: initialGrades,
  course,
  onStudentClick,
  onGradesSaved
}) {
  const [grades, setGrades] = useState(() => {
    const map = {};
    initialGrades.forEach((grade) => {
      map[`${grade.studentId}_${grade.evaluationId}`] = grade;
    });
    return map;
  });
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('full');
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const map = {};
    initialGrades.forEach((grade) => {
      map[`${grade.studentId}_${grade.evaluationId}`] = grade;
    });
    setGrades(map);
  }, [initialGrades]);

  const passGrade = course?.gradeConfig?.passGrade ?? 4.0;
  const decimals = course?.gradeConfig?.decimals ?? 1;

  const filteredStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return students;
    return students.filter((student) =>
      `${student.lastName} ${student.firstName}`.toLowerCase().includes(normalized)
    );
  }, [students, search]);

  const visibleEvaluations = viewMode === 'compact' ? [] : evaluations;

  const handleSave = useCallback(async (studentId, evalId, payload) => {
    const key = `${studentId}_${evalId}`;
    setGrades((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        studentId,
        evaluationId: evalId,
        value: payload.status === 'graded' ? payload.value : null,
        status: payload.status
      }
    }));

    try {
      await gradesApi.upsert(course._id, studentId, evalId, payload);
      onGradesSaved?.();
    } catch {
      toast.error('Error al guardar la nota');
      throw new Error('save_failed');
    }
  }, [course._id, onGradesSaved]);

  const { studentAverages, stats } = useStats({
    students: filteredStudents,
    evaluations,
    gradesMap: grades,
    passGrade,
    decimals
  });

  const totalWeight = getCourseWeightTotal(evaluations);
  const weightOk = Math.abs(totalWeight - 100) < 0.1;

  const navigateToCell = useCallback(({ studentId, evaluationId, direction }) => {
    if (!direction || direction === 'none' || viewMode === 'compact') return;

    const rowIndex = filteredStudents.findIndex((student) => student.id === studentId);
    const columnIndex = visibleEvaluations.findIndex((evaluation) => (evaluation._id || evaluation.id) === evaluationId);
    if (rowIndex === -1 || columnIndex === -1) return;

    const next = { row: rowIndex, col: columnIndex };
    if (direction === 'right') next.col += 1;
    if (direction === 'left') next.col -= 1;
    if (direction === 'down') next.row += 1;
    if (direction === 'up') next.row -= 1;

    if (next.row < 0 || next.col < 0 || next.row >= filteredStudents.length || next.col >= visibleEvaluations.length) return;

    const nextStudentId = filteredStudents[next.row].id;
    const nextEvaluationId = visibleEvaluations[next.col]._id || visibleEvaluations[next.col].id;
    const selector = `[data-student-id="${nextStudentId}"][data-evaluation-id="${nextEvaluationId}"]`;
    document.querySelector(selector)?.focus();
  }, [filteredStudents, visibleEvaluations, viewMode]);

  if (isMobile) {
    return (
      <GradeGridMobile
        students={students}
        evaluations={evaluations}
        grades={grades}
        course={course}
        onStudentClick={onStudentClick}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" data-tour="grade-grid">
      {!weightOk && (
        <div role="alert" className="px-4 py-2 border-b text-sm flex items-center gap-2" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-border)', color: 'var(--color-warning)' }}>
          <span aria-hidden="true">⚠️</span>
          Las ponderaciones suman <strong>{totalWeight.toFixed(1)}%</strong>. Ajusta para que sumen 100%.
        </div>
      )}

      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alumno por nombre..."
          className="w-full md:max-w-xs px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
        />
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm border transition-colors ${viewMode === 'full' ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            <span className="md:hidden">Completa</span>
            <span className="hidden md:inline">Vista completa</span>
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm border transition-colors ${viewMode === 'compact' ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            <span className="md:hidden">Promedios</span>
            <span className="hidden md:inline">Solo promedios</span>
          </button>
        </div>
      </div>

      {viewMode === 'full' && visibleEvaluations.length > 0 && (
        <p className="md:hidden text-xs text-center py-1 border-b border-[var(--color-border)]" style={{ color: 'var(--color-text-muted)' }}>
          ← Desliza para ver todas las evaluaciones →
        </p>
      )}

      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse text-sm" role="grid" style={{ tableLayout: 'fixed', minWidth: `${Math.max(600, 520 + visibleEvaluations.length * 88)}px` }}>
          <thead>
            <tr className="bg-[var(--color-surface-2)]">
              <th className="sticky left-0 z-20 bg-[var(--color-surface-2)] text-left px-3 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium w-10">N°</th>
              <th className="sticky left-10 z-20 bg-[var(--color-surface-2)] text-left px-3 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium w-40 max-w-[160px]">Apellido</th>
              <th className="sticky left-[200px] z-20 bg-[var(--color-surface-2)] text-left px-3 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium w-[120px]">Nombre</th>
              {visibleEvaluations.map((evaluation) => (
                <th key={evaluation._id || evaluation.id} className="px-2 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center max-w-[96px]">
                  <div className="text-xs leading-tight truncate" title={evaluation.name}>{evaluation.name}</div>
                  <div className="text-xs text-[var(--color-primary-500)] font-normal">{getEffectiveWeight(evaluation).toFixed(1)}%</div>
                  {evaluation.date && <div className="text-xs text-[var(--color-text-muted)] font-normal">{formatShortDate(evaluation.date)}</div>}
                </th>
              ))}
              <th className="px-3 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center min-w-[80px]">Promedio</th>
              <th className="px-3 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-center min-w-[120px]">Situación</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, rowIdx) => {
              const avg = studentAverages[student.id];
              const sit = avg !== null && avg >= passGrade ? 'aprobado' : avg === null ? 'sin_notas' : 'reprobado';
              const rowBg = rowIdx % 2 === 1 ? 'bg-[var(--color-row-alt)]' : 'bg-[var(--color-surface)]';

              const stickyBg = rowBg;
              return (
                <tr key={student.id} className={`group ${rowBg} hover:bg-[var(--color-row-hover)] transition-colors`}>
                  <td className={`sticky left-0 z-10 px-3 border border-[var(--color-border)] text-center text-[var(--color-text-secondary)] text-xs ${stickyBg} group-hover:bg-[var(--color-row-hover)] transition-colors`}>{student.listNumber}</td>
                  <td className={`sticky left-10 z-10 px-3 border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium cursor-pointer hover:text-[var(--color-primary-500)] ${stickyBg} group-hover:bg-[var(--color-row-hover)] transition-colors w-40 max-w-[160px] truncate`} onClick={() => onStudentClick?.(student)} title={student.lastName}>
                    {student.lastName}
                  </td>
                  <td className={`sticky left-[200px] z-10 px-3 border border-[var(--color-border)] text-[var(--color-text-primary)] ${stickyBg} group-hover:bg-[var(--color-row-hover)] transition-colors w-[120px] truncate`}>{student.firstName}</td>
                  {visibleEvaluations.map((evaluation) => {
                    const evaluationId = evaluation._id || evaluation.id;
                    const grade = grades[`${student.id}_${evaluationId}`];
                    return (
                      <GradeCell
                        key={evaluationId}
                        value={grade?.value ?? null}
                        status={grade?.status ?? 'pending'}
                        passGrade={passGrade}
                        studentId={student.id}
                        evaluationId={evaluationId}
                        onSave={(payload) => handleSave(student.id, evaluationId, payload)}
                        onNavigate={navigateToCell}
                      />
                    );
                  })}
                  <td className="px-3 border border-[var(--color-border)] text-center font-mono font-semibold" style={{ color: avg !== null ? (avg >= passGrade ? 'var(--color-grade-ok-text)' : 'var(--color-grade-fail-text)') : 'var(--color-text-muted)' }}>
                    {avg !== null ? avg.toFixed(decimals) : '—'}
                  </td>
                  <td className="px-2 border border-[var(--color-border)] text-center">
                    <Badge situacion={sit} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <GradeStats stats={stats} />
    </div>
  );
}
