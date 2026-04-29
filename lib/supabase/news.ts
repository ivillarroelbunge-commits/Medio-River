import type { SupabaseClient } from "@supabase/supabase-js"
import type { NewsArticle, NewsTag } from "@/lib/data/types"

export const NEWS_SELECT =
  "id, slug, title, excerpt, intro, content, image, author, published_at, category, competition, tag, featured"

interface NewsRow {
  id: string
  slug: string
  title: string
  excerpt: string
  intro: string
  content: unknown
  image: string | null
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
    author: row.author,
    date: row.published_at,
    category: row.category,
    competition: row.competition ?? undefined,
    tag: row.tag as NewsTag,
    featured: row.featured,
  }
}

export async function fetchNewsArticles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("news_articles")
    .select(NEWS_SELECT)
    .order("published_at", { ascending: false })

  if (error || !data) {
    return { articles: null, error }
  }

  return {
    articles: (data as NewsRow[]).map(mapNewsRowToArticle),
    error: null,
  }
}
