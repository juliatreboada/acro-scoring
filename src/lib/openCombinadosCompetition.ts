function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Enables the OPEN/COMBINADOS bracket format when the competition name
 * contains "CidadeDoLérez" (accent/spacing-insensitive).
 */
export function isOpenCombinadosCompetitionName(name: string | null | undefined): boolean {
  if (!name) return false
  const normalized = normalizeText(name)
  return normalized.includes('cidadedolerez')
}

