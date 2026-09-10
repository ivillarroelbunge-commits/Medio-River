import type { SupabaseClient } from "@supabase/supabase-js"
import { getCanonicalTeamName } from "@/lib/data/teams"
import type { Competition, Match, MatchDetail, MatchLineup, MatchPenaltyKick } from "@/lib/data/types"

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

type StoredMatchLineup = MatchLineup & {
  numbers?: Record<string, number>
}

export function mapMatchRowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    date: row.date,
    opponent: getCanonicalTeamName(row.opponent),
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
  if (!detail) return detail

  const detailWithNumbers = {
    ...detail,
    lineups: {
      river: addJerseyNumbers(detail.lineups.river as StoredMatchLineup),
      opponent: addJerseyNumbers(detail.lineups.opponent as StoredMatchLineup),
    },
  }

  if (matchId !== "match-25") return detailWithNumbers

  return {
    ...detailWithNumbers,
    penaltyShootout: detailWithNumbers.penaltyShootout
      ? {
          ...detailWithNumbers.penaltyShootout,
          kicks: detailWithNumbers.penaltyShootout.kicks
            ? {
                river: orderPenaltyKicks(detailWithNumbers.penaltyShootout.kicks.river, riverSanLorenzoPenaltyOrder.river),
                opponent: orderPenaltyKicks(detailWithNumbers.penaltyShootout.kicks.opponent, riverSanLorenzoPenaltyOrder.opponent),
              }
            : detailWithNumbers.penaltyShootout.kicks,
        }
      : detailWithNumbers.penaltyShootout,
    cards: detailWithNumbers.cards.map((card) => (
      card.team === "river" && normalizeName(card.player).includes("anibal moreno") && card.minute === "103"
        ? { ...card, minute: "93" }
        : card
    )),
  }
}

function addJerseyNumbers(lineup: StoredMatchLineup): MatchLineup {
  const numberByNormalizedName = new Map<string, number>()
  for (const [name, number] of Object.entries(lineup.numbers ?? {})) {
    if (isValidJerseyNumber(number)) {
      numberByNormalizedName.set(normalizeLineupName(name), Math.trunc(number))
    }
  }

  const withNumber = (player: string) => {
    if (/^#\d+\s+/.test(player)) return player

    const exact = lineup.numbers?.[player]
    const number = isValidJerseyNumber(exact)
      ? Math.trunc(exact)
      : numberByNormalizedName.get(normalizeLineupName(player))

    return number ? `#${number} ${player}` : player
  }

  return {
    coach: lineup.coach,
    starters: lineup.starters.map(withNumber),
    substitutes: lineup.substitutes.map(withNumber),
  }
}

function isValidJerseyNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}

function normalizeLineupName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^#\d+\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
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
    opponent: getCanonicalTeamName(match.opponent),
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

export async function fetchUpcomingMatches(supabase: SupabaseClient, now = new Date()) {
  const { data, error } = await supabase
    .from("matches")
    .select(MATCHES_SELECT)
    .eq("status", "upcoming")
    .gte("date", now.toISOString())
    .order("date", { ascending: true })

  return {
    matches: data?.map((row) => mapMatchRowToMatch(row as MatchRow)) ?? [],
    error,
  }
}

export async function fetchNextUpcomingMatch(supabase: SupabaseClient, now = new Date()) {
  const { data, error } = await supabase
    .from("matches")
    .select(MATCHES_SELECT)
    .eq("status", "upcoming")
    .gte("date", now.toISOString())
    .order("date", { ascending: true })
    .limit(1)

  return {
    match: data?.[0] ? mapMatchRowToMatch(data[0] as MatchRow) : null,
    error,
  }
}

export function getMatchTableMissingMessage(message?: string) {
  if (message?.toLowerCase().includes("relation") && message?.toLowerCase().includes("does not exist")) {
    return "Falta aplicar la migración de partidos en Supabase."
  }

  return message
}
