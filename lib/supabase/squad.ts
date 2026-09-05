import type { SupabaseClient } from "@supabase/supabase-js"
import type { SquadPlayer } from "@/lib/data/types"

export const SQUAD_PLAYERS_SELECT = [
  "id",
  "name",
  "shirt_number",
  "line",
  "position",
  "birth_date",
  "nationality",
  "preferred_foot",
  "from_academy",
  "fotmob_id",
  "image_url",
  "active",
  "display_order",
  "verified_at",
].join(", ")

export interface SquadPlayerRow {
  id: string
  name: string
  shirt_number: number | null
  line: SquadPlayer["line"]
  position: string
  birth_date: string | null
  nationality: string
  preferred_foot: string | null
  from_academy: boolean
  fotmob_id: number | null
  image_url: string | null
  active: boolean
  display_order: number
  verified_at: string
}

function calculateAge(birthDate: string | null) {
  if (!birthDate) return 0

  const [year, month, day] = birthDate.split("-").map(Number)
  const today = new Date()
  let age = today.getUTCFullYear() - year

  const birthdayHasPassed =
    today.getUTCMonth() + 1 > month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() >= day)

  if (!birthdayHasPassed) age -= 1
  return age
}

function getPlayerImage(row: SquadPlayerRow) {
  if (row.image_url) return row.image_url
  if (!row.fotmob_id) return undefined
  return `https://images.fotmob.com/image_resources/playerimages/${row.fotmob_id}.png`
}

export function mapSquadPlayerRow(row: SquadPlayerRow): SquadPlayer {
  return {
    id: row.id,
    name: row.name,
    number: row.shirt_number ?? 0,
    line: row.line,
    position: row.position,
    age: calculateAge(row.birth_date),
    nationality: row.nationality,
    foot: row.preferred_foot ?? "—",
    fromAcademy: row.from_academy,
    image: getPlayerImage(row),
  }
}

export async function fetchSquadPlayers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("squad_players")
    .select(SQUAD_PLAYERS_SELECT)
    .eq("active", true)
    .order("display_order", { ascending: true })

  return {
    squadPlayers: data ? (data as SquadPlayerRow[]).map(mapSquadPlayerRow) : undefined,
    error,
  }
}

export function getSquadPlayersTableMissingMessage(message?: string) {
  if (message?.toLowerCase().includes("relation") && message?.toLowerCase().includes("does not exist")) {
    return "Falta aplicar la migración del plantel en Supabase."
  }

  return message
}
