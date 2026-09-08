import type { SupabaseClient } from "@supabase/supabase-js"

const STORAGE_KEY = "medio-river-trivia-participant-v1"

export interface TriviaParticipant {
  id: string
  deviceId: string
  name: string | null
  email: string | null
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
  if (typeof raw.id !== "string" || typeof raw.deviceId !== "string") return null

  return {
    id: raw.id,
    deviceId: raw.deviceId,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : null,
    email: typeof raw.email === "string" && raw.email.trim() ? raw.email.trim().toLowerCase() : null,
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

export function createTriviaParticipant(): TriviaParticipant {
  return {
    id: crypto.randomUUID(),
    deviceId: crypto.randomUUID(),
    name: null,
    email: null,
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

export async function resolveTriviaParticipant(supabase: SupabaseClient, participant: TriviaParticipant) {
  const { data, error } = await supabase.rpc("resolve_trivia_player", {
    p_player_id: participant.id,
    p_device_id: participant.deviceId,
  })

  if (error) return { ok: false as const, error: error.message }
  const row = Array.isArray(data) ? data[0] : null
  if (!row) return { ok: true as const, participant: null }

  return {
    ok: true as const,
    participant: {
      ...participant,
      id: String(row.player_id),
      deviceId: String(row.device_id),
      name: String(row.nickname),
    } satisfies TriviaParticipant,
  }
}

export async function syncTriviaParticipantWithAccount(supabase: SupabaseClient, participant: TriviaParticipant | null) {
  const { data, error } = await supabase.rpc("sync_trivia_player", {
    p_player_id: participant?.id ?? null,
    p_device_id: participant?.deviceId ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  const row = Array.isArray(data) ? data[0] : null
  if (!row) return { ok: true as const, participant }

  const synced: TriviaParticipant = {
    id: String(row.player_id),
    deviceId: String(row.device_id),
    name: String(row.nickname),
    email: participant?.email ?? null,
    playedKeys: participant?.playedKeys ?? [],
  }
  saveTriviaParticipant(synced)
  return { ok: true as const, participant: synced }
}

export async function registerTriviaNickname(
  supabase: SupabaseClient,
  participant: TriviaParticipant,
  nickname: string,
) {
  const normalizedNickname = nickname.trim()
  if (normalizedNickname.length < 2 || normalizedNickname.length > 30) {
    return { ok: false as const, invalidNickname: true as const, error: "El nickname debe tener entre 2 y 30 caracteres." }
  }

  const resolved = await resolveTriviaParticipant(supabase, participant)
  if (!resolved.ok) return resolved
  if (resolved.participant) {
    saveTriviaParticipant(resolved.participant)
    return { ok: true as const, participant: resolved.participant }
  }

  const { error } = await supabase.from("trivia_participants").insert({
    id: participant.id,
    device_id: participant.deviceId,
    display_name: normalizedNickname,
    email: participant.email,
  })

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, nicknameTaken: true as const, error: "Ese nickname ya está ocupado. Probá con otro." }
    }
    return { ok: false as const, error: error.message }
  }

  const next = { ...participant, name: normalizedNickname }
  saveTriviaParticipant(next)
  return { ok: true as const, participant: next }
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
  if (!participant.name) {
    return { ok: false as const, missingNickname: true as const, error: "Elegí un nickname antes de guardar el resultado." }
  }

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
      return { ok: false as const, invalidDevice: true as const, error: "No pudimos validar este jugador en este dispositivo." }
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
