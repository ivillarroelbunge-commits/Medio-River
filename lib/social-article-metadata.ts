const ARTICLE_METADATA_ENDPOINT =
  "https://amftkabquesgzsurkols.supabase.co/functions/v1/article-metadata"

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
      headers: { Accept: "application/json" },
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
