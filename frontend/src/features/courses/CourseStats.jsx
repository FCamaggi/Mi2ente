import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine
} from 'recharts';
import { coursesApi } from '../../api/courses.api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';

function StatBox({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
  );
}

// Truncate long names for axis labels on mobile
function truncate(str, n = 12) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

const axisStyle = { fill: 'var(--color-text-secondary)', fontSize: 11 };

export function CourseStats({ courseId, passGrade }) {
  const { data, isLoading } = useQuery({
    queryKey: ['course-stats', courseId],
    queryFn:  () => coursesApi.getStats(courseId)
  });

  const histogramData = useMemo(() => {
    const totals = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0, '5-6': 0, '6-7': 0 };
    data?.byEvaluation?.forEach(ev => {
      Object.entries(ev.distribution || {}).forEach(([b, c]) => { totals[b] = (totals[b] || 0) + c; });
    });
    return Object.entries(totals).map(([range, count]) => ({ range, count }));
  }, [data]);

  const lineData = useMemo(() =>
    (data?.byEvaluation || []).map(ev => ({
      name:      ev.name,
      shortName: truncate(ev.name, 10),
      average:   ev.average,
      passGrade,
    })),
    [data, passGrade]
  );

  if (isLoading) return <LoadingSpinner className="py-16" />;
  if (!data?.overall) return (
    <EmptyState emoji="📊" title="Sin estadísticas todavía" description="Agrega alumnos y notas para ver el resumen del curso." />
  );

  const passRate = Math.round((data.overall.passRate || 0) * 100);

  return (
    <div className="p-3 sm:p-5 flex flex-col gap-4 min-w-0">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Promedio" value={data.overall.classAverage ?? '—'} />
        <StatBox label="% aprobación" value={`${passRate}%`} />
        <StatBox label="Mediana" value={data.overall.median ?? '—'} />
        <StatBox label="Desv. estándar" value={data.overall.stdDev ?? '—'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Histogram */}
        <section className="rounded-[var(--radius-lg)] border p-4 min-w-0" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>
            Distribución de notas
          </h3>
          <div className="h-48 sm:h-60 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="range" tick={axisStyle} />
                <YAxis allowDecimals={false} tick={axisStyle} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [v, 'Alumnos']}
                />
                <Bar dataKey="count" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} name="Alumnos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Line chart */}
        <section className="rounded-[var(--radius-lg)] border p-4 min-w-0" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>
            Evolución por evaluación
          </h3>
          <div className="h-48 sm:h-60 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 4, right: 8, left: -16, bottom: lineData.length > 4 ? 40 : 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="shortName"
                  tick={{ ...axisStyle, ...(lineData.length > 4 ? { angle: -35, textAnchor: 'end' } : {}) }}
                  interval={lineData.length > 8 ? 'preserveStartEnd' : 0}
                />
                <YAxis domain={[1, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} tick={axisStyle} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.name || l}
                  formatter={(v, name) => [typeof v === 'number' ? v.toFixed(1) : v, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={passGrade} stroke="#dc2626" strokeDasharray="6 4" label={{ value: 'Aprobación', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="average" stroke="var(--color-primary-500)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Promedio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Failed students */}
      <section className="rounded-[var(--radius-lg)] border p-4 min-w-0" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>
          Alumnos reprobados
          {data.failed?.length > 0 && (
            <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {data.failed.length}
            </span>
          )}
        </h3>
        {data.failed?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[260px]">
              <thead>
                <tr style={{ color: 'var(--color-text-secondary)' }} className="text-left">
                  <th className="pb-2 font-medium">Alumno</th>
                  <th className="pb-2 font-medium text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {data.failed.map(student => (
                  <tr key={student.studentId} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-2" style={{ color: 'var(--color-text-primary)' }}>{student.name}</td>
                    <td className="py-2 text-right font-mono" style={{ color: 'var(--color-grade-fail-text)' }}>
                      {typeof student.average === 'number' ? student.average.toFixed(1) : student.average}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No hay alumnos reprobados en este momento. ¡Buen trabajo!
          </p>
        )}
      </section>
    </div>
  );
}
