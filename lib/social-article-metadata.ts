const ARTICLE_METADATA_ENDPOINT =
  "https://amftkabquesgzsurkols.supabase.co/functions/v1/article-metadata"
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

export async function fetchSocialArticleMetadata(slug: string): Promise<SocialArticleMetadata | null> {
  try {
    const url = new URL(ARTICLE_METADATA_ENDPOINT)
    url.searchParams.set("slug", slug)

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_TOKEN}`,
      },
    })

    if (!response.ok) return null

    const payload = (await response.json()) as {
      ok?: boolean
      article?: SocialArticleMetadata["article"]
      match?: SocialArticleMetadata["match"]
    }

    if (!payload.ok || !payload.article?.slug || !payload.article.title) return null

    return {
      article: payload.article,
      match: payload.match ?? null,
    }
  } catch {
    return null
  }
}
