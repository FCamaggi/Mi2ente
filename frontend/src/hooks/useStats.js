import { useMemo } from 'react';
import { getSituacion, weightedAverage } from '../utils/gradeHelpers';

export function useStats({ students, evaluations, gradesMap, passGrade, decimals }) {
  const studentAverages = useMemo(() => {
    const map = {};
    students.forEach((student) => {
      const studentGrades = evaluations
        .map((evaluation) => gradesMap[`${student.id}_${evaluation._id || evaluation.id}`])
        .filter(Boolean);
      map[student.id] = weightedAverage(studentGrades, evaluations, decimals);
    });
    return map;
  }, [students, evaluations, gradesMap, decimals]);

  const stats = useMemo(() => {
    const avgs = Object.values(studentAverages);
    const valid = avgs.filter((avg) => avg !== null);
    if (valid.length === 0) return null;

    const passed = valid.filter((avg) => avg >= passGrade).length;
    return {
      classAverage: parseFloat((valid.reduce((sum, avg) => sum + avg, 0) / valid.length).toFixed(1)),
      maxGrade: Math.max(...valid),
      minGrade: Math.min(...valid),
      passed,
      failed: valid.length - passed,
      studentsWithGrades: valid.length,
      passRate: passed / valid.length
    };
  }, [studentAverages, passGrade]);

  const rows = useMemo(() => {
    return students.map((student) => {
      const average = studentAverages[student.id];
      return {
        ...student,
        average,
        situacion: getSituacion(average, passGrade)
      };
    });
  }, [students, studentAverages, passGrade]);

  return { studentAverages, stats, rows };
}
