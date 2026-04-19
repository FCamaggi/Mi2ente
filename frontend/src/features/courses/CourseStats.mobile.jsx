import { useMemo } from 'react';
import {
  BarChart, Bar, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine
} from 'recharts';

function truncate(str, n = 8) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

const axisStyle = { fill: 'var(--color-text-secondary)', fontSize: 10 };

function StatBox({ label, value }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-3 flex-1"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
  );
}

export function CourseStatsMobile({ data, passGrade }) {
  const histogramData = useMemo(() => {
    const totals = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0, '5-6': 0, '6-7': 0 };
    data?.byEvaluation?.forEach((ev) => {
      Object.entries(ev.distribution || {}).forEach(([b, c]) => { totals[b] = (totals[b] || 0) + c; });
    });
    return Object.entries(totals).map(([range, count]) => ({ range, count }));
  }, [data]);

  const lineData = useMemo(() =>
    (data?.byEvaluation || []).map((ev) => ({
      name: ev.name,
      shortName: truncate(ev.name, 8),
      average: ev.average,
      passGrade,
    })),
    [data, passGrade]
  );

  const passRate = Math.round((data.overall.passRate || 0) * 100);

  return (
    <div className="p-3 flex flex-col gap-4 min-w-0">
      {/* Stats row */}
      <div className="flex gap-2">
        <StatBox label="Promedio" value={data.overall.classAverage ?? '—'} />
        <StatBox label="Aprobación" value={`${passRate}%`} />
      </div>
      <div className="flex gap-2">
        <StatBox label="Mediana" value={data.overall.median ?? '—'} />
        <StatBox label="Desv. std" value={data.overall.stdDev ?? '—'} />
      </div>

      {/* Histogram */}
      <section
        className="rounded-[var(--radius-lg)] border p-3 min-w-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
          Distribución de notas
        </h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="range" tick={axisStyle} />
              <YAxis allowDecimals={false} tick={axisStyle} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [v, 'Alumnos']}
              />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} name="Alumnos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Line chart */}
      <section
        className="rounded-[var(--radius-lg)] border p-3 min-w-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
          Evolución por evaluación
        </h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: lineData.length > 3 ? 36 : 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="shortName"
                tick={{ ...axisStyle, ...(lineData.length > 3 ? { angle: -30, textAnchor: 'end' } : {}) }}
                interval={0}
              />
              <YAxis domain={[1, 7]} ticks={[1, 3, 5, 7]} tick={axisStyle} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }}
                labelFormatter={(l, payload) => payload?.[0]?.payload?.name || l}
                formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : v, 'Promedio']}
              />
              <ReferenceLine y={passGrade} stroke="#dc2626" strokeDasharray="6 4" />
              <Line type="monotone" dataKey="average" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Promedio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Failed students */}
      {data.failed?.length > 0 && (
        <section
          className="rounded-[var(--radius-lg)] border p-3 min-w-0"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-semibold mb-3 text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            Alumnos reprobados
            <span className="text-xs font-normal px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {data.failed.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {data.failed.map((student) => (
              <div key={student.studentId} className="flex justify-between items-center border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{student.name}</span>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--color-grade-fail-text)' }}>
                  {typeof student.average === 'number' ? student.average.toFixed(1) : student.average}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
