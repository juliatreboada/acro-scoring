// Scoring system constants — single source of truth for all magic numbers.
// FIG ruleset changes every 4-year Olympic cycle; update here to affect the whole app.

export const MAX_RETRIES = 3

export const DEDUCTION_VALUES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

export const DJ_ELEMENT_PENALTY = {
  tfPerFlag: 0.3,
  srNotDone: 1.0,
  forbiddenElement: 1.0,
  landingWithoutSupport: 0.5,
  incorrectTs: 0.3,
} as const

// ─── CJP penalty categories ───────────────────────────────────────────────────

export type CjpPenaltyInput =
  | { kind: 'seconds' }
  | { kind: 'select'; options: number[] }
  | { kind: 'boolean'; value: number }
  | { kind: 'counter'; multiplier: number }

export type CjpPenaltyCategory = {
  id: string
  labelEs: string
  labelEn: string
  unitEs: string
  unitEn: string
  input: CjpPenaltyInput
}

export const CJP_PENALTY_CATEGORIES: CjpPenaltyCategory[] = [
  { id: 'p1Seconds', input: { kind: 'seconds' }, unitEs: '× 0.1 / seg', unitEn: '× 0.1 / sec', labelEs: 'Duración de la música por encima del límite de tiempo', labelEn: 'Duration of music over the time limit' },
  { id: 'p2Value',   input: { kind: 'select', options: [0, 0.1, 0.3, 0.5, 1.0] }, unitEs: 'seleccionar', unitEn: 'select', labelEs: 'Diferencia de alturas entre los deportistas', labelEn: 'Difference in heights' },
  { id: 'p3',        input: { kind: 'boolean', value: 0.5 }, unitEs: '0.5', unitEn: '0.5', labelEs: 'Conducta antideportiva en el campo de juego', labelEn: 'Poor Sportsmanship on the Field of Play' },
  { id: 'p4',        input: { kind: 'boolean', value: 0.5 }, unitEs: '0.5', unitEn: '0.5', labelEs: 'Infracciones musicales (p.ej. letras inapropiadas)', labelEn: 'Music infringements (e.g. inappropriate lyrics)' },
  { id: 'p5Count',   input: { kind: 'counter', multiplier: 0.1 }, unitEs: '× 0.1 cada vez', unitEn: '× 0.1 each', labelEs: 'Pisar fuera de la línea de límite', labelEn: 'Stepping over the boundary line' },
  { id: 'p6Count',   input: { kind: 'counter', multiplier: 0.5 }, unitEs: '× 0.5 cada vez', unitEn: '× 0.5 each', labelEs: 'Aterrizaje / caída fuera del límite', labelEn: 'Landing / falling outside the boundary' },
  { id: 'p7',        input: { kind: 'boolean', value: 0.3 }, unitEs: '0.3', unitEn: '0.3', labelEs: 'Comenzar antes de la música o terminar antes/después', labelEn: 'Starting before the music or ending before/after the music' },
  { id: 'p8',        input: { kind: 'boolean', value: 0.3 }, unitEs: '0.3', unitEn: '0.3', labelEs: 'Incumplimiento de normas publicitarias (identificación nacional no visible)', labelEn: 'Failure to observe publicity rules (National ID not visible)' },
  { id: 'p9Count',   input: { kind: 'counter', multiplier: 0.1 }, unitEs: '× 0.1 cada vez', unitEn: '× 0.1 each', labelEs: 'Ajuste del atuendo / pérdida de accesorios', labelEn: 'Adjustment of attire / loss of accessories' },
  { id: 'p10',       input: { kind: 'boolean', value: 0.3 }, unitEs: '0.3', unitEn: '0.3', labelEs: 'Cualquier otra infracción de atuendo', labelEn: 'All other attire infringements' },
  { id: 'p11',       input: { kind: 'boolean', value: 0.5 }, unitEs: '0.5', unitEn: '0.5', labelEs: 'Atuendo prohibido o indecente', labelEn: 'Forbidden or immodest attire' },
  { id: 'p12',       input: { kind: 'boolean', value: 0.5 }, unitEs: '0.5', unitEn: '0.5', labelEs: 'Marcas en la colchoneta (excepción GM Equilibrio y Combinado)', labelEn: 'Markings on mat (exception MG Balance and Combined)' },
  { id: 'p13',       input: { kind: 'boolean', value: 0.3 }, unitEs: '0.3', unitEn: '0.3', labelEs: 'Posiciones indecentes', labelEn: 'Indecent positions' },
  { id: 'p14Count',  input: { kind: 'counter', multiplier: 1.0 }, unitEs: '× 1.0 cada vez', unitEn: '× 1.0 each', labelEs: 'Entrenador presente en el suelo', labelEn: 'Coach present on the floor' },
]

export function cjpCategoryContrib(cat: CjpPenaltyCategory, val: number | boolean): number {
  switch (cat.input.kind) {
    case 'seconds': return (val as number) * 0.1
    case 'select':  return val as number
    case 'boolean': return (val as boolean) ? cat.input.value : 0
    case 'counter': return (val as number) * cat.input.multiplier
  }
}
