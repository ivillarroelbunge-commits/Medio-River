"use client"

import { useEffect, useMemo, useState } from "react"
import type { NewsArticle } from "@/lib/data/types"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchNewsSummaries } from "@/lib/supabase/news"

const HOME_NEWS_CACHE_KEY = "medio-river-home-news-v1"
const HOME_NEWS_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000
const HOME_NEWS_LIMIT = 12
const FALLBACK_DELAY_MS = 1500

function readCachedHomeNews() {
  try {
    const raw = window.localStorage.getItem(HOME_NEWS_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as { savedAt?: number; articles?: NewsArticle[] }
    if (!parsed.savedAt || !Array.isArray(parsed.articles) || parsed.articles.length === 0) return null
    if (Date.now() - parsed.savedAt > HOME_NEWS_CACHE_MAX_AGE_MS) return null

    return parsed.articles
  } catch {
    return null
  }
}

function saveCachedHomeNews(articles: NewsArticle[]) {
  try {
    window.localStorage.setItem(HOME_NEWS_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      articles: articles.slice(0, HOME_NEWS_LIMIT).map((article) => ({ ...article, content: [] })),
    }))
  } catch {
    // Local storage can be unavailable in private/mobile contexts.
  }
}

export function useFastHomeNews(fallbackNews: NewsArticle[], hasSyncedNews: boolean) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [allowFallback, setAllowFallback] = useState(false)

  useEffect(() => {
    let active = true
    let refreshInFlight = false

    const cached = readCachedHomeNews()
    if (cached?.length) {
      setNews(cached)
    }

    async function refresh() {
      if (refreshInFlight) return
      refreshInFlight = true

      try {
        const { articles } = await fetchNewsSummaries(supabase, HOME_NEWS_LIMIT)
        if (!active || !articles?.length) return

        setNews(articles)
        saveCachedHomeNews(articles)
      } finally {
        refreshInFlight = false
      }
    }

    void refresh()

    const fallbackTimer = window.setTimeout(() => {
      if (active) setAllowFallback(true)
    }, FALLBACK_DELAY_MS)

    const channel = supabase
      .channel("home-news-fast-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news_articles" },
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
      window.clearTimeout(fallbackTimer)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  if (news.length > 0) return news
  if (allowFallback && hasSyncedNews) return fallbackNews
  return []
}
