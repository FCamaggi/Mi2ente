import { TrendingUp, TrendingDown, Award, Users } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

export function GradeStats({ stats }) {
  if (!stats) return null;
  const { classAverage, maxGrade, minGrade, passed, failed, studentsWithGrades, passRate } = stats;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 px-4 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] text-sm">
      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
        <Award size={13} className="text-[var(--color-primary-500)]" />
        Promedio: <strong className="text-[var(--color-text-primary)] ml-0.5">{classAverage?.toFixed(1) ?? '—'}</strong>
      </span>
      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
        <TrendingUp size={13} style={{ color: 'var(--color-grade-ok-text)' }} />
        Máx: <strong className="ml-0.5" style={{ color: 'var(--color-grade-ok-text)' }}>{maxGrade?.toFixed(1) ?? '—'}</strong>
      </span>
      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
        <TrendingDown size={13} style={{ color: 'var(--color-grade-fail-text)' }} />
        Mín: <strong className="ml-0.5" style={{ color: 'var(--color-grade-fail-text)' }}>{minGrade?.toFixed(1) ?? '—'}</strong>
      </span>
      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
        <Users size={13} className="text-[var(--color-primary-500)]" />
        Aprobación: <strong className="text-[var(--color-text-primary)] ml-0.5">
          {passRate !== undefined ? formatPercent(passRate) : '—'} ({passed ?? 0}/{studentsWithGrades ?? 0})
        </strong>
      </span>
      {failed > 0 && (
        <span className="font-medium" style={{ color: 'var(--color-grade-fail-text)' }}>
          {failed} reprobado{failed !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
