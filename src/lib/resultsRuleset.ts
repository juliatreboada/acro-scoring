/** Matches `ResultsView` ruleset tabs: age group display label from `age_group_rules.age_group`. */
export function getResultsRuleset(ageGroup: string): 'Escolar' | 'Base' | 'Nacional' {
  const s = ageGroup.toLowerCase()
  if (s.includes('escolar')) return 'Escolar'
  if (s.includes('base')) return 'Base'
  return 'Nacional'
}
