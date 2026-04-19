export function getEffectiveWeight(evaluation) {
  if (evaluation?.effectiveWeight !== undefined) return evaluation.effectiveWeight;
  // For grouped evaluations: effective = weight_within_group × groupWeight / 100
  if (evaluation?.groupName && evaluation?.groupWeight != null) {
    return (evaluation.weight * evaluation.groupWeight) / 100;
  }
  return evaluation?.weight ?? 0;
}

export function getCourseWeightTotal(evaluations) {
  const seenGroups = new Set();
  let total = 0;

  for (const evaluation of evaluations) {
    if (evaluation?.groupName) {
      const key = `${evaluation.groupName}::${evaluation.groupWeight ?? 0}`;
      if (!seenGroups.has(key)) {
        total += evaluation.groupWeight || 0;
        seenGroups.add(key);
      }
    } else {
      total += evaluation?.weight || 0;
    }
  }

  return parseFloat(total.toFixed(1));
}

export function weightedAverage(grades, evaluations, decimals = 1) {
  let sumProduct = 0;
  let sumWeights = 0;

  for (const evaluation of evaluations) {
    const id = evaluation._id || evaluation.id;
    const grade = grades.find(g => (g.evaluationId === id));
    const weight = getEffectiveWeight(evaluation);
    if (grade && grade.status === 'graded' && grade.value !== null && grade.value !== undefined) {
      sumProduct += grade.value * weight;
      sumWeights += weight;
    }
  }

  if (sumWeights === 0) return null;
  return parseFloat((sumProduct / sumWeights).toFixed(decimals));
}

export function getSituacion(avg, passGrade = 4.0) {
  if (avg === null || avg === undefined) return 'sin_notas';
  return avg >= passGrade ? 'aprobado' : 'reprobado';
}

export function formatGrade(value) {
  if (value === null || value === undefined) return '—';
  return typeof value === 'number' ? value.toFixed(1) : value;
}

export function gradeColor(value, passGrade = 4.0) {
  if (value === null || value === undefined) return '';
  return value >= passGrade ? 'text-emerald-600' : 'text-red-500';
}

export function gradeBg(value, passGrade = 4.0) {
  if (value === null || value === undefined) return '';
  return value >= passGrade ? 'grade-ok' : 'grade-fail';
}
