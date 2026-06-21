export type TvRankingSlot = {
  id: string            // unique ID (session group key or custom)
  label: string         // display header on TV
  session_ids: string[] // which session IDs contribute results to this slot
  enabled: boolean
  source_slot_labels?: string[] // set when this slot was created by merging others
}

export type TvRankingConfig = {
  duration_seconds: number   // seconds per slot
  background_color: string   // CSS hex color e.g. '#0f172a'
  slots: TvRankingSlot[]
}

export const DEFAULT_RANKING_CONFIG: TvRankingConfig = {
  duration_seconds: 10,
  background_color: '#0f172a',
  slots: [],
}
