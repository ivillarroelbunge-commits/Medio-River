import type { SupabaseClient } from "@supabase/supabase-js"
import type { Competition, Match, MatchDetail, MatchPenaltyKick } from "@/lib/data/types"

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
    detail: normalizeMatchDetail(row.id, row.detail) ?? undefined,
  }
}

function normalizeMatchDetail(matchId: string, detail: MatchDetail | null) {
  if (!detail || matchId !== "match-25") return detail

  return {
    ...detail,
    penaltyShootout: detail.penaltyShootout
      ? {
          ...detail.penaltyShootout,
          kicks: detail.penaltyShootout.kicks
            ? {
                river: orderPenaltyKicks(detail.penaltyShootout.kicks.river, riverSanLorenzoPenaltyOrder.river),
                opponent: orderPenaltyKicks(detail.penaltyShootout.kicks.opponent, riverSanLorenzoPenaltyOrder.opponent),
              }
            : detail.penaltyShootout.kicks,
        }
      : detail.penaltyShootout,
    cards: detail.cards.map((card) => (
      card.team === "river" && normalizeName(card.player).includes("anibal moreno") && card.minute === "103"
        ? { ...card, minute: "93" }
        : card
    )),
  }
}

const riverSanLorenzoPenaltyOrder = {
  river: [
    { player: "Juan Fernando Quintero", scored: true },
    { player: "Giuliano Galoppo", scored: false },
    { player: "Maximiliano Salas", scored: true },
    { player: "Kendry Páez", scored: false },
    { player: "Gonzalo Montiel", scored: true },
    { player: "Joaquín Freitas", scored: true },
  ],
  opponent: [
    { player: "Carlos Insaurralde", scored: true },
    { player: "Guzmán Corujo", scored: true },
    { player: "Diego Herazo", scored: true },
    { player: "Gregorio Rodríguez", scored: false },
    { player: "Ignacio Perruzzi", scored: false },
    { player: "Mathías De Ritis", scored: false },
  ],
} satisfies Record<"river" | "opponent", MatchPenaltyKick[]>

function orderPenaltyKicks(kicks: MatchPenaltyKick[], order: MatchPenaltyKick[]) {
  return order.map((expectedKick) => {
    const matchingKick = kicks.find((kick) => areSamePlayer(kick.player, expectedKick.player))
    return {
      ...expectedKick,
      ...matchingKick,
      player: expectedKick.player,
      scored: matchingKick?.scored ?? expectedKick.scored,
    }
  })
}

function areSamePlayer(value: string, expected: string) {
  const normalizedValue = normalizeName(value)
  const normalizedExpected = normalizeName(expected)
  const expectedLastName = normalizedExpected.split(" ").at(-1) ?? normalizedExpected

  return normalizedValue === normalizedExpected || normalizedValue.includes(expectedLastName)
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
