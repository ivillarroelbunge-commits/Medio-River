"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useAppState } from "@/components/app-state-provider"
import { formatDateLong } from "@/lib/format"
import { getNewsImage } from "@/lib/news-media"

export default function NoticiaDetallePage() {
  const params = useParams<{ slug: string }>()
  const { news, isHydrated } = useAppState()
  const article = news.find((item) => item.slug === params.slug)

  if (!isHydrated) {
    return <div className="min-h-dvh bg-background" />
  }

  if (!article) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container-prose py-10">
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <h1 className="font-display text-3xl font-extrabold">Noticia no encontrada</h1>
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
        <article className="container-prose max-w-4xl space-y-8 py-8 md:py-10">
          <Link href="/noticias" className="text-sm font-semibold text-primary hover:underline">← Volver a noticias</Link>
          <header className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{article.category}</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">{article.title}</h1>
            <p className="text-sm text-muted-foreground">{article.author} · {formatDateLong(article.date)}</p>
            <p className="max-w-3xl text-lg text-muted-foreground">{article.intro}</p>
          </header>
          <img src={getNewsImage(article)} alt={article.title} className="h-[22rem] w-full rounded-3xl object-cover md:h-[30rem]" />
          <div className="news-rich-content space-y-5 text-base leading-8 text-foreground">
            {article.content.some(hasHtmlTags) ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeStoredNewsHtml(article.content.join("")) }} />
            ) : (
              article.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            )}
          </div>
        </article>
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
