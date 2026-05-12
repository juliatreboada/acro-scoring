/** Storage bucket for competition sponsor clips (public read). */
export const TV_SPONSOR_BUCKET = 'tv-sponsor-videos'

export type TvSponsorClip = {
  id: string
  /** Path within `TV_SPONSOR_BUCKET`, e.g. `{competitionId}/{uuid}.mp4` */
  path: string
  label?: string
}

export function parseTvSponsorVideos(raw: unknown): TvSponsorClip[] {
  if (!Array.isArray(raw)) return []
  const out: TvSponsorClip[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id : null
    const path = typeof o.path === 'string' ? o.path : null
    if (!id || !path) continue
    const label = typeof o.label === 'string' ? o.label : undefined
    out.push(label ? { id, path, label } : { id, path })
  }
  return out
}
