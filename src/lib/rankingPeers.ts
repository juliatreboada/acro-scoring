import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/** Session fields needed to resolve which sessions share one combined leaderboard. */
export type RankingAnchorSession = Pick<
  Database['public']['Tables']['sessions']['Row'],
  'competition_id' | 'age_group' | 'category' | 'routine_type' | 'ranking_merge_group_id'
>

/**
 * Session IDs whose approved/provisional routine_results should be pooled for ranking
 * (TV, public results, CJP leaderboard).
 *
 * - If `ranking_merge_group_id` is set: all sessions in that group with the same
 *   competition, age_group, and routine_type.
 * - Otherwise: same as historic behavior — same age_group, category, routine_type.
 */
export async function fetchPeerSessionIdsForRanking(
  supabase: SupabaseClient<Database>,
  session: RankingAnchorSession,
): Promise<string[]> {
  if (session.ranking_merge_group_id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('id')
      .eq('competition_id', session.competition_id)
      .eq('ranking_merge_group_id', session.ranking_merge_group_id)
      .eq('age_group', session.age_group)
      .eq('routine_type', session.routine_type)

    if (error) throw error
    return (data ?? []).map((r) => r.id)
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('id')
    .eq('competition_id', session.competition_id)
    .eq('age_group', session.age_group)
    .eq('category', session.category)
    .eq('routine_type', session.routine_type)

  if (error) throw error
  return (data ?? []).map((r) => r.id)
}
