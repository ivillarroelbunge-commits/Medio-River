import type { SquadPlayer } from "@/lib/data/types"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { mapSquadPlayerRow, SQUAD_PLAYERS_SELECT, type SquadPlayerRow } from "@/lib/supabase/squad"

const SQUAD_REVALIDATE_SECONDS = 300
const SQUAD_TIMEOUT_MS = 1800

export async function getPreloadedSquadPlayers(): Promise<SquadPlayer[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SQUAD_TIMEOUT_MS)

  try {
    const { url, key } = getSupabaseEnv()
    const endpoint = new URL(`${url}/rest/v1/squad_players`)
    endpoint.searchParams.set("select", SQUAD_PLAYERS_SELECT)
    endpoint.searchParams.set("active", "eq.true")
    endpoint.searchParams.set("order", "display_order.asc")

    const response = await fetch(endpoint, {
      headers: { apikey: key, Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: SQUAD_REVALIDATE_SECONDS, tags: ["squad-players"] },
    })

    if (!response.ok) return []
    const rows = (await response.json()) as SquadPlayerRow[]
    return Array.isArray(rows) ? rows.map(mapSquadPlayerRow) : []
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}
