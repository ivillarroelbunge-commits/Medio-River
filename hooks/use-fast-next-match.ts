"use client"

import { useEffect, useMemo, useState } from "react"
import type { Match } from "@/lib/data/types"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchNextUpcomingMatch } from "@/lib/supabase/matches"

const NEXT_MATCH_CACHE_KEY = "medio-river-home-next-match-v1"
const NEXT_MATCH_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000

function isFutureUpcomingMatch(match: Match | null | undefined) {
  return Boolean(match && match.status === "upcoming" && new Date(match.date).getTime() > Date.now())
}

function readCachedNextMatch() {
  try {
    const raw = window.localStorage.getItem(NEXT_MATCH_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as { savedAt?: number; match?: Match | null }
    if (!parsed.savedAt || !parsed.match) return null
    if (Date.now() - parsed.savedAt > NEXT_MATCH_CACHE_MAX_AGE_MS) return null
    if (!isFutureUpcomingMatch(parsed.match)) return null

    return parsed.match
  } catch {
    return null
  }
}

function saveCachedNextMatch(match: Match | null) {
  try {
    if (!match) {
      window.localStorage.removeItem(NEXT_MATCH_CACHE_KEY)
      return
    }

    window.localStorage.setItem(NEXT_MATCH_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      match,
    }))
  } catch {
    // Local storage can be unavailable in private/mobile contexts.
  }
}

export function useFastNextMatch(initialMatch: Match | null = null) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [match, setMatch] = useState<Match | null>(() => isFutureUpcomingMatch(initialMatch) ? initialMatch : null)

  useEffect(() => {
    let active = true
    let refreshInFlight = false

    // The ISR snapshot is fresher than the 12-hour local cache. Only use the
    // browser cache as an offline/failed-preload fallback.
    if (!isFutureUpcomingMatch(initialMatch)) {
      const cached = readCachedNextMatch()
      if (cached) {
        setMatch(cached)
      }
    }

    async function refresh() {
      if (refreshInFlight) return
      refreshInFlight = true

      try {
        const { match: freshMatch, error } = await fetchNextUpcomingMatch(supabase)
        if (!active || error) return

        setMatch(freshMatch)
        saveCachedNextMatch(freshMatch)
      } finally {
        refreshInFlight = false
      }
    }

    void refresh()

    const channel = supabase
      .channel("home-next-match-fast-sync")
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
        void refresh()
      }
    }

    document.addEventListener("visibilitychange", refreshOnFocus)

    return () => {
      active = false
      document.removeEventListener("visibilitychange", refreshOnFocus)
      void supabase.removeChannel(channel)
    }
  }, [initialMatch?.date, initialMatch?.id, supabase])

  return match
}
