// ─── admin domain types ───────────────────────────────────────────────────────

export type AgeGroupRule = {
  id: string
  age_group: string        // base name only, e.g. 'Alevín', 'Senior'
  level: string            // Acro: 'Escolar'|'Base'|'Nacional'|'FIG'; RG: 'Escolar'|'Promoción'|'Prebase'|'Base'|'Copa Base'|'Federado'|'Honor'
  ruleset: string          // Acro: 'FIG'|'RFEG'|'FGX'; RG: 'Individual'|'Group'|'Equipos'
  min_age: number
  max_age: number | null   // null = no upper limit (e.g. Senior)
  routine_count: number    // 1=Combined only, 2=Balance+Dynamic, 3=all three
  sort_order: number
  sport_type: string       // 'acro' | 'rg'
}

// Groups age group rules by level, preserving insertion order (driven by sort_order).
// Section headers show the level: Escolar / Base / Nacional / FIG for Acro;
// Escolar / Promoción / … / Honor for RG.
export function groupByLevel(rules: AgeGroupRule[]): { level: string; rules: AgeGroupRule[] }[] {
  const order: string[] = []
  const map: Record<string, AgeGroupRule[]> = {}
  for (const rule of rules) {
    if (!map[rule.level]) {
      map[rule.level] = []
      order.push(rule.level)
    }
    map[rule.level].push(rule)
  }
  return order.map((l) => ({ level: l, rules: map[l] }))
}

// Full display label for an age group badge.
// Acro: shows level only for Base/Escolar — e.g. "Alevín Base", "Senior", "Alevín Base (FIG)" with includeRuleset
// RG: always includes level and gymnast type — e.g. "Benjamín Prebase Individual"
export function ageGroupLabel(rule: AgeGroupRule, includeRuleset = false): string {
  if (rule.sport_type === 'rg') {
    const rs = rule.ruleset === 'Group' ? 'Conjuntos' : rule.ruleset
    return `${rule.age_group} ${rule.level} ${rs}`
  }
  const showLevel = rule.level === 'Base' || rule.level === 'Escolar'
  const base = showLevel ? `${rule.age_group} ${rule.level}` : rule.age_group
  return includeRuleset ? `${base} (${rule.ruleset})` : base
}

// Returns the Spanish display label for an RG gymnast type (ruleset value).
export function rgRulesetLabel(ruleset: string): string {
  return ruleset === 'Group' ? 'Conjuntos' : ruleset
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
  provisional_entry_deadline: string | null
  definitive_entry_deadline: string | null
  registration_deadline: string | null // last day clubs can register
  ts_music_deadline: string | null     // after this date clubs cannot upload/modify/delete TS or music
  age_groups: string[]                 // selected age groups for this competition
  poster_url: string | null            // event poster (marketing, home, TV idle)
  logo_url: string | null              // brand mark; printed public results (same storage bucket as poster)
  admin: AdminUser | null              // assigned competition-admin
  created_at: string
  fee_per_team: number | null          // fixed fee per team entry
  fee_per_gymnast: number | null       // fee × gymnast count per category (pair=2, trio=3, group=4)
  judge_missing_fine: number | null    // extra charge if club doesn't provide a judge
  open_combinados_enabled?: boolean
  sport_type: string                   // 'acro' | 'rg'
  tshirt_sizes?: string[]              // sizes available for this competition
  tshirt_deadline?: string | null      // after this date clubs cannot edit their orders
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
  starting_time: string | null           // 'HH:MM' (or 'HH:MM:SS' from DB, normalised on read)
  waiting_time_seconds: number | null    // buffer between performances, in seconds
  warmup_duration_minutes: number | null // how many minutes before competing the team starts warmup
  timeline_order: Array<TimelineEntry> | null
}

export type TimelineEntry =
  | { session_id: string; team_id: string }
  | { type: 'break'; id: string; duration_minutes: number; label?: string }

export type ScoringMethod = 'keyboard' | 'elements'

