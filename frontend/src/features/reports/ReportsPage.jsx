import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses.api';
import { studentsApi } from '../../api/students.api';
import { evaluationsApi } from '../../api/evaluations.api';
import { gradesApi } from '../../api/grades.api';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { buildCoursePdf, buildStudentPdf, filterEvaluations } from '../../utils/reportExports';

const REPORT_TYPES = {
  course: 'course',
  student: 'student'
};

function buildExportParams(filters) {
  const params = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.evaluationIds.length > 0) params.evaluationIds = filters.evaluationIds.join(',');
  return params;
}

function getId(item) {
  return item?._id || item?.id;
}

export function ReportsPage() {
  const [courseId, setCourseId] = useState('');
  const [reportType, setReportType] = useState(REPORT_TYPES.course);
  const [studentId, setStudentId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [evaluationIds, setEvaluationIds] = useState([]);
  const [downloading, setDownloading] = useState('');

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses', 'reports'],
    queryFn: () => coursesApi.list({ status: 'active' })
  });

  const courses = coursesData?.courses ?? [];

  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(getId(courses[0]));
  }, [courseId, courses]);

  const selectedCourse = courses.find((course) => getId(course) === courseId);

  const { data: studentsData } = useQuery({
    queryKey: ['students', courseId],
    queryFn: () => studentsApi.list(courseId),
    enabled: Boolean(courseId)
  });

  const { data: evaluationsData } = useQuery({
    queryKey: ['evaluations', courseId],
    queryFn: () => evaluationsApi.list(courseId),
    enabled: Boolean(courseId)
  });

  const { data: gradesData } = useQuery({
    queryKey: ['grades', courseId],
    queryFn: () => gradesApi.listByCourse(courseId),
    enabled: Boolean(courseId && reportType === REPORT_TYPES.course)
  });

  const students = studentsData?.students ?? [];
  const evaluations = evaluationsData?.evaluations ?? [];
  const grades = gradesData?.grades ?? [];

  useEffect(() => {
    setStudentId('');
    setEvaluationIds([]);
  }, [courseId]);

  useEffect(() => {
    if (reportType === REPORT_TYPES.student && !studentId && students.length > 0) {
      setStudentId(getId(students[0]));
    }
  }, [reportType, studentId, students]);

  const filteredEvaluations = useMemo(() => (
    filterEvaluations(evaluations, { from, to, evaluationIds })
  ), [evaluations, from, to, evaluationIds]);

  const toggleEvaluation = (id) => {
    setEvaluationIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const filters = { from, to, evaluationIds };

  const downloadCoursePdf = () => {
    if (!selectedCourse) return;
    try {
      const { doc, filename } = buildCoursePdf({
        course: selectedCourse,
        students,
        evaluations,
        grades,
        filters
      });
      doc.save(filename);
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  const downloadStudentPdf = async () => {
    if (!selectedCourse || !studentId) return;
    setDownloading('student-pdf');
    try {
      const studentReport = await studentsApi.getOne(courseId, studentId);
      const { doc, filename } = buildStudentPdf({ course: selectedCourse, studentReport, filters });
      doc.save(filename);
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setDownloading('');
    }
  };

  const downloadExcel = async () => {
    if (!selectedCourse) return;
    setDownloading('excel');
    try {
      const params = buildExportParams(filters);
      const response = reportType === REPORT_TYPES.student
        ? await studentsApi.exportExcel(courseId, studentId, params)
        : await coursesApi.exportExcel(courseId, params);
      const suffix = reportType === REPORT_TYPES.student ? 'alumno' : 'curso';
      const filename = `${selectedCourse.name?.replace(/[^a-z0-9]/gi, '_') || 'reporte'}_${suffix}.xlsx`;
      coursesApi.downloadBlob(response.data, filename);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'No se pudo exportar Excel');
    } finally {
      setDownloading('');
    }
  };

  const handlePdf = () => {
    if (reportType === REPORT_TYPES.student) {
      downloadStudentPdf();
      return;
    }
    downloadCoursePdf();
  };

  if (loadingCourses) return <LoadingSpinner className="py-16" />;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">Reportes</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Descarga libros de notas y fichas individuales en PDF o Excel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-4">
          <Select label="Curso" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            {courses.map((course) => (
              <option key={getId(course)} value={getId(course)}>
                {course.name} - {course.academicYear}
              </option>
            ))}
          </Select>

          <Select label="Tipo de reporte" value={reportType} onChange={(event) => setReportType(event.target.value)}>
            <option value={REPORT_TYPES.course}>Libro de notas del curso</option>
            <option value={REPORT_TYPES.student}>Ficha individual del alumno</option>
          </Select>

          {reportType === REPORT_TYPES.student && (
            <Select label="Alumno" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              {students.map((student) => (
                <option key={getId(student)} value={getId(student)}>
                  {student.listNumber}. {student.lastName} {student.firstName}
                </option>
              ))}
            </Select>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <Input label="Desde" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            <Input label="Hasta" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Evaluaciones</p>
            <div className="max-h-64 overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {evaluations.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] p-3">Sin evaluaciones.</p>
              ) : evaluations.map((evaluation) => {
                const id = getId(evaluation);
                return (
                  <label key={id} className="flex items-start gap-2 px-3 py-2 border-b last:border-b-0 border-[var(--color-border)] text-sm">
                    <input
                      type="checkbox"
                      checked={evaluationIds.includes(id)}
                      onChange={() => toggleEvaluation(id)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[var(--color-text-primary)]">{evaluation.name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {evaluation.groupName || 'Sin grupo'}{evaluation.date ? ` - ${evaluation.date.slice(0, 10)}` : ''}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handlePdf} disabled={!courseId || (reportType === REPORT_TYPES.student && !studentId)} loading={downloading === 'student-pdf'}>
              <FileText size={16} /> PDF
            </Button>
            <Button variant="secondary" onClick={downloadExcel} disabled={!courseId || (reportType === REPORT_TYPES.student && !studentId)} loading={downloading === 'excel'}>
              <FileSpreadsheet size={16} /> Excel
            </Button>
          </div>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)]">Vista previa</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {filteredEvaluations.length} evaluacion{filteredEvaluations.length !== 1 ? 'es' : ''} incluidas
              </p>
            </div>
            <Download size={18} className="text-[var(--color-text-secondary)]" />
          </div>
          <div className="p-4 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-secondary)]">
                  <th className="py-2 pr-3">Evaluacion</th>
                  <th className="py-2 pr-3">Grupo</th>
                  <th className="py-2 text-right">Ponderacion</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluations.map((evaluation) => (
                  <tr key={getId(evaluation)} className="border-t border-[var(--color-border)] text-[var(--color-text-primary)]">
                    <td className="py-2 pr-3">{evaluation.name}</td>
                    <td className="py-2 pr-3">{evaluation.groupName || '-'}</td>
                    <td className="py-2 text-right font-mono">{evaluation.effectiveWeight?.toFixed?.(1) ?? evaluation.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEvaluations.length === 0 && (
              <p className="text-sm text-center py-8 text-[var(--color-text-secondary)]">
                No hay evaluaciones para los filtros seleccionados.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
