function getEffectiveWeight(evaluation) {
  if (!evaluation) return 0;
  if (evaluation.groupName && evaluation.groupWeight !== null && evaluation.groupWeight !== undefined) {
    return parseFloat((((evaluation.groupWeight || 0) * (evaluation.weight || 0)) / 100).toFixed(4));
  }
  return evaluation.weight || 0;
}

function getEvaluationGroupTotals(evaluations) {
  const seenGroups = new Set();
  let total = 0;

  for (const evaluation of evaluations) {
    if (evaluation.groupName) {
      const key = `${evaluation.groupName}::${evaluation.groupWeight ?? 0}`;
      if (!seenGroups.has(key)) {
        total += evaluation.groupWeight || 0;
        seenGroups.add(key);
      }
    } else {
      total += evaluation.weight || 0;
    }
  }

  return parseFloat(total.toFixed(1));
}

function decorateEvaluation(evaluation) {
  const plain = typeof evaluation.toObject === 'function' ? evaluation.toObject() : { ...evaluation };
  return {
    ...plain,
    effectiveWeight: getEffectiveWeight(plain)
  };
}

module.exports = {
  getEffectiveWeight,
  getEvaluationGroupTotals,
  decorateEvaluation
};
