import { useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ClipboardList, Download, Plus, Upload, Users, BarChart3 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses.api';
import { studentsApi } from '../../api/students.api';
import { evaluationsApi } from '../../api/evaluations.api';
import { gradesApi } from '../../api/grades.api';
import { GradeGrid } from '../../components/grades/GradeGrid';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { CourseStats } from './CourseStats';
import { StudentForm } from '../students/StudentForm';
import { StudentProfile } from '../students/StudentProfile';
import { StudentsTab } from '../students/StudentsTab';
import { EvaluationForm } from '../evaluations/EvaluationForm';
import { EvaluationsList } from '../evaluations/EvaluationsList';
import { getEffectiveWeight } from '../../utils/gradeHelpers';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const importInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('grades');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddEval, setShowAddEval] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const { data: courseData } = useQuery({ queryKey: ['course', courseId], queryFn: () => coursesApi.getOne(courseId) });
  const { data: studentsData, refetch: refetchStudents } = useQuery({ queryKey: ['students', courseId], queryFn: () => studentsApi.list(courseId) });
  const { data: evalsData, refetch: refetchEvals } = useQuery({ queryKey: ['evaluations', courseId], queryFn: () => evaluationsApi.list(courseId) });
  const { data: gradesData, refetch: refetchGrades } = useQuery({ queryKey: ['grades', courseId], queryFn: () => gradesApi.listByCourse(courseId) });

  const course = courseData?.course;
  const students = studentsData?.students ?? [];
  const evaluations = evalsData?.evaluations ?? [];
  const grades = gradesData?.grades ?? [];

  const studentRowsForPdf = useMemo(() => {
    return students.map((student) => {
      const row = [
        student.listNumber,
        student.lastName,
        student.firstName
      ];
      evaluations.forEach((evaluation) => {
        const grade = grades.find((item) => item.studentId === student.id && item.evaluationId === (evaluation._id || evaluation.id));
        row.push(grade?.status === 'absent' ? 'Aus' : grade?.status === 'exempt' ? 'Exen' : grade?.value ?? '—');
      });
      row.push(student.average ?? '—');
      return row;
    });
  }, [students, evaluations, grades]);

  const invalidateCourseData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['students', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['grades', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['course-stats', courseId] }),
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    ]);
  };

  const handleExportExcel = async () => {
    try {
      const res = await coursesApi.exportExcel(courseId);
      const filename = `${course?.name?.replace(/[^a-z0-9]/gi, '_')}_${course?.academicYear}.xlsx`;
      coursesApi.downloadBlob(res.data, filename);
    } catch {
      toast.error('Error al exportar');
    }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text(course?.name || 'Libro de notas', 14, 16);
      doc.setFontSize(10);
      doc.text([course?.subject, course?.level, course?.academicYear].filter(Boolean).join(' · '), 14, 22);

      autoTable(doc, {
        startY: 28,
        styles: { fontSize: 8 },
        head: [[
          'N°',
          'Apellido',
          'Nombre',
          ...evaluations.map((evaluation) => {
            const label = evaluation.groupName ? `${evaluation.name} (${evaluation.groupName})` : evaluation.name;
            return `${label} ${getEffectiveWeight(evaluation).toFixed(1)}%`;
          }),
          'Promedio'
        ]],
        body: studentRowsForPdf
      });

      doc.save(`${course?.name?.replace(/[^a-z0-9]/gi, '_') || 'curso'}_${course?.academicYear || ''}.pdf`);
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  const handleImportStudents = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const summary = await studentsApi.import(courseId, file);
      setImportSummary(summary);
      toast.success(`Importados: ${summary.imported}`);
      await invalidateCourseData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'No se pudo importar el archivo');
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  if (!course) return <LoadingSpinner className="py-16" />;

  const tabs = [
    { id: 'grades', label: 'Libro de notas', icon: ClipboardList },
    { id: 'students', label: `Alumnos (${students.length})`, icon: Users },
    { id: 'evaluations', label: `Evaluaciones (${evaluations.length})`, icon: ClipboardList },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <Link to="/courses" className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] mb-2 transition-colors">
          <ChevronLeft size={16} /> Mis cursos
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold font-display text-[var(--color-text-primary)]">{course.name}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {[course.subject, course.level, course.school, course.academicYear].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportStudents} />
            <Button variant="secondary" size="sm" onClick={handleExportExcel} title="Exportar a Excel">
              <Download size={14} /> <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} title="Exportar a PDF">
              <Download size={14} /> <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => importInputRef.current?.click()} loading={importing} title="Importar alumnos">
              <Upload size={14} /> <span className="hidden sm:inline">Importar</span>
            </Button>
            {(activeTab === 'grades' || activeTab === 'students') && (
              <Button size="sm" onClick={() => setShowAddStudent(true)}>
                <Plus size={14} /> Alumno
              </Button>
            )}
            {(activeTab === 'grades' || activeTab === 'evaluations') && (
              <Button size="sm" onClick={() => setShowAddEval(true)}>
                <Plus size={14} /> Evaluación
              </Button>
            )}
          </div>
        </div>

        <div className="flex mt-4 overflow-x-auto -mb-px scrollbar-none gap-1 border-b border-[var(--color-border)]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-[var(--radius-sm)] transition-colors shrink-0 ${
                activeTab === id
                  ? 'bg-[var(--color-bg)] text-[var(--color-primary-500)] border-t border-x border-[var(--color-border)] border-b border-b-[var(--color-bg)] -mb-px'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content: grades/students handle their own internal scroll; others scroll freely */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'grades' && (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {students.length === 0 || evaluations.length === 0 ? (
              <EmptyState
                emoji="📝"
                title={students.length === 0 ? 'Agrega alumnos para comenzar' : 'Define las evaluaciones del curso primero'}
                action={
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddStudent(true)}><Plus size={16} /> Alumno</Button>
                    <Button variant="secondary" onClick={() => setShowAddEval(true)}><Plus size={16} /> Evaluación</Button>
                  </div>
                }
              />
            ) : (
              <GradeGrid
                students={students}
                evaluations={evaluations}
                grades={grades}
                course={course}
                onStudentClick={setSelectedStudent}
                onGradesSaved={invalidateCourseData}
              />
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <StudentsTab
              courseId={courseId}
              students={students}
              passGrade={course?.gradeConfig?.passGrade ?? 4.0}
              onStudentClick={setSelectedStudent}
              onSave={invalidateCourseData}
            />
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-3xl mx-auto">
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold text-[var(--color-text-primary)]">Evaluaciones</h2>
                <Button size="sm" onClick={() => setShowAddEval(true)}><Plus size={14} /> Agregar</Button>
              </div>
              <EvaluationsList
                courseId={courseId}
                evaluations={evaluations}
                totalWeight={evalsData?.totalWeight ?? 0}
                weightValid={evalsData?.weightValid ?? false}
                onUpdate={async () => {
                  await refetchEvals();
                  await invalidateCourseData();
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto">
            <CourseStats courseId={courseId} passGrade={course.gradeConfig?.passGrade ?? 4} />
          </div>
        )}
      </div>

      {showAddStudent && (
        <StudentForm
          courseId={courseId}
          students={students}
          onClose={() => setShowAddStudent(false)}
          onSave={async () => {
            setShowAddStudent(false);
            await refetchStudents();
            await refetchGrades();
          }}
        />
      )}
      {showAddEval && (
        <EvaluationForm
          courseId={courseId}
          onClose={() => setShowAddEval(false)}
          onSave={async () => {
            setShowAddEval(false);
            await refetchEvals();
          }}
        />
      )}
      {selectedStudent && (
        <StudentProfile
          courseId={courseId}
          student={selectedStudent}
          course={course}
          onClose={() => setSelectedStudent(null)}
          onUpdate={invalidateCourseData}
        />
      )}

      <Modal isOpen={Boolean(importSummary)} title="Resultado de importación" onClose={() => setImportSummary(null)} size="sm">
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-[var(--color-text-primary)]">Importados: <strong>{importSummary?.imported ?? 0}</strong></p>
          <p className="text-[var(--color-text-primary)]">Omitidos: <strong>{importSummary?.skipped ?? 0}</strong></p>
          {importSummary?.errors?.length ? (
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] p-3 max-h-48 overflow-auto">
              {importSummary.errors.map((error, index) => (
                <p key={`${error.row}-${index}`} className="text-xs text-[var(--color-text-secondary)]">
                  Fila {error.row}: {error.error}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-text-secondary)]">No hubo errores durante la importación.</p>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setImportSummary(null)}>Cerrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
