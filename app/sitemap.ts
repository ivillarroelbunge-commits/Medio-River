import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { newsArticles } from "@/lib/data/news"
import { getSupabaseEnv } from "@/lib/supabase/env"

const siteUrl = "https://medioriver.com.ar"

const staticRoutes = [
  { path: "/inicio", priority: 1 },
  { path: "/noticias", priority: 0.9 },
  { path: "/fixture", priority: 0.8 },
  { path: "/trivia", priority: 0.8 },
  { path: "/plantel", priority: 0.8 },
  { path: "/iniciar-sesion", priority: 0.4 },
  { path: "/registrarse", priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const newsEntries = await getNewsEntries()

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority,
    })),
    ...newsEntries.map((article) => ({
      url: `${siteUrl}/noticias/${article.slug}`,
      lastModified: article.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}

async function getNewsEntries() {
  const entries = new Map<string, Date>()

  for (const article of newsArticles) {
    entries.set(article.slug, new Date(article.date))
  }

  try {
    const { url, key } = getSupabaseEnv()
    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data } = await supabase
      .from("news_articles")
      .select("slug, published_at")
      .order("published_at", { ascending: false })

    for (const article of data ?? []) {
      if (typeof article.slug !== "string") continue
      const date = typeof article.published_at === "string" ? new Date(article.published_at) : new Date()
      entries.set(article.slug, date)
    }
  } catch {
    // Keep the sitemap available with bundled news if Supabase is unreachable.
  }

  return Array.from(entries, ([slug, lastModified]) => ({ slug, lastModified }))
}
