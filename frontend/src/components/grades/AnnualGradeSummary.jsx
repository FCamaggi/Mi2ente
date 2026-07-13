import { Badge } from '../ui/Badge';

function periodAverage(student, periodId) {
  return student.periodAverages?.find((item) => String(item.periodId) === String(periodId))?.average ?? null;
}

export function AnnualGradeSummary({ students, periods, course, onStudentClick }) {
  const decimals = course?.gradeConfig?.decimals ?? 1;

  return (
    <div className="overflow-auto flex-1 p-3 sm:p-4" data-tour="grade-grid">
      <div className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
        Resumen anual. Los resultados marcados como provisionales consideran solamente los períodos que ya tienen notas.
      </div>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--color-surface-2)]">
            <th className="p-3 border border-[var(--color-border)] text-left">N°</th>
            <th className="p-3 border border-[var(--color-border)] text-left">Alumno</th>
            {periods.map((period) => <th key={period._id || period.id} className="p-3 border border-[var(--color-border)] text-center">{period.name}<span className="block text-xs font-normal text-[var(--color-text-muted)]">{period.weight}%</span></th>)}
            <th className="p-3 border border-[var(--color-border)] text-center">Promedio anual</th>
            <th className="p-3 border border-[var(--color-border)] text-center">Situación</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id || student._id} className="bg-[var(--color-surface)] hover:bg-[var(--color-row-hover)]">
              <td className="p-3 border border-[var(--color-border)] text-center">{student.listNumber}</td>
              <td className="p-3 border border-[var(--color-border)] font-medium cursor-pointer" onClick={() => onStudentClick?.(student)}>{student.lastName}, {student.firstName}</td>
              {periods.map((period) => {
                const value = periodAverage(student, period._id || period.id);
                return <td key={period._id || period.id} className="p-3 border border-[var(--color-border)] text-center font-mono">{value === null ? '—' : value.toFixed(decimals)}</td>;
              })}
              <td className="p-3 border border-[var(--color-border)] text-center font-mono font-bold">
                {student.annualAverage == null ? '—' : student.annualAverage.toFixed(decimals)}
                {student.provisional && <span className="block text-[10px] font-normal text-[var(--color-warning)]">Provisional</span>}
              </td>
              <td className="p-3 border border-[var(--color-border)] text-center"><Badge situacion={student.annualStatus || student.situacion} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
