import { createClient } from "npm:@supabase/supabase-js@2.58.0"

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: HEADERS })
  if (req.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405)

  const url = new URL(req.url)
  const slug = url.searchParams.get("slug")?.trim()
  if (!slug || slug.length > 240) return json({ ok: false, error: "Invalid slug" }, 400)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("article-metadata missing Supabase server environment")
    return json({ ok: false, error: "Server configuration unavailable" }, 500)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: article, error } = await admin
      .from("news_articles")
      .select("slug, title, excerpt, intro, image, author, published_at, article_type, match_id")
      .eq("slug", slug)
      .maybeSingle()

    if (error) throw error
    if (!article) return json({ ok: false, error: "Not found" }, 404)

    let match = null
    if (article.match_id) {
      const result = await admin
        .from("matches")
        .select("opponent, is_home")
        .eq("id", article.match_id)
        .maybeSingle()
      if (result.error) throw result.error
      match = result.data
    }

    return json({
      ok: true,
      article: {
        slug: String(article.slug),
        title: String(article.title),
        excerpt: String(article.excerpt ?? ""),
        intro: String(article.intro ?? ""),
        image: article.image ? String(article.image) : null,
        author: String(article.author ?? "Redacción Medio River"),
        publishedAt: String(article.published_at),
        articleType: article.article_type === "player_ratings" ? "player_ratings" : "standard",
        matchId: article.match_id ? String(article.match_id) : null,
      },
      match: match ? {
        opponent: String(match.opponent),
        isHome: Boolean(match.is_home),
      } : null,
    })
  } catch (error) {
    console.error("article-metadata failed", error)
    return json({ ok: false, error: "Could not load article metadata" }, 500)
  }
})
