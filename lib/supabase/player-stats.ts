import type { SupabaseClient } from "@supabase/supabase-js"
import type { PlayerSeasonStats } from "@/lib/data/types"

export const PLAYER_SEASON_STATS_SELECT = "player_id, source_id, updated_at, competitions"
const DERIVED_PLAYER_STATS_VIEW = "player_derived_season_stats"

export interface PlayerSeasonStatsRow {
  player_id: string
  source_id: number
  updated_at: string
  competitions: PlayerSeasonStats["competitions"]
}

export function mapPlayerStatsRowToSeasonStats(row: PlayerSeasonStatsRow): PlayerSeasonStats {
  return {
    sourceId: row.source_id,
    updatedAt: row.updated_at,
    competitions: row.competitions ?? {},
  }
}

export function mapPlayerSeasonStatsToPayload(
  playerId: string,
  stats: PlayerSeasonStats,
  userId?: string | null,
) {
  return {
    player_id: playerId,
    source_id: stats.sourceId,
    updated_at: stats.updatedAt,
    competitions: stats.competitions,
    updated_by: userId ?? null,
  }
}

function rowsToStats(rows: PlayerSeasonStatsRow[] | null) {
  if (!rows) return undefined

  return Object.fromEntries(
    rows.map((row) => [row.player_id, mapPlayerStatsRowToSeasonStats(row)]),
  )
}

export async function fetchPlayerSeasonStats(supabase: SupabaseClient) {
  const derived = await supabase
    .from(DERIVED_PLAYER_STATS_VIEW)
    .select(PLAYER_SEASON_STATS_SELECT)
    .order("player_id", { ascending: true })

  if (!derived.error && derived.data) {
    return {
      playerSeasonStats: rowsToStats(derived.data as PlayerSeasonStatsRow[]),
      error: null,
    }
  }

  // Keep the historical snapshot only as a resilience fallback. The player
  // profile ignores its legacy FotMob ratings because those rows do not carry
  // ratingMatches; public ratings come exclusively from Medio River votes.
  const fallback = await supabase
    .from("player_season_stats")
    .select(PLAYER_SEASON_STATS_SELECT)
    .order("player_id", { ascending: true })

  return {
    playerSeasonStats: rowsToStats(fallback.data as PlayerSeasonStatsRow[] | null),
    error: fallback.error,
  }
}

export async function upsertPlayerSeasonStats(
  supabase: SupabaseClient,
  stats: Record<string, PlayerSeasonStats>,
  userId?: string | null,
) {
  const payload = Object.entries(stats).map(([playerId, playerStats]) => (
    mapPlayerSeasonStatsToPayload(playerId, playerStats, userId)
  ))

  return supabase
    .from("player_season_stats")
    .upsert(payload, { onConflict: "player_id" })
    .select(PLAYER_SEASON_STATS_SELECT)
}

export function getPlayerSeasonStatsTableMissingMessage(message?: string) {
  if (message?.toLowerCase().includes("relation") && message?.toLowerCase().includes("does not exist")) {
    return "Falta aplicar la migración de estadísticas de jugadores en Supabase."
  }

  return message
}
