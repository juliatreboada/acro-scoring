// ─── admin domain types ───────────────────────────────────────────────────────

export type AgeGroupRule = {
  id: string
  age_group: string
  ruleset: string
  min_age: number
  max_age: number | null   // null = no upper limit (e.g. Senior)
}

export type AdminUser = {
  id: string
  full_name: string
  email: string
}

export type Competition = {
  id: string
  name: string
  status: CompetitionStatus
  location: string | null
  start_date: string | null            // ISO date 'YYYY-MM-DD'
  end_date: string | null
  registration_deadline: string | null // last day clubs can register
  age_groups: string[]                 // selected age groups for this competition
  poster_url: string | null            // event poster / logo
  admin: AdminUser | null              // assigned competition-admin
  created_at: string
}

export type Panel = {
  id: string
  competition_id: string
  panel_number: 1 | 2
}

export type Section = {
  id: string
  competition_id: string
  section_number: number
  label: string | null
}

export type Session = {
  id: string
  competition_id: string
  panel_id: string
  section_id: string
  name: string
  age_group: string
  category: string
  routine_type: 'Balance' | 'Dynamic' | 'Combined'
  status: 'waiting' | 'active' | 'finished'
  order_index: number   // order within the section
}

export type Judge = {
  id: string
  full_name: string
  email: string | null    // from profiles.email
  phone: string | null
  licence: string | null
  avatar_url: string | null
}

// Club nominates a judge for a specific competition.
export type CompetitionJudgeNomination = {
  id: string
  competition_id: string
  judge_id: string
  club_id: string
}

export type Club = {
  id: string
  club_name: string
  contact_name: string | null
  phone: string | null
  avatar_url: string | null
}

export type Gymnast = {
  id: string
  club_id: string
  first_name: string
  last_name_1: string       // first surname
  last_name_2: string | null  // second surname (optional)
  date_of_birth: string     // 'YYYY-MM-DD'
  photo_url: string | null
}

// How many gymnasts each category requires
export const CATEGORY_SIZE: Record<string, number> = {
  "Women's Pair":  2,
  "Men's Pair":    2,
  "Mixed Pair":    2,
  "Women's Group": 3,
  "Mixed Group":   4,
  'Pairs':    2,
  'Groups 3': 3,
  'Groups 4': 4,
}

export type Team = {
  id: string
  club_id: string
  gymnast_ids?: string[]    // references to Gymnast.id
  category: string          // from ACRO_CATEGORIES
  age_group: string
  gymnast_display: string   // e.g. "Fernández / Ruiz"
  photo_url: string | null
}

export type RoutineMusic = {
  id: string
  team_id: string
  competition_id: string
  routine_type: 'Balance' | 'Dynamic' | 'Combined'
  music_filename: string | null
  ts_filename: string | null   // technical sheet (PDF)
  uploaded_at: string
}

export type CompetitionEntry = {
  id: string
  competition_id: string
  team_id: string
  dropped_out: boolean
}

export type SessionOrder = {
  session_id: string
  team_id: string
  position: number   // 1-based
}

export type SectionPanelJudge = {
  id: string
  section_id: string
  panel_id: string
  judge_id: string | null   // null = slot exists but unassigned
  role: 'CJP' | 'EJ' | 'AJ' | 'DJ'
  role_number: number
}

export const ROLE_CONFIG = {
  CJP: { min: 1, max: 1 },
  EJ:  { min: 2, max: 5 },
  AJ:  { min: 2, max: 5 },
  DJ:  { min: 1, max: 2 },
} as const

export type Role = keyof typeof ROLE_CONFIG

// Generate default assignment slots for a section × panel
export function defaultSlots(sectionId: string, panelId: string): Omit<SectionPanelJudge, 'id'>[] {
  const slots: Omit<SectionPanelJudge, 'id'>[] = []
  for (const [role, cfg] of Object.entries(ROLE_CONFIG) as [Role, { min: number; max: number }][]) {
    for (let n = 1; n <= cfg.min; n++) {
      slots.push({ section_id: sectionId, panel_id: panelId, judge_id: null, role, role_number: n })
    }
  }
  return slots
}

export const ACRO_CATEGORIES = [
  "Women's Pair",
  "Men's Pair",
  "Mixed Pair",
  "Women's Group",
  "Mixed Group",
] as const

// Categories available depending on ruleset ('Escolar'/'Base' vs FIG)
export function categoriesForRuleset(ruleset: string): string[] {
  const r = ruleset.toLowerCase()
  if (r === 'escolar' || r === 'base') return ['Pairs', 'Groups 3', 'Groups 4']
  return ["Women's Pair", "Men's Pair", "Mixed Pair", "Women's Group", "Mixed Group"]
}

// Translations for category keys
export const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  en: {
    "Women's Pair":  "Women's Pair",
    "Men's Pair":    "Men's Pair",
    "Mixed Pair":    "Mixed Pair",
    "Women's Group": "Women's Group",
    "Mixed Group":   "Mixed Group",
    'Pairs':    'Pairs',
    'Groups 3': 'Groups 3',
    'Groups 4': 'Groups 4',
  },
  es: {
    "Women's Pair":  'Pareja Femenina',
    "Men's Pair":    'Pareja Masculina',
    "Mixed Pair":    'Pareja Mixta',
    "Women's Group": 'Grupo Femenino',
    "Mixed Group":   'Grupo Mixto',
    'Pairs':    'Parejas',
    'Groups 3': 'Tríos',
    'Groups 4': 'Cuartetos',
  },
}

export const ROUTINE_TYPES = ['Balance', 'Dynamic', 'Combined'] as const

export type CompetitionStatus = 'draft' | 'registration_open' | 'registration_closed' | 'active' | 'finished'

export const NEXT_STATUS: Partial<Record<CompetitionStatus, CompetitionStatus>> = {
  draft:                'registration_open',
  registration_open:    'registration_closed',
  registration_closed:  'active',
  active:               'finished',
}