export type Session = {
  id: string
  competition_id: string
  panel_id: string
  section_id: string
  name: string
  age_group: string
  category: string
  routine_type: 'Balance' | 'Dynamic' | 'Combined' | 'Free' | 'Hoop' | 'Ball' | 'Clubs' | 'Ribbon' | 'Rope'
  status: 'waiting' | 'active' | 'finished'
  order_index: number   // order within the section
  dj_method:  ScoringMethod | null
  ej_method:  ScoringMethod | null
  /** Pool sessions for a single public/TV/CJP ranking (optional). */
  ranking_merge_group_id: string | null
  /** For Open/Combinados bracket advancement sessions only. */
  bracket_phase?: string | null
}

export type RankingMergeGroup = {
  id: string
  label_es: string | null
  label_en: string | null
}

export type Judge = {
  id: string
  full_name: string
  email: string | null    // from profiles.email
  phone: string | null
  licence: string | null
  avatar_url: string | null
  sport_type: string
}

// Club nominates a judge for a specific competition.
export type CompetitionJudgeNomination = {
  id: string
  competition_id: string
  judge_id: string
  club_id: string | null
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
  licencia_url?: string | null  // PDF competition licence
}

export type Coach = {
  id: string
  club_id: string
  full_name: string
  licence: string | null
  photo_url: string | null
  licencia_url?: string | null  // PDF licence (stored as licencia_url for UI consistency)
}

// Links a coach to a competition (registered by the club)
export type CompetitionCoach = {
  id: string
  competition_id: string
  coach_id: string
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

export type Apparatus = {
  id: string
  name: string
  name_es: string | null
  sort_order: number
}

export type ApparatusRule = {
  id: string
  age_group_rule_id: string
  year: number
  apparatus_id: string
  is_mandatory: boolean
  sort_order: number
}

export type Team = {
  id: string
  club_id: string
  gymnast_ids?: string[]    // references to Gymnast.id
  category: string          // Acro: category key | RG: 'Individual' | 'Group'
  age_group: string
  gymnast_display: string   // e.g. "Fernández / Ruiz"
  photo_url: string | null
  /** Set when club removes team from roster; row kept for competition FKs. */
  archived_at?: string | null
  sport_type?: string       // 'acro' | 'rg' (defaults to 'acro')
  apparatus_ids?: string[]  // RG only — from team_apparatus
}

export type RGRegistrationStatus = 'pending' | 'inscription_approved' | 'payment_pending' | 'registered'

export type RGRegistration = {
  id: string
  team_id: string
  competition_id: string
  status: RGRegistrationStatus
  payment_document_url: string | null
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  payment_approved_by: string | null
  payment_approved_at: string | null
  created_at: string
}

export type RoutineMusic = {
  id: string
  team_id: string
  competition_id: string
  routine_type: 'Balance' | 'Dynamic' | 'Combined' | 'Free' | 'Hoop' | 'Ball' | 'Clubs' | 'Ribbon' | 'Rope'
  music_filename: string | null
  ts_filename: string | null   // technical sheet (PDF)
  uploaded_at: string
}

export type CompetitionEntry = {
  id: string
  competition_id: string
  team_id: string
  dorsal: number | null
  dropped_out: boolean
  gymnast_display: string | null
  gymnast_ids: string[] | null
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
  role: 'CJP' | 'EJ' | 'AJ' | 'DJ' | 'RJ' | 'E' | 'A' | 'DA' | 'DB'
  role_number: number
}

export const ROLE_CONFIG = {
  CJP: { min: 1, max: 1 },
  EJ:  { min: 2, max: 5 },
  AJ:  { min: 2, max: 5 },
  DJ:  { min: 1, max: 2 },
} as const

export const RG_ROLE_CONFIG = {
  RJ: { min: 1, max: 1 },
  E:  { min: 1, max: 2 },
  A:  { min: 1, max: 2 },
  DA: { min: 1, max: 1 },
  DB: { min: 1, max: 1 },
} as const

export type Role = keyof typeof ROLE_CONFIG
export type RGRole = keyof typeof RG_ROLE_CONFIG

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

// Categories available for an Acro age group, determined by its level.
export function categoriesForRuleset(level: string): string[] {
  const l = level.toLowerCase()
  if (l === 'escolar' || l === 'base') return ['Pairs', 'Groups 3', 'Groups 4']
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
    'Pairs':       'Pairs',
    'Groups 3':    'Groups 3',
    'Groups 4':    'Groups 4',
    'Individual':  'Individual',
    'Group':       'Group',
  },
  es: {
    "Women's Pair":  'Pareja Femenina',
    "Men's Pair":    'Pareja Masculina',
    "Mixed Pair":    'Pareja Mixta',
    "Women's Group": 'Grupo Femenino',
    "Mixed Group":   'Grupo Mixto',
    'Pairs':       'Parejas',
    'Groups 3':    'Tríos',
    'Groups 4':    'Cuartetos',
    'Individual':  'Individual',
    'Group':       'Grupo',
  },
}

