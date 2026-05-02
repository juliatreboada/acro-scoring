Here's the **updated `.md` file** reflecting everything we've done and any changes in logic or naming:

```markdown
# Rhythmic Gymnastics (RG) Expansion — Technical Analysis & Implementation Plan

## Overview

Add Rhythmic Gymnastics as a second sport type alongside existing Acrobatic Gymnastics (Acro). Competitions are either Acro or RG (not mixed). Each sport type has different:
- Age groups & categories
- Team size rules
- Scoring roles (judges) and formulas
- Registration flow (no provisional/definitive for RG, only nominal)
- Apparatus (replaces Acro's routines)

## Current Acro Model (for reference)

| Concept | Implementation |
|---------|----------------|
| Age groups | `age_group_rules` table with `age_group` (text like "Alevin Escolar", "Senior Base"), `min_age`, `max_age`, `ruleset` (e.g., "Senior (FIG)", "Senior (RFEG)"), `routine_count` |
| Level inference | Level (Escolar/Base/Nacional) is parsed from the `age_group` text (string contains "escolar", "base", or neither) |
| Categories | Hardcoded in `CATEGORY_SIZE` + `categoriesForRuleset()` function |
| Routines | Balance/Dynamic/Combined with music + TS files |
| Team size | Derived from category via `CATEGORY_SIZE` |
| Scoring roles | CJP, EJ, AJ, DJ |
| Scoring formula | `final = (E×2) + A + DIF - DIF_penalty - CJP_penalty` |
| Registration | Provisional → Definitive → Nominal |

## RG Requirements

| Concept | RG Implementation |
|---------|-------------------|
| Age groups | Same `age_group_rules` table with `sport_type='rg'`. Uses `ruleset` column to store 'Individual' or 'Group' |
| Categories | Individual, Groups (Equipos, Conjuntos). To be database-driven |
| Apparatus | Replaces routines. Values: Free, Hoop, Ball, Clubs, Ribbon, Rope. Per age-group + year |
| Team size | Individual = 1, Groups = 2-6 depending on level |
| Scoring roles | RJ (replaces CJP), E, A, DA, DB |
| Scoring formula | `final = A + E + DA + DB - RJ_penalty` |
| Registration | Only nominal (no provisional/definitive). Requires admin approval |
| Music | Per apparatus (uploaded at competition registration) |

## What Has Been Completed (Track 0)

### Database Migrations Executed

| Migration | Status |
|-----------|--------|
| Add `sport_type` column to `age_group_rules` | ✅ Done |
| Add `sport_type` column to `competitions` | ✅ Done |
| Add `sport_type` column to `teams` | ✅ Done |
| Create `apparatus` table with seed data | ✅ Done |
| Create `apparatus_rules` table | ✅ Done |
| Extend `routine_type` enum with RG values | ✅ Done |

### RG Age Groups Inserted

All RG age groups have been inserted into `age_group_rules` with:

- `sport_type = 'rg'`
- `routine_count = 0` (apparatus replaces routines)
- `ruleset` = 'Individual' or 'Group'
- Sort order ranges:

| Level | Individual | Group |
|-------|-----------|-------|
| Escolar | 30-36 | 40-46 |
| Promoción | 50-56 | 60-66 |
| Prebase | 70-75 | 80-85 |
| Base | 90-100 | 110-115 |
| Copa Base | 100-105 | 120-125 |
| Federado Style | 130-138 | — |
| Equipos | — | 140-145 |
| Conjuntos | — | 150-158 |

### Apparatus Rules Inserted

Apparatus rules for **2026 and 2027** have been inserted for all age groups, including:
- Escolar (Individual & Group)
- Promoción (Individual & Group)
- Prebase (Individual & Group)
- Base (Individual & Group)
- Copa Base (Individual & Group)
- Federado Style (Individual)
- Máster (Choice — all apparatus optional)
- Equipos (Group)
- Conjuntos (Group)

### Remaining for Track 0

| Task | Status |
|------|--------|
| Update `database.types.ts` with new tables and enums | ⬜ Pending |

---

## Updated High-Level Implementation Tracks

### Track 0 — Database Schema Extensions ✅ **NEARLY DONE**

**Completed:**
- `sport_type` columns added
- `apparatus` table created
- `apparatus_rules` table created
- `routine_type` enum extended
- RG age groups inserted (all levels)
- Apparatus rules inserted (2026 + 2027)

**Remaining:**
- Update `database.types.ts`

### Track 1 — Age Groups & Categories (Admin Side)

**Changes needed:**
- Make categories database-driven (move from hardcoded `CATEGORY_SIZE`)
- Update admin UI to manage RG categories
- Update level inference function to recognize RG levels: Escolar, Promoción, Prebase, Base, Federado, Copa Base, Equipos, Conjuntos

**Note:** RG uses `ruleset` column to store 'Individual' or 'Group', not the level. Level is still parsed from `age_group` text.

### Track 2 — Team Management (Club Side)

**Changes needed:**
- Team creation: add `sport_type` selector (Acro/RG)
- For RG teams: age groups filtered by `sport_type='rg'` and `ruleset` ('Individual' or 'Group')
- Team size: Individual = 1 gymnast, Groups = 2-6 gymnasts (depending on age-group)
- Apparatus automatically determined by age-group + current year (from `apparatus_rules`)

### Track 3 — Apparatus & Registration (Club Side)

**Changes needed:**
- Replace `RoutineRow` with `ApparatusRow` for RG competitions
- At registration: show required apparatus based on `apparatus_rules` for that age-group + year
- Club uploads music per apparatus
- Registration requires admin approval (uses `definitive_entry` flow)
- No provisional/definitive distinction for RG

### Track 4 — Judge Roles & Scoring (Judge Side)

**Changes needed:**
- Add RG roles to `judge_role` enum: 'RJ', 'E', 'A', 'DA', 'DB' (keep Acro roles)
- Create `scoringRulesRG.ts` with RG penalty categories
- New judge components:
  - `EKeyboard.tsx` — submits value, stores as `10 - submitted`
  - `AKeyboard.tsx` — same as E (special screen later)
  - `DA_DB_Keyboard.tsx` — decimal input (0.0-10.0)
  - `RJPenaltyGrid.tsx` — replaces CJP grid
- Update `useJudgeSession` to detect `competition.sport_type`

### Track 5 — Admin Competition Config (Admin Side)

**Changes needed:**
- Competition creation: add `sport_type` selector (Acro/RG)
- Structure tab: for RG, show `apparatus_rules` editor (per age-group + year)
- Judges tab: show RG roles (RJ, E, A, DA, DB)
- Registrations tab: for RG, hide provisional/definitive tabs (only nominal with admin approval)
- Overview tab: show `sport_type` badge

### Track 6 — TV & Results Display

**Changes needed:**
- Detect `competition.sport_type` and format scores accordingly
- For RG: display RJ penalty details instead of CJP

---

## Updated Implementation Order

| Order | Track | Status |
|-------|-------|--------|
| 1 | Track 0 | 🔄 90% complete (database.types.ts remaining) |
| 2 | Track 1 | ⬜ Not started |
| 3 | Track 5 (partial) | ⬜ Not started |
| 4 | Track 2 | ⬜ Not started |
| 5 | Track 3 | ⬜ Not started |
| 6 | Track 4 | ⬜ Not started |
| 7 | Track 6 | ⬜ Not started |
| 8 | Track 5 (remaining) | ⬜ Not started |

---

## Important Naming Conventions (RG)

| Concept | Naming | Example |
|---------|--------|---------|
| Sport type | `'rg'` | `sport_type = 'rg'` |
| Apparatus | English names | 'Free', 'Hoop', 'Ball', 'Clubs', 'Ribbon', 'Rope' |
| Apparatus (Spanish) | Spanish names | 'Manos Libres', 'Aro', 'Pelota', 'Mazas', 'Cinta', 'Cuerda' |
| Ruleset | 'Individual' or 'Group' | `ruleset = 'Individual'` |
| Age group format | `{name} {level}` | 'Prebenjamín Escolar', 'Alevín Promoción' |
| Level keywords | Escolar, Promoción, Prebase, Base, Copa Base, Equipos, Conjuntos | Parsed from text |

---

## Updated Code Patterns

### Determining Apparatus for a Team

```typescript
// For a given team (age_group + current year + sport_type = 'rg')
// Query apparatus_rules:
// SELECT apparatus_id FROM apparatus_rules 
// WHERE age_group_rule_id = team.age_group_rule_id 
// AND year = currentYear
// ORDER BY sort_order
```

### Registration Flow for RG

```typescript
// 1. Club sees competition with sport_type = 'rg'
// 2. Eligible teams filtered by age_group + ruleset (Individual/Group)
// 3. Click Register → shows apparatus list from apparatus_rules
// 4. Upload music per apparatus
// 5. Submit → creates definitive_entry with status 'pending'
// 6. Admin approves → team is registered
```

### Judge Role Mapping

| Acro Role | RG Role | Scoring Behavior |
|-----------|---------|------------------|
| CJP | RJ | Penalty grid, final approval |
| EJ | E | Keyboard → 10 - value |
| AJ | A | Keyboard → direct value |
| DJ | DA + DB | Keyboard → difficulty value |

---

## Files Created/Modified in Track 0

### Migration Files (to be saved)
- `supabase/migrations/YYYYMMDD_HHMMSS_add_sport_type.sql`
- `supabase/migrations/YYYYMMDD_HHMMSS_create_apparatus_tables.sql`
- `supabase/migrations/YYYYMMDD_HHMMSS_extend_routine_type_enum.sql`
- `supabase/migrations/YYYYMMDD_HHMMSS_insert_rg_age_groups.sql`
- `supabase/migrations/YYYYMMDD_HHMMSS_insert_apparatus_rules_2026.sql`
- `supabase/migrations/YYYYMMDD_HHMMSS_insert_apparatus_rules_2027.sql`

### Files Pending Update
- `src/lib/database.types.ts` — add `sport_type`, `apparatus`, `apparatus_rules`, update `routine_type`

---

## Next Action

1. Update `database.types.ts` with all new schema types
2. Run `npm run build` to verify no TypeScript errors
3. **Track 0 complete** ✅
4. Begin Track 1

---

Save this as `docs/rg-expansion-plan.md` to keep track of progress.
```

This updated `.md` reflects:
- ✅ All completed Track 0 work
- ✅ Confirmed naming conventions (ruleset = 'Individual'/'Group')
- ✅ Apparatus list (Free, Hoop, Ball, Clubs, Ribbon, Rope)
- ✅ Age group levels (Escolar, Promoción, Prebase, Base, Copa Base, Equipos, Conjuntos)
- ✅ Registration flow (admin approval required)
- ✅ Judge role mapping
- ✅ What remains to be done