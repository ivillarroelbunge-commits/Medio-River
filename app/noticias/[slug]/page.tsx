"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useAppState } from "@/components/app-state-provider"
import { NewsCard } from "@/components/news-card"
import { ShareButtons } from "@/components/share-buttons"
import { formatDateLong } from "@/lib/format"
import { getNewsImage } from "@/lib/news-media"
import { normalizeNewsCategory } from "@/lib/news-taxonomy"

export default function NoticiaDetallePage() {
  const params = useParams<{ slug: string }>()
  const { news, isHydrated } = useAppState()
  const article = news.find((item) => item.slug === params.slug)
  const relatedArticles = article
    ? news
        .filter((item) => item.id !== article.id)
        .map((item) => ({
          article: item,
          score:
            (normalizeNewsCategory(item.category) === normalizeNewsCategory(article.category) ? 3 : 0) +
            (item.competition && item.competition === article.competition ? 2 : 0) +
            (item.tag === article.tag ? 1 : 0),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || new Date(b.article.date).getTime() - new Date(a.article.date).getTime())
        .slice(0, 3)
        .map((item) => item.article)
    : []

  if (!isHydrated) {
    return <div className="min-h-dvh bg-background" />
  }

  if (!article) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container-prose py-6 md:py-10">
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:p-8">
              <h1 className="font-display text-2xl font-extrabold md:text-3xl">Noticia no encontrada</h1>
              <Link href="/noticias" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Volver a noticias</Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="container-prose max-w-4xl space-y-5 py-5 md:space-y-8 md:py-10">
          <Link href="/noticias" className="text-sm font-semibold text-primary hover:underline">← Volver a noticias</Link>
          <header className="space-y-3">
            <h1 className="font-display text-[2rem] font-extrabold tracking-tight leading-tight md:text-5xl">{article.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-white ${article.tag === "Opinión" ? "bg-black" : "bg-primary"}`}>
                {article.tag}
              </span>
              <span className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-primary">
                {normalizeNewsCategory(article.category)}
              </span>
              {article.competition && (
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                  {article.competition}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{article.author} · {formatDateLong(article.date)}</p>
            <p className="text-base leading-7 text-muted-foreground md:text-lg md:leading-8">{article.intro}</p>
          </header>
          <img src={getNewsImage(article)} alt={article.title} className="h-[16rem] w-full rounded-2xl object-cover md:h-[30rem] md:rounded-3xl" />
          <div className="news-rich-content space-y-4 text-sm leading-7 text-foreground md:space-y-5 md:text-base md:leading-8">
            {article.content.some(hasHtmlTags) ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeStoredNewsHtml(article.content.join("")) }} />
            ) : (
              article.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            )}
          </div>
          <ShareButtons title={article.title} slug={article.slug} />
        </article>
        {relatedArticles.length > 0 && (
          <section className="container-prose max-w-6xl pb-8 md:pb-12">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Más para leer</p>
                <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Noticias relacionadas</h2>
              </div>
              <Link href="/noticias" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">Ver todas</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
              {relatedArticles.map((item) => <NewsCard key={item.id} article={item} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

function hasHtmlTags(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function sanitizeStoredNewsHtml(input: string) {
  return input
    .replace(/<(?!\/?(p|br|strong|em|u|a|h2|h3)\b)[^>]*>/gi, "")
    .replace(/\s(on\w+|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/<a\s+([^>]*?)href=(["']?)(?!https?:|mailto:)([^"'\s>]+)\2([^>]*)>/gi, "<a $1$4>")
    .replace(/<a\b/gi, '<a target="_blank" rel="noopener noreferrer"')
}
