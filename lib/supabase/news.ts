import type { SupabaseClient } from "@supabase/supabase-js"
import type { NewsArticle, NewsTag } from "@/lib/data/types"
import { normalizeNewsCategory } from "@/lib/news-taxonomy"

export const NEWS_SELECT =
  "id, slug, title, excerpt, intro, content, image, image_focus_x, image_focus_y, image_zoom, author, published_at, category, competition, tag, featured"
const LEGACY_NEWS_SELECT =
  "id, slug, title, excerpt, intro, content, image, author, published_at, category, competition, tag, featured"

interface NewsRow {
  id: string
  slug: string
  title: string
  excerpt: string
  intro: string
  content: unknown
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
}

export function mapNewsRowToArticle(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    intro: row.intro,
    content: Array.isArray(row.content) ? row.content.map(String) : [],
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
  }
}

export async function fetchNewsArticles(supabase: SupabaseClient) {
  let { data, error } = await supabase
    .from("news_articles")
    .select(NEWS_SELECT)
    .order("published_at", { ascending: false })

  if (error && isMissingImageCropColumn(error.message)) {
    const fallback = await supabase
      .from("news_articles")
      .select(LEGACY_NEWS_SELECT)
      .order("published_at", { ascending: false })
    data = fallback.data
    error = fallback.error
  }

  if (error || !data) {
    return { articles: null, error }
  }

  return {
    articles: (data as NewsRow[]).map(mapNewsRowToArticle),
    error: null,
  }
}

export function isMissingImageCropColumn(message?: string) {
  return Boolean(message?.includes("image_focus_") || message?.includes("image_zoom"))
}
