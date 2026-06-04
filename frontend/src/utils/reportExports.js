import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getEffectiveWeight, getSituacion, weightedAverage } from './gradeHelpers';
import { formatDate } from './formatters';

const getId = (item) => item?._id || item?.id;

export function filterEvaluations(evaluations, filters = {}) {
  const ids = new Set(filters.evaluationIds || []);
  return evaluations.filter((evaluation) => {
    const id = getId(evaluation);
    if (ids.size > 0 && !ids.has(id)) return false;
    if (!filters.from && !filters.to) return true;
    if (!evaluation.date) return false;
    const date = evaluation.date.slice(0, 10);
    if (filters.from && date < filters.from) return false;
    if (filters.to && date > filters.to) return false;
    return true;
  });
}

function gradeLabel(grade) {
  if (!grade || grade.status === 'pending') return '-';
  if (grade.status === 'absent') return 'Aus';
  if (grade.status === 'exempt') return 'Exen';
  return grade.value ?? '-';
}

function safeFilename(value, fallback = 'reporte') {
  return (value || fallback).replace(/[^a-z0-9]/gi, '_');
}

export function buildCoursePdf({ course, students, evaluations, grades, filters = {} }) {
  const filteredEvaluations = filterEvaluations(evaluations, filters);
  const passGrade = course?.gradeConfig?.passGrade ?? 4;
  const decimals = course?.gradeConfig?.decimals ?? 1;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.text(course?.name || 'Libro de notas', 14, 16);
  doc.setFontSize(10);
  doc.text([course?.subject, course?.level, course?.academicYear].filter(Boolean).join(' - '), 14, 22);

  autoTable(doc, {
    startY: 28,
    styles: { fontSize: 8 },
    head: [[
      'N',
      'Apellido',
      'Nombre',
      ...filteredEvaluations.map((evaluation) => {
        const label = evaluation.groupName ? `${evaluation.name} (${evaluation.groupName})` : evaluation.name;
        return `${label} ${getEffectiveWeight(evaluation).toFixed(1)}%`;
      }),
      'Promedio',
      'Situacion'
    ]],
    body: students.map((student) => {
      const studentId = getId(student);
      const studentGrades = grades.filter((grade) => grade.studentId === studentId);
      const average = weightedAverage(studentGrades, filteredEvaluations, decimals);
      const situation = getSituacion(average, passGrade);
      return [
        student.listNumber,
        student.lastName,
        student.firstName,
        ...filteredEvaluations.map((evaluation) => {
          const evaluationId = getId(evaluation);
          const grade = studentGrades.find((item) => item.evaluationId === evaluationId);
          return gradeLabel(grade);
        }),
        average ?? '-',
        situation === 'aprobado' ? 'Aprobado/a' : situation === 'reprobado' ? 'Reprobado/a' : 'Sin notas'
      ];
    })
  });

  return {
    doc,
    filename: `${safeFilename(course?.name, 'curso')}_${course?.academicYear || ''}.pdf`
  };
}

export function buildStudentPdf({ course, studentReport, filters = {} }) {
  const student = studentReport?.student;
  const filteredGrades = filterEvaluations(
    (studentReport?.grades || []).map((grade) => ({
      ...grade,
      _id: grade.evaluationId,
      name: grade.evaluationName,
      date: grade.date || null
    })),
    filters
  );
  const passGrade = course?.gradeConfig?.passGrade ?? 4;
  const decimals = course?.gradeConfig?.decimals ?? 1;
  const average = weightedAverage(
    filteredGrades.map((grade) => ({ ...grade, evaluationId: grade.evaluationId })),
    filteredGrades,
    decimals
  );
  const situation = getSituacion(average, passGrade);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${student?.lastName || ''} ${student?.firstName || ''}`.trim() || 'Ficha alumno', 14, 16);
  doc.setFontSize(10);
  doc.text([course?.name, course?.academicYear].filter(Boolean).join(' - '), 14, 22);
  doc.text(`Promedio: ${average ?? '-'} - ${situation === 'aprobado' ? 'Aprobado/a' : situation === 'reprobado' ? 'Reprobado/a' : 'Sin notas'}`, 14, 28);

  autoTable(doc, {
    startY: 36,
    styles: { fontSize: 9 },
    head: [['Evaluacion', 'Grupo', 'Ponderacion', 'Nota']],
    body: filteredGrades.map((grade) => [
      grade.evaluationName,
      grade.groupName || '',
      `${grade.effectiveWeight ?? grade.weight}%`,
      gradeLabel(grade)
    ])
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    styles: { fontSize: 9 },
    head: [['Fecha', 'Categoria', 'Observacion']],
    body: (studentReport?.observations || []).map((observation) => [
      observation.date ? formatDate(observation.date) : '',
      observation.category,
      observation.text
    ])
  });

  return {
    doc,
    filename: `${safeFilename(course?.name, 'curso')}_${safeFilename(student?.lastName || student?.firstName, 'alumno')}.pdf`
  };
}
