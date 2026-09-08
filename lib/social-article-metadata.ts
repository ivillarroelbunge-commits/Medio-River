const SUPABASE_URL = "https://amftkabquesgzsurkols.supabase.co"
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_En3zWr4e2WbvV7MfN32bEA_BXZvOLli"
const SUPABASE_ANON_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZnRrYWJxdWVzZ3pzdXJrb2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY3MjYsImV4cCI6MjA5MjgxMjcyNn0.k9b0WXOkVWTDnNIAHdqfM7yx5WPgxN_XRLkIEGS74LM"

export interface SocialArticleMetadata {
  article: {
    slug: string
    title: string
    excerpt: string
    intro: string
    image: string | null
    author: string
    publishedAt: string
    articleType: "standard" | "player_ratings"
    matchId: string | null
  }
  match: {
    opponent: string
    isHome: boolean
  } | null
}

type ArticleRow = {
  slug: string
  title: string
  excerpt: string | null
  intro: string | null
  image: string | null
  author: string | null
  published_at: string
  article_type: string | null
  match_id: string | null
}

type MatchRow = {
  opponent: string
  is_home: boolean
}

const PUBLIC_HEADERS = {
  Accept: "application/json",
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_TOKEN}`,
}

export async function fetchSocialArticleMetadata(slug: string): Promise<SocialArticleMetadata | null> {
  try {
    const articleUrl = new URL(`${SUPABASE_REST_URL}/news_articles`)
    articleUrl.searchParams.set(
      "select",
      "slug,title,excerpt,intro,image,author,published_at,article_type,match_id",
    )
    articleUrl.searchParams.set("slug", `eq.${slug}`)
    articleUrl.searchParams.set("limit", "1")

    const articleResponse = await fetch(articleUrl, {
      cache: "no-store",
      headers: PUBLIC_HEADERS,
    })

    if (!articleResponse.ok) return null

    const articleRows = (await articleResponse.json()) as ArticleRow[]
    const row = articleRows[0]
    if (!row?.slug || !row.title) return null

    let match: SocialArticleMetadata["match"] = null

    if (row.match_id) {
      const matchUrl = new URL(`${SUPABASE_REST_URL}/matches`)
      matchUrl.searchParams.set("select", "opponent,is_home")
      matchUrl.searchParams.set("id", `eq.${row.match_id}`)
      matchUrl.searchParams.set("limit", "1")

      const matchResponse = await fetch(matchUrl, {
        cache: "no-store",
        headers: PUBLIC_HEADERS,
      })

      if (matchResponse.ok) {
        const matchRows = (await matchResponse.json()) as MatchRow[]
        const matchRow = matchRows[0]
        if (matchRow?.opponent) {
          match = {
            opponent: String(matchRow.opponent),
            isHome: Boolean(matchRow.is_home),
          }
        }
      }
    }

    return {
      article: {
        slug: String(row.slug),
        title: String(row.title),
        excerpt: String(row.excerpt ?? ""),
        intro: String(row.intro ?? ""),
        image: row.image ? String(row.image) : null,
        author: String(row.author ?? "Redacción Medio River"),
        publishedAt: String(row.published_at),
        articleType: row.article_type === "player_ratings" ? "player_ratings" : "standard",
        matchId: row.match_id ? String(row.match_id) : null,
      },
      match,
    }
  } catch {
    return null
  }
}
