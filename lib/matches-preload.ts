import type { Match } from "@/lib/data/types"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { mapMatchRowToMatch, MATCHES_SELECT, type MatchRow } from "@/lib/supabase/matches"

const MATCHES_REVALIDATE_SECONDS = 60
const MATCHES_TIMEOUT_MS = 1800

export async function getPreloadedMatches(): Promise<Match[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MATCHES_TIMEOUT_MS)

  try {
    const { url, key } = getSupabaseEnv()
    const endpoint = new URL(`${url}/rest/v1/matches`)
    endpoint.searchParams.set("select", MATCHES_SELECT)
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
