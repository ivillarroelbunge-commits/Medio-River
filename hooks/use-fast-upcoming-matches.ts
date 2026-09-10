"use client"

import { useEffect, useMemo, useState } from "react"
import type { Match } from "@/lib/data/types"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchUpcomingMatches } from "@/lib/supabase/matches"

const UPCOMING_MATCHES_CACHE_KEY = "medio-river-fixture-upcoming-v1"
const UPCOMING_MATCHES_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000

function keepFutureUpcoming(matches: Match[]) {
  const now = Date.now()
  return matches
    .filter((match) => match.status === "upcoming" && new Date(match.date).getTime() > now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

function readCachedUpcomingMatches() {
  try {
    const raw = window.localStorage.getItem(UPCOMING_MATCHES_CACHE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as { savedAt?: number; matches?: Match[] }
    if (!parsed.savedAt || !Array.isArray(parsed.matches)) return []
    if (Date.now() - parsed.savedAt > UPCOMING_MATCHES_CACHE_MAX_AGE_MS) return []

    return keepFutureUpcoming(parsed.matches)
  } catch {
    return []
  }
}

function saveCachedUpcomingMatches(matches: Match[]) {
  try {
    window.localStorage.setItem(UPCOMING_MATCHES_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      matches: keepFutureUpcoming(matches),
    }))
  } catch {
    // Local storage can be unavailable in private/mobile contexts.
  }
}

export function useFastUpcomingMatches(initialMatches: Match[] = []) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [matches, setMatches] = useState<Match[]>(() => keepFutureUpcoming(initialMatches))

  useEffect(() => {
    let active = true
    let refreshInFlight = false
    let expiryTimer: number | undefined

    const serverMatches = keepFutureUpcoming(initialMatches)
    const cached = serverMatches.length === 0 ? readCachedUpcomingMatches() : []
    if (cached.length > 0) {
      setMatches(cached)
    }

    function scheduleNextExpiry(nextMatches: Match[]) {
      if (expiryTimer) window.clearTimeout(expiryTimer)
      const nextDate = nextMatches[0] ? new Date(nextMatches[0].date).getTime() : 0
      const delay = nextDate - Date.now() + 1000

      if (delay > 0 && delay < 2_147_483_647) {
        expiryTimer = window.setTimeout(() => {
          setMatches((current) => keepFutureUpcoming(current))
          void refresh()
        }, delay)
      }
    }

    async function refresh() {
      if (refreshInFlight) return
      refreshInFlight = true

      try {
        const { matches: freshMatches, error } = await fetchUpcomingMatches(supabase)
        if (!active || error) return

        const cleanMatches = keepFutureUpcoming(freshMatches)
        setMatches(cleanMatches)
        saveCachedUpcomingMatches(cleanMatches)
        scheduleNextExpiry(cleanMatches)
      } catch {
        // Keep the server/cached fixture visible if the network refresh fails.
      } finally {
        refreshInFlight = false
      }
    }

    scheduleNextExpiry(serverMatches.length > 0 ? serverMatches : cached)
    void refresh()

    const channel = supabase
      .channel("fixture-upcoming-fast-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          void refresh()
        },
      )
      .subscribe()

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        setMatches((current) => keepFutureUpcoming(current))
        void refresh()
      }
    }

    document.addEventListener("visibilitychange", refreshOnFocus)

    return () => {
      active = false
      if (expiryTimer) window.clearTimeout(expiryTimer)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      void supabase.removeChannel(channel)
    }
  }, [initialMatches, supabase])

  return matches
}
