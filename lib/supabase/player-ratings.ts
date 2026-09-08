import type { SupabaseClient } from "@supabase/supabase-js"

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

  return {
    ballot: result.data?.ballot ?? null,
    error: result.error,
  }
}

export async function fetchMyPlayerRatingSummary(
  supabase: SupabaseClient,
  deviceId: string,
) {
  const result = await invokePlayerRatings<{ ok: true; summary: PlayerRatingSummary[] }>(supabase, {
    action: "profile_summary",
    deviceId,
  })

  return {
    summary: result.data?.summary ?? null,
    error: result.error,
  }
}
