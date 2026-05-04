/**
 * Trofeo Gondomar (club ranking blocks) on public `/results/[id]` only for this competition.
 *
 * 1. Paste the Supabase `competitions.id` UUID below, **or**
 * 2. Set `NEXT_PUBLIC_TROFEO_GONDOMAR_COMPETITION_ID` in `.env.local` (overrides the constant when non-empty).
 */
export const TROFEO_GONDOMAR_COMPETITION_ID = ''

export function showTrofeoGondomarClubRanking(competitionId: string): boolean {
  const fromEnv =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TROFEO_GONDOMAR_COMPETITION_ID
      ? process.env.NEXT_PUBLIC_TROFEO_GONDOMAR_COMPETITION_ID.trim()
      : ''
  const configured = (fromEnv || TROFEO_GONDOMAR_COMPETITION_ID).trim()
  return configured.length > 0 && competitionId === configured
}
