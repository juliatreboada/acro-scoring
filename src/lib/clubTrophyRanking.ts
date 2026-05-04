import type { ScoringPerformance, RoutineResult } from '@/components/scoring/types'
import { getResultsRuleset } from '@/lib/resultsRuleset'

export type TeamClubInfo = {
  clubId: string
  clubName: string
  clubAvatar: string | null
}

export type ClubTrophyRow = {
  rank: number
  clubId: string
  clubName: string
  clubAvatar: string | null
  /** Sum of up to three highest routine `final_score` values for this club in the ruleset. */
  sumTop3: number
  /** The scores that count toward the sum (length 1–3), highest first. */
  topScores: number[]
  hasProvisional: boolean
  /** Total routines with a score for this club in the ruleset (may exceed 3). */
  routinesCounted: number
}

/**
 * Club ranking: within a ruleset (Escolar or Base), each club’s score is the sum of its
 * three best routine finals (Balance / Dynamic / Combined each count as one routine).
 */
export function computeClubTrophyRanking(
  performances: ScoringPerformance[],
  results: Record<string, RoutineResult>,
  teamClubInfo: Record<string, TeamClubInfo>,
  ruleset: 'Escolar' | 'Base',
): ClubTrophyRow[] {
  type Bucket = {
    clubName: string
    clubAvatar: string | null
    scores: { score: number; prov: boolean }[]
  }
  const byClub = new Map<string, Bucket>()

  for (const p of performances) {
    if (p.skipped) continue
    if (getResultsRuleset(p.ageGroup) !== ruleset) continue
    const info = teamClubInfo[p.teamId]
    if (!info?.clubId) continue
    const res = results[p.id]
    if (!res) continue
    const score = res.finalScore
    if (score == null || Number.isNaN(score)) continue

    let b = byClub.get(info.clubId)
    if (!b) {
      b = { clubName: info.clubName, clubAvatar: info.clubAvatar, scores: [] }
      byClub.set(info.clubId, b)
    }
    b.scores.push({ score, prov: res.status === 'provisional' })
  }

  const rows: ClubTrophyRow[] = []
  for (const [clubId, b] of byClub) {
    const sorted = [...b.scores].sort((a, x) => x.score - a.score)
    const top = sorted.slice(0, 3)
    if (top.length === 0) continue
    rows.push({
      rank: 0,
      clubId,
      clubName: b.clubName,
      clubAvatar: b.clubAvatar,
      sumTop3: top.reduce((s, x) => s + x.score, 0),
      topScores: top.map((x) => x.score),
      hasProvisional: top.some((x) => x.prov),
      routinesCounted: b.scores.length,
    })
  }

  rows.sort((a, b) => b.sumTop3 - a.sumTop3)
  rows.forEach((r, i) => {
    r.rank = i + 1
  })
  return rows
}
