import type { SupabaseClient } from "@supabase/supabase-js"
import type { Competition, Match, MatchDetail } from "@/lib/data/types"

export const MATCHES_SELECT = "id, date, opponent, competition, status, is_home, stadium, tv_channel, river_score, opponent_score, referee, detail"

export interface MatchRow {
  id: string
  date: string
  opponent: string
  competition: Competition
  status: Match["status"]
  is_home: boolean
  stadium: string
  tv_channel: string | null
  river_score: number | null
  opponent_score: number | null
  referee: string | null
  detail: MatchDetail | null
}

export function mapMatchRowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    date: row.date,
    opponent: row.opponent,
    competition: row.competition,
    status: row.status,
    isHome: row.is_home,
    stadium: row.stadium,
    tvChannel: row.tv_channel ?? undefined,
    riverScore: row.river_score ?? undefined,
    opponentScore: row.opponent_score ?? undefined,
    referee: row.referee ?? undefined,
    detail: row.detail ?? undefined,
  }
}

export function mapMatchToPayload(match: Match, userId?: string | null) {
  return {
    id: match.id,
    date: match.date,
    opponent: match.opponent,
    competition: match.competition,
    status: match.status,
    is_home: match.isHome,
    stadium: match.stadium,
    tv_channel: match.tvChannel ?? null,
    river_score: match.status === "played" ? match.riverScore ?? 0 : null,
    opponent_score: match.status === "played" ? match.opponentScore ?? 0 : null,
    referee: match.referee ?? match.detail?.referee ?? null,
    detail: match.detail ?? null,
    updated_by: userId ?? null,
  }
}

export async function fetchMatches(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("matches")
    .select(MATCHES_SELECT)
    .order("date", { ascending: true })

  return {
    matches: data?.map((row) => mapMatchRowToMatch(row as MatchRow)),
    error,
  }
}

export function getMatchTableMissingMessage(message?: string) {
  if (message?.toLowerCase().includes("relation") && message?.toLowerCase().includes("does not exist")) {
    return "Falta aplicar la migración de partidos en Supabase."
  }

  return message
}
