import type { PenaltyState } from '@/components/cjp/types'
import type { ElementFlags } from '@/components/dj-scoring/types'

export const PENALTY_LABELS: Record<'en' | 'es', string[]> = {
  en: [
    'Duration of music over the time limit',
    'Difference in heights',
    'Poor Sportsmanship on the Field of Play',
    'Music infringements (e.g. inappropriate lyrics)',
    'Stepping over the boundary line',
    'Landing / falling outside the boundary',
    'Starting before the music or ending before/after the music',
    'Failure to observe publicity rules (National ID not visible)',
    'Adjustment of attire / loss of accessories',
    'All other attire infringements',
    'Forbidden or immodest attire',
    'Markings on mat (exception MG Balance and Combined)',
    'Indecent positions',
    'Coach present on the floor',
  ],
  es: [
    'Duración de la música por encima del límite de tiempo',
    'Diferencia de alturas entre los deportistas',
    'Conducta antideportiva en el campo de juego',
    'Infracciones musicales (p.ej. letras inapropiadas)',
    'Pisar fuera de la línea de límite',
    'Aterrizaje / caída fuera del límite',
    'Comenzar antes de la música o terminar antes/después',
    'Incumplimiento de normas publicitarias (identificación nacional no visible)',
    'Ajuste del atuendo / pérdida de accesorios',
    'Cualquier otra infracción de atuendo',
    'Atuendo prohibido o indecente',
    'Marcas en la colchoneta (excepción GM Equilibrio y Combinado)',
    'Posiciones indecentes',
    'Entrenador presente en el suelo',
  ],
}

export function activePenalties(
  state: PenaltyState,
  lang: 'en' | 'es' = 'es',
): { label: string; value: number }[] {
  const labels = PENALTY_LABELS[lang]
  const out: { label: string; value: number }[] = []

  if (state.p1Seconds > 0) out.push({ label: labels[0], value: +(state.p1Seconds * 0.1).toFixed(1) })
  if (state.p2Value  > 0)  out.push({ label: labels[1], value: state.p2Value })
  if (state.p3)             out.push({ label: labels[2], value: 0.5 })
  if (state.p4)             out.push({ label: labels[3], value: 0.5 })
  if (state.p5Count > 0)   out.push({ label: labels[4], value: +(state.p5Count * 0.1).toFixed(1) })
  if (state.p6Count > 0)   out.push({ label: labels[5], value: +(state.p6Count * 0.5).toFixed(1) })
  if (state.p7)             out.push({ label: labels[6], value: 0.3 })
  if (state.p8)             out.push({ label: labels[7], value: 0.3 })
  if (state.p9Count > 0)   out.push({ label: labels[8], value: +(state.p9Count * 0.1).toFixed(1) })
  if (state.p10)            out.push({ label: labels[9], value: 0.3 })
  if (state.p11)            out.push({ label: labels[10], value: 0.5 })
  if (state.p12)            out.push({ label: labels[11], value: 0.5 })
  if (state.p13)            out.push({ label: labels[12], value: 0.3 })
  if (state.p14Count > 0)  out.push({ label: labels[13], value: state.p14Count * 1.0 })

  return out
}

// ─── DJ flag penalty summaries ────────────────────────────────────────────────

const DJ_FLAG_LABELS: Record<'en' | 'es', {
  tf:        (n: number) => string
  srNotDone: (n: number) => string
  forbidden: (n: number) => string
  landing:   (n: number) => string
}> = {
  en: {
    tf:        (n) => `Technical fault${n > 1 ? 's' : ''} (${n}×)`,
    srNotDone: (n) => `SR not done (${n}×)`,
    forbidden: (n) => `Forbidden element${n > 1 ? 's' : ''} (${n}×)`,
    landing:   (n) => `Landing without support (${n}×)`,
  },
  es: {
    tf:        (n) => `Fallo técnico (${n}×)`,
    srNotDone: (n) => `SR no realizado (${n}×)`,
    forbidden: (n) => `Elemento prohibido (${n}×)`,
    landing:   (n) => `Aterrizaje sin apoyo (${n}×)`,
  },
}

// Summarises one DJ's ElementFlags into human-readable penalty reasons.
// When there are two DJs, pass the first one — flags should agree; the
// numeric dif_penalty already reflects the average.
export function activeDJPenalties(
  flags: ElementFlags,
  lang: 'en' | 'es' = 'es',
): { label: string; value: number }[] {
  const L = DJ_FLAG_LABELS[lang]
  let tfTotal = 0
  let srCount = 0
  let forbiddenCount = 0
  let landingCount = 0

  for (const flag of Object.values(flags)) {
    tfTotal        += flag.tfCount
    if (flag.srNotDone)             srCount++
    if (flag.forbiddenElement)      forbiddenCount++
    if (flag.landingWithoutSupport) landingCount++
  }

  const out: { label: string; value: number }[] = []
  if (tfTotal > 0)        out.push({ label: L.tf(tfTotal),           value: +(tfTotal * 0.3).toFixed(1) })
  if (srCount > 0)        out.push({ label: L.srNotDone(srCount),    value: srCount * 1.0 })
  if (forbiddenCount > 0) out.push({ label: L.forbidden(forbiddenCount), value: forbiddenCount * 1.0 })
  if (landingCount > 0)   out.push({ label: L.landing(landingCount), value: +(landingCount * 0.5).toFixed(1) })
  return out
}
