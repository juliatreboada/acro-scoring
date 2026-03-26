---
name: Schema Redesign — entities extend profiles
description: Major schema change completed: every entity (judge, club, admin) now extends profiles with id = auth.users.id
type: project
---

Every entity extends profiles: `entity.id = profiles.id = auth.users.id`. No entity can exist without a user account.

**Why:** The old schema had disconnected IDs (judges had their own UUID + a separate user_id FK). This broke the auth chain and meant entities could exist without users.

**How to apply:** When writing queries, `auth.uid()` IS the judge/club/admin ID directly. No `user_id` lookup needed.

## Role enum (user_role)
- `super_admin` — full system access (was `admin`)
- `admin` — competition admin: manages assigned competitions (was `comp_admin`)
- `judge` — submits scores in assigned sessions (unchanged)
- `club` — manages gymnasts, teams, registrations (was `club_member`)

## Tables
- `profiles(id, email, role)` — one row per auth user, no display_name, no club_id
- `admins(id → profiles, full_name, club_name?, phone, avatar_url)` — NEW
- `judges(id → profiles, full_name, licence?, phone, avatar_url)` — was standalone with user_id
- `clubs(id → profiles, club_name, contact_name?, phone, avatar_url)` — was standalone

## handle_new_user trigger
On invite, creates profile + entity row from metadata:
- judge invite: metadata = { role, full_name, licence?, phone? }
- club invite: metadata = { role, club_name, contact_name?, phone? }
- admin invite: metadata = { role, full_name, club_name?, phone? }

## Migration
`supabase/migrations/20260325000005_redesign_schema.sql`