export function categoryLabel(category: string, lang: string): string {
  return CATEGORY_LABELS[lang]?.[category] ?? category
}

// ─── registration sort helpers ────────────────────────────────────────────────

// Category type order: pairs=0, groups3=1, groups4=2
const CATEGORY_TYPE_ORDER: Record<string, number> = {
  "Women's Pair": 0, "Mixed Pair": 0, "Men's Pair": 0, 'Pairs': 0,
  "Women's Group": 1, 'Groups 3': 1,
  "Mixed Group": 2, 'Groups 4': 2,
}

// Within pairs: Women's=0, Mixed=1, Men's=2
const PAIR_ORDER: Record<string, number> = {
  "Women's Pair": 0, 'Pairs': 0,
  "Mixed Pair":   1,
  "Men's Pair":   2,
}

export function sortByAgeGroupAndCategory<T extends { age_group: string; category: string }>(
  items: T[],
  rules: AgeGroupRule[],
): T[] {
  return [...items].sort((a, b) => {
    const ruleA = rules.find(r => r.id === a.age_group)
    const ruleB = rules.find(r => r.id === b.age_group)
    const sortDiff = (ruleB?.sort_order ?? 0) - (ruleA?.sort_order ?? 0)
    if (sortDiff !== 0) return sortDiff
    const typeDiff = (CATEGORY_TYPE_ORDER[a.category] ?? 99) - (CATEGORY_TYPE_ORDER[b.category] ?? 99)
    if (typeDiff !== 0) return typeDiff
    return (PAIR_ORDER[a.category] ?? 99) - (PAIR_ORDER[b.category] ?? 99)
  })
}

export const ROUTINE_TYPES    = ['Balance', 'Dynamic', 'Combined'] as const
export const RG_ROUTINE_TYPES = ['Free', 'Hoop', 'Ball', 'Clubs', 'Ribbon', 'Rope'] as const

export type CompetitionStatus = 'draft' | 'provisional_entry' | 'definitive_entry' | 'registration_open' | 'registration_closed' | 'published' | 'active' | 'finished'

export const NEXT_STATUS: Partial<Record<CompetitionStatus, CompetitionStatus>> = {
  draft:                'provisional_entry',
  provisional_entry:    'definitive_entry',
  definitive_entry:     'registration_open',
  registration_open:    'registration_closed',
  registration_closed:  'published',
  published:            'active',
  active:               'finished',
}

export const PREV_STATUS: Partial<Record<CompetitionStatus, CompetitionStatus>> = {
  provisional_entry:   'draft',
  definitive_entry:    'provisional_entry',
  registration_open:   'definitive_entry',
  registration_closed: 'registration_open',
  published:           'registration_closed',
  active:              'published',
  finished:            'active',
}

// ─── provisional / definitive entry types ────────────────────────────────────

export type ProvisionalEntry = {
  id: string
  club_id: string
  teams_per_category: Record<string, number>
  created_at: string
}

export type DefinitiveEntry = {
  id: string
  club_id: string
  contact_name: string
  contact_phone: string
  contact_email: string
  teams_per_category: Record<string, number>
  judge_name: string | null
  total_amount: number
  status: 'pending' | 'payment_uploaded' | 'approved' | 'rejected'
  payment_document_url: string | null
  admin_notes: string | null
  created_at: string
}

// ─── level grouping helpers ───────────────────────────────────────────────────

export type Level = 'Escolar' | 'Base' | 'Nacional'
export const LEVEL_ORDER: Level[] = ['Escolar', 'Base', 'Nacional']

export function getLevel(ageGroupId: string, rules: AgeGroupRule[]): Level {
  const level = rules.find(r => r.id === ageGroupId)?.level ?? ''
  if (level === 'Escolar') return 'Escolar'
  if (level === 'Base')    return 'Base'
  return 'Nacional'
}
