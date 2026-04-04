import type { ElementFlags } from '@/components/dj-scoring/types'
import type { TsElement, Deductions } from '@/components/ej-scoring/types'

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

export type MockPerf = {
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
  let t = 0
  t += p.p1Seconds * 0.1
  t += p.p2Value
  t += p.p3 ? 0.5 : 0
  t += p.p4 ? 0.5 : 0
  t += p.p5Count * 0.1
  t += p.p6Count * 0.5
  t += p.p7 ? 0.3 : 0
  t += p.p8 ? 0.3 : 0
  t += p.p9Count * 0.1
  t += p.p10 ? 0.3 : 0
  t += p.p11 ? 0.5 : 0
  t += p.p12 ? 0.5 : 0
  t += p.p13 ? 0.3 : 0
  t += p.p14Count * 1.0
  return parseFloat(t.toFixed(1))
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
