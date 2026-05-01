import { CJP_PENALTY_CATEGORIES, cjpCategoryContrib } from '@/lib/scoringRules'

// ─── primitives ───────────────────────────────────────────────────────────────

export type TrafficLight = 'red' | 'yellow' | 'green'

export type Answers = Record<string, number>
// key = `${sectionIndex}:${questionIndex}` (both 0-based)
// value = numeric value (0, 0.1, 0.2, 0.3, or 0.4)

export type Lang = 'en' | 'es'

export type Performance = {
  id: string
  gymnasts: string
  ageGroup: string
  category: string
  routineType: string
  position: number
  tsUrl?: string | null
}

// ─── EJ types ─────────────────────────────────────────────────────────────────

export type ElementDeduction = {
  value: number
  locked: boolean
}

// key = `${elementId}:${retryNumber}` (retryNumber is 1 or 2)
export type Deductions = Record<string, ElementDeduction>

export type ElementType = 'balance' | 'mount' | 'dynamic' | 'individual' | 'motion'

export type TsElement = {
  id: string
  position: number
  label: string
  difficultyValue: number
  elementType?: ElementType
  isStatic?: boolean  // only relevant when elementType === 'individual'
}

// ─── DJ types ─────────────────────────────────────────────────────────────────

export type ElementFlag = {
  isDone: boolean | null  // null = pending, true = done, false = not done
  tfCount: number         // 0–3, penalty ×0.3 each
  srNotDone: boolean      // −1.0
  forbiddenElement: boolean   // −1.0
  landingWithoutSupport: boolean  // −0.5, only for 11–16 age groups
  note: string
}

// keyed by `${elementId}:${retryNumber}` (retryNumber 1 = main, 2–4 = retries)
export type ElementFlags = Record<string, ElementFlag>

export const DEFAULT_FLAG: ElementFlag = {
  isDone: null,
  tfCount: 0,
  srNotDone: false,
  forbiddenElement: false,
  landingWithoutSupport: false,
  note: '',
}

// ─── CJP types ────────────────────────────────────────────────────────────────

export type PanelJudgeRole = 'CJP' | 'EJ' | 'AJ' | 'DJ'

export type ScoreDetail = {
  djFlags?: ElementFlags
  djExtraElements?: TsElement[]
  djIncorrectTs?: boolean
  ejDeductions?: Deductions
  ejExtraElements?: TsElement[]
}

export type PanelJudge = {
  id: string
  name: string
  role: PanelJudgeRole
  roleNumber: number
}

export type ScoringPerformance = {
  id: string
  teamId: string
  position: number
  gymnasts: string
  ageGroup: string
  category: string
  routineType: string
  skipped: boolean
  tsUrl?: string | null
  elements: TsElement[]
}

export type JudgeScore = {
  panelJudgeId: string
  ejScore: number | null
  ajScore: number | null
  djDifficulty: number | null
  djPenalty: number | null
  cjpPenalty: number | null
  detail?: ScoreDetail
}

export type RoutineResult = {
  performanceId: string
  eScore: number       // raw average (shown ×2 in ranking)
  aScore: number
  difScore: number
  difPenalty: number
  cjpPenalty: number
  finalScore: number
  status: 'provisional' | 'approved'
}

export type PenaltyState = {
  p1Seconds: number     // × 0.1
  p2Value: number       // selector: 0 | 0.1 | 0.3 | 0.5 | 1.0
  p3: boolean           // 0.5
  p4: boolean           // 0.5
  p5Count: number       // × 0.1
  p6Count: number       // × 0.5
  p7: boolean           // 0.3
  p8: boolean           // 0.3
  p9Count: number       // × 0.1
  p10: boolean          // 0.3
  p11: boolean          // 0.5
  p12: boolean          // 0.5
  p13: boolean          // 0.3
  p14Count: number      // × 1.0
}

export const DEFAULT_PENALTY: PenaltyState = {
  p1Seconds: 0, p2Value: 0,
  p3: false, p4: false,
  p5Count: 0, p6Count: 0,
  p7: false, p8: false,
  p9Count: 0, p10: false,
  p11: false, p12: false,
  p13: false, p14Count: 0,
}

export function calcCjpPenalty(p: PenaltyState): number {
  const total = CJP_PENALTY_CATEGORIES.reduce(
    (sum, cat) => sum + cjpCategoryContrib(cat, p[cat.id as keyof PenaltyState] as number | boolean),
    0,
  )
  return parseFloat(total.toFixed(1))
}

// Plain average, or drop highest + lowest when ≥4 judges
export function average(values: number[]): number {
  if (values.length === 0) return 0
  if (values.length >= 4) {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = sorted.slice(1, -1)
    return middle.reduce((s, v) => s + v, 0) / middle.length
  }
  return values.reduce((s, v) => s + v, 0) / values.length
}

// Returns indices of dropped scores (highest + lowest) when ≥4 judges
export function droppedIndices(values: number[]): Set<number> {
  if (values.length < 4) return new Set()
  const indexed = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v)
  return new Set([indexed[0].i, indexed[indexed.length - 1].i])
}

export function computeResult(
  performanceId: string,
  scores: JudgeScore[],
  panelJudges: PanelJudge[],
  cjpPenaltyValue: number,
  status: 'provisional' | 'approved',
): RoutineResult {
  const ejJudges = panelJudges.filter((j) => j.role === 'EJ')
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ')
  const djJudges = panelJudges.filter((j) => j.role === 'DJ')

  const ejVals = ejJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ejScore ?? 0)
  const ajVals = ajJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ajScore ?? 0)
  const djScores = djJudges
    .map((j) => scores.find((s) => s.panelJudgeId === j.id))
    .filter((s): s is JudgeScore => s != null && s.djDifficulty != null)

  const eScore = average(ejVals)
  const aScore = average(ajVals)
  const difScore = djScores.length > 0
    ? djScores.reduce((sum, s) => sum + (s.djDifficulty ?? 0), 0) / djScores.length
    : 0
  const difPenalty = djScores.length > 0
    ? djScores.reduce((sum, s) => sum + (s.djPenalty ?? 0), 0) / djScores.length
    : 0
  const finalScore = Math.max(0, eScore * 2 + aScore + difScore - difPenalty - cjpPenaltyValue)

  return {
    performanceId,
    eScore: parseFloat(eScore.toFixed(3)),
    aScore: parseFloat(aScore.toFixed(3)),
    difScore: parseFloat(difScore.toFixed(2)),
    difPenalty: parseFloat(difPenalty.toFixed(1)),
    cjpPenalty: parseFloat(cjpPenaltyValue.toFixed(1)),
    finalScore: parseFloat(finalScore.toFixed(3)),
    status,
  }
}
