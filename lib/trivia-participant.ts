import type { SupabaseClient } from "@supabase/supabase-js"

const STORAGE_KEY = "medio-river-trivia-participant-v1"

export interface TriviaParticipant {
  id: string
  deviceId: string
  name: string
  email: string
  playedKeys: string[]
}

export interface PublicTriviaResult {
  id: string
  rankingId: string
  participantName: string
  dailyKey: string
  score: number
  totalQuestions: number
  playedAt: string
}

function normalizeParticipant(value: unknown): TriviaParticipant | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  if (
    typeof raw.id !== "string" ||
    typeof raw.deviceId !== "string" ||
    typeof raw.name !== "string" ||
    typeof raw.email !== "string"
  ) {
    return null
  }

  return {
    id: raw.id,
    deviceId: raw.deviceId,
    name: raw.name,
    email: raw.email,
    playedKeys: Array.isArray(raw.playedKeys) ? raw.playedKeys.filter((item): item is string => typeof item === "string") : [],
  }
}

export function readTriviaParticipant(): TriviaParticipant | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeParticipant(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveTriviaParticipant(participant: TriviaParticipant) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(participant))
}

export function clearTriviaParticipant() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function createTriviaParticipant(name: string, email: string): TriviaParticipant {
  return {
    id: crypto.randomUUID(),
    deviceId: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    playedKeys: [],
  }
}

export function markTriviaParticipantPlayed(participant: TriviaParticipant, dailyKey: string) {
  const next = {
    ...participant,
    playedKeys: Array.from(new Set([...participant.playedKeys, dailyKey])),
  }
  saveTriviaParticipant(next)
  return next
}

export async function ensureTriviaParticipant(supabase: SupabaseClient, participant: TriviaParticipant) {
  const { error } = await supabase.from("trivia_participants").insert({
    id: participant.id,
    device_id: participant.deviceId,
    display_name: participant.name,
    email: participant.email,
  })

  if (!error || error.code === "23505") return { ok: true as const }
  return { ok: false as const, error: error.message }
}

export async function fetchPublicTriviaResults(supabase: SupabaseClient): Promise<PublicTriviaResult[]> {
  const { data, error } = await supabase
    .from("trivia_results")
    .select("id, ranking_id, participant_name, daily_key, score, total_questions, played_at")
    .order("played_at", { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: String(row.id),
    rankingId: String(row.ranking_id),
    participantName: String(row.participant_name || "Usuario"),
    dailyKey: String(row.daily_key),
    score: Number(row.score),
    totalQuestions: Number(row.total_questions),
    playedAt: String(row.played_at),
  }))
}

export async function submitDeviceTriviaResult(
  supabase: SupabaseClient,
  participant: TriviaParticipant,
  score: number,
  totalQuestions: number,
  dailyKey: string,
) {
  const { data, error } = await supabase
    .from("trivia_results")
    .insert({
      user_id: null,
      participant_id: participant.id,
      device_id: participant.deviceId,
      daily_key: dailyKey,
      score,
      total_questions: totalQuestions,
      participant_name: participant.name,
      ranking_id: participant.id,
    })
    .select("id, ranking_id, participant_name, daily_key, score, total_questions, played_at")
    .single()

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, alreadyPlayed: true as const, error: "Ya jugaste la trivia de esta semana." }
    }
    if (error.code === "23514") {
      return { ok: false as const, invalidDevice: true as const, error: "No pudimos validar este dispositivo. Volvé a ingresar tus datos." }
    }
    return { ok: false as const, error: error.message }
  }

  return {
    ok: true as const,
    result: {
      id: String(data.id),
      rankingId: String(data.ranking_id),
      participantName: String(data.participant_name || participant.name),
      dailyKey: String(data.daily_key),
      score: Number(data.score),
      totalQuestions: Number(data.total_questions),
      playedAt: String(data.played_at),
    } satisfies PublicTriviaResult,
  }
}
