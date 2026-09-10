import type { Match } from "@/lib/data/types"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { mapMatchRowToMatch, type MatchRow } from "@/lib/supabase/matches"

const MATCHES_REVALIDATE_SECONDS = 60
const MATCHES_TIMEOUT_MS = 1800
// Fixture lists only need match metadata and scores. Detailed incidents/lineups
// are loaded on the individual match page, so keeping `detail` out of this
// preload prevents the entire match archive from being serialized into the
// initial Fixture HTML/RSC payload.
const MATCHES_PRELOAD_SELECT =
  "id, date, opponent, competition, status, is_home, stadium, tv_channel, river_score, opponent_score, referee"

export async function getPreloadedMatches(): Promise<Match[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MATCHES_TIMEOUT_MS)

  try {
    const { url, key } = getSupabaseEnv()
    const endpoint = new URL(`${url}/rest/v1/matches`)
    endpoint.searchParams.set("select", MATCHES_PRELOAD_SELECT)
    endpoint.searchParams.set("order", "date.asc")

    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: {
        revalidate: MATCHES_REVALIDATE_SECONDS,
        tags: ["matches-feed"],
      },
    })

    if (!response.ok) return []

    const rows = (await response.json()) as MatchRow[]
    return Array.isArray(rows) ? rows.map(mapMatchRowToMatch) : []
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export function getUpcomingFromMatches(matches: Match[], now = Date.now()) {
  return matches
    .filter((match) => match.status === "upcoming" && new Date(match.date).getTime() > now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

export function getPreviousFromMatches(matches: Match[]) {
  return matches
    .filter((match) => match.status === "played")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
