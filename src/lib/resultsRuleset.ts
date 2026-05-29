/** Matches `ResultsView` ruleset tabs from the age group display label. Checks whole words so "Prebase" doesn't match "Base". */
export function getResultsRuleset(ageGroup: string): 'Escolar' | 'Base' | 'Nacional' {
  const words = ageGroup.toLowerCase().split(/[\s()]+/)
  if (words.includes('escolar')) return 'Escolar'
  if (words.includes('base')) return 'Base'
  return 'Nacional'
}
