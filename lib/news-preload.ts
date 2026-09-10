import { newsArticles } from "@/lib/data/news"
import type { NewsArticle, NewsTag } from "@/lib/data/types"
import { normalizeNewsCategory } from "@/lib/news-taxonomy"
import { getSupabaseEnv } from "@/lib/supabase/env"

const FEATURED_NEWS_REVALIDATE_SECONDS = 60
const FEATURED_NEWS_TIMEOUT_MS = 1800
const NEWS_SUMMARY_SELECT = [
  "id",
  "slug",
  "title",
  "excerpt",
  "intro",
  "image",
  "image_focus_x",
  "image_focus_y",
  "image_zoom",
  "author",
  "published_at",
  "category",
  "competition",
  "tag",
  "featured",
  "article_type",
  "match_id",
].join(",")

type NewsSummaryRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  intro: string
  image: string | null
  image_focus_x?: number | null
  image_focus_y?: number | null
  image_zoom?: number | null
  author: string
  published_at: string
  category: string
  competition: string | null
  tag: string
  featured: boolean
  article_type?: string | null
  match_id?: string | null
}

export async function getPreloadedFeaturedNews(limit = 5): Promise<NewsArticle[]> {
  const featured = await fetchNewsSummariesFromSupabase(limit, true)
  if (featured.length > 0) return featured

  const latest = await fetchNewsSummariesFromSupabase(limit, false)
  if (latest.length > 0) return latest

  const localFeatured = newsArticles
    .filter((article) => article.featured)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const fallback = localFeatured.length > 0 ? localFeatured : newsArticles
  return fallback.slice(0, limit).map((article) => ({ ...article, content: [] }))
}

async function fetchNewsSummariesFromSupabase(limit: number, featuredOnly: boolean): Promise<NewsArticle[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FEATURED_NEWS_TIMEOUT_MS)

  try {
    const { url, key } = getSupabaseEnv()
    const endpoint = new URL(`${url}/rest/v1/news_articles`)
    endpoint.searchParams.set("select", NEWS_SUMMARY_SELECT)
    endpoint.searchParams.set("order", "published_at.desc")
    endpoint.searchParams.set("limit", String(limit))

    if (featuredOnly) {
      endpoint.searchParams.set("featured", "eq.true")
    }

    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: {
        revalidate: FEATURED_NEWS_REVALIDATE_SECONDS,
        tags: [featuredOnly ? "featured-news" : "latest-news"],
      },
    })

    if (!response.ok) return []

    const rows = (await response.json()) as NewsSummaryRow[]
    return Array.isArray(rows) ? rows.map(mapNewsSummaryRow) : []
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

function mapNewsSummaryRow(row: NewsSummaryRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    intro: row.intro,
    content: [],
    image: row.image ?? undefined,
    imageFocusX: row.image_focus_x ?? undefined,
    imageFocusY: row.image_focus_y ?? undefined,
    imageZoom: row.image_zoom ?? undefined,
    author: row.author,
    date: row.published_at,
    category: normalizeNewsCategory(row.category),
    competition: row.competition ?? undefined,
    tag: row.tag as NewsTag,
    featured: row.featured,
    articleType: row.article_type === "player_ratings" ? "player_ratings" : "standard",
    matchId: row.match_id ?? undefined,
  }
}
