import { NextResponse } from "next/server"
import { fetchSocialArticleMetadata } from "@/lib/social-article-metadata"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")?.trim()

  if (!slug) {
    return NextResponse.json({ ok: false, error: "missing slug" }, { status: 400 })
  }

  const metadata = await fetchSocialArticleMetadata(slug)

  return NextResponse.json({
    ok: Boolean(metadata),
    title: metadata?.article.title ?? null,
    image: metadata?.article.image ?? null,
    articleType: metadata?.article.articleType ?? null,
    match: metadata?.match ?? null,
  })
}
