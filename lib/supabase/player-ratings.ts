import type { SupabaseClient } from "@supabase/supabase-js"

const PLAYER_RATING_SUMMARY_CACHE_PREFIX = "medio-river-player-rating-summary-v3"
const LEGACY_PLAYER_RATING_SUMMARY_CACHE_PREFIXES = [
  "medio-river-player-rating-summary-v1",
  "medio-river-player-rating-summary-v2",
]
const PLAYER_RATING_SUMMARY_CACHE_TTL_MS = 6 * 60 * 60 * 1000

export interface MatchRatingPlayer {
  id: string
  squadPlayerId: string | null
  name: string
  shirtNumber: number | null
  position: string | null
  image: string | null
  starter: boolean
  enteredMinute: string | null
  displayOrder: number
  averageRating: number | null
  ratingCount: number
  myRating: number | null
}

export interface MatchRatingBallot {
  match: {
    id: string
    date: string
    opponent: string
    competition: string
    riverScore: number
    opponentScore: number
  }
  players: MatchRatingPlayer[]
}

export interface PlayerRatingSummary {
  seasonYear: number
  squadPlayerId: string | null
  playerName: string
  image: string | null
  matchesRated: number
  averageRating: number
}

export interface PlayerRatingHistoryRow {
  seasonYear: number
  matchId: string
  matchDate: string
  opponent: string
  competition: string
  riverScore: number
  opponentScore: number
  squadPlayerId: string | null
  playerName: string
  image: string | null
  rating: number
}

interface CachedPlayerRatingSummary {
  summary: PlayerRatingSummary[]
  history: PlayerRatingHistoryRow[]
  updatedAt: number
}

function getPlayerRatingSummaryCacheKey(userId: string) {
  return `${PLAYER_RATING_SUMMARY_CACHE_PREFIX}:${userId}`
}

function clearLegacyPlayerRatingSummaryCaches() {
  if (typeof window === "undefined") return

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index)
      if (!key) continue

      const isLegacyRatingCache = LEGACY_PLAYER_RATING_SUMMARY_CACHE_PREFIXES.some((prefix) =>
        key.startsWith(`${prefix}:`),
      )

      if (isLegacyRatingCache) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    // El perfil sigue funcionando aunque el navegador no permita limpiar localStorage.
  }
}

export function readPlayerRatingSummaryCache(userId: string) {
  if (typeof window === "undefined") return null

  clearLegacyPlayerRatingSummaryCaches()

  try {
    const raw = window.localStorage.getItem(getPlayerRatingSummaryCacheKey(userId))
    if (!raw) return null

    const cached = JSON.parse(raw) as CachedPlayerRatingSummary
    if (!Array.isArray(cached.summary) || !Array.isArray(cached.history) || typeof cached.updatedAt !== "number") return null

    return {
      summary: cached.summary,
      history: cached.history,
      isFresh: Date.now() - cached.updatedAt < PLAYER_RATING_SUMMARY_CACHE_TTL_MS,
    }
  } catch {
    return null
  }
}

export function writePlayerRatingSummaryCache(
  userId: string,
  summary: PlayerRatingSummary[],
  history: PlayerRatingHistoryRow[],
) {
  if (typeof window === "undefined") return

  clearLegacyPlayerRatingSummaryCaches()

  try {
    const cached: CachedPlayerRatingSummary = {
      summary,
      history,
      updatedAt: Date.now(),
    }
    window.localStorage.setItem(getPlayerRatingSummaryCacheKey(userId), JSON.stringify(cached))
  } catch {
    // El perfil sigue funcionando aunque el navegador no permita persistir localStorage.
  }
}

export function markPlayerRatingSummaryCacheStale() {
  if (typeof window === "undefined") return

  clearLegacyPlayerRatingSummaryCaches()

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index)
      if (!key?.startsWith(`${PLAYER_RATING_SUMMARY_CACHE_PREFIX}:`)) continue

      const raw = window.localStorage.getItem(key)
      if (!raw) continue

      const cached = JSON.parse(raw) as CachedPlayerRatingSummary
      if (!Array.isArray(cached.summary) || !Array.isArray(cached.history)) continue

      window.localStorage.setItem(key, JSON.stringify({ ...cached, updatedAt: 0 }))
    }
  } catch {
    // Si no se puede invalidar el caché, el TTL igual fuerza una actualización posterior.
  }
}

async function invokePlayerRatings<T>(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke("player-ratings", { body })

  if (error) return { data: null, error: error.message }
  if (!data?.ok) return { data: null, error: data?.error ?? "No se pudo procesar la solicitud." }

  return { data: data as T, error: null }
}

export async function fetchMatchRatingBallot(
  supabase: SupabaseClient,
  matchId: string,
  deviceId: string,
) {
  const result = await invokePlayerRatings<{ ok: true; ballot: MatchRatingBallot }>(supabase, {
    action: "ballot",
    matchId,
    deviceId,
  })

  return {
    ballot: result.data?.ballot ?? null,
    error: result.error,
  }
}

export async function submitMatchPlayerRatings(
  supabase: SupabaseClient,
  matchId: string,
  deviceId: string,
  ratings: Record<string, number>,
) {
  const result = await invokePlayerRatings<{ ok: true; ballot: MatchRatingBallot }>(supabase, {
    action: "submit",
    matchId,
    deviceId,
    ratings,
  })

  if (!result.error && result.data?.ballot) {
    markPlayerRatingSummaryCacheStale()
  }

  return {
    ballot: result.data?.ballot ?? null,
    error: result.error,
  }
}

export async function fetchMyPlayerRatingSummary(
  supabase: SupabaseClient,
  deviceId: string,
) {
  const result = await invokePlayerRatings<{
    ok: true
    summary: PlayerRatingSummary[]
    history: PlayerRatingHistoryRow[]
  }>(supabase, {
    action: "profile_summary",
    deviceId,
  })

  return {
    summary: result.data?.summary ?? null,
    history: result.data?.history ?? null,
    error: result.error,
  }
}
