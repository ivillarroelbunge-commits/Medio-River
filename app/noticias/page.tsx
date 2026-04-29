"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { NewsCard } from "@/components/news-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/components/app-state-provider"
import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage } from "@/lib/news-media"
import { timeAgo } from "@/lib/format"

const defaultCategories = ["Partidos", "Mercado de pases", "Opinión", "Juveniles"]
const defaultCompetitions = ["Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]
const INITIAL_VISIBLE = 9
const LOAD_MORE_STEP = 6

export default function NoticiasPage() {
  const { news, isHydrated } = useAppState()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todas")
  const [competition, setCompetition] = useState("Todas")
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [featuredOffset, setFeaturedOffset] = useState(0)
  const categories = useMemo(() => ["Todas", ...mergeNewsOptions(defaultCategories, news.map((article) => article.category))], [news])
  const competitions = useMemo(() => ["Todas", ...mergeNewsOptions(defaultCompetitions, news.map((article) => article.competition))], [news])

  const featuredStories = useMemo(() => {
    const highlighted = news.filter((article) => article.featured)
    return (highlighted.length > 0 ? highlighted : news).slice(0, 3)
  }, [news])

  const featuredIds = new Set(featuredStories.map((article) => article.id))
  const rotatingFeaturedStories = useMemo(() => {
    if (featuredStories.length <= 1) return featuredStories
    return featuredStories.map((_, index) => featuredStories[(index + featuredOffset) % featuredStories.length])
  }, [featuredOffset, featuredStories])

  const filtered = useMemo(() => news.filter((article) => {
    if (featuredIds.has(article.id)) return false
    const matchesCategory = category === "Todas" || article.category === category
    const matchesCompetition = competition === "Todas" || article.competition === competition
    const matchesQuery = query.trim().length === 0 || article.title.toLowerCase().includes(query.toLowerCase()) || article.excerpt.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesCompetition && matchesQuery
  }), [category, competition, featuredIds, news, query])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [category, competition, query])

  useEffect(() => {
    if (featuredStories.length <= 1) return
    const interval = window.setInterval(() => {
      setFeaturedOffset((offset) => (offset + 1) % featuredStories.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [featuredStories.length])

  useEffect(() => {
    setFeaturedOffset(0)
  }, [featuredStories.map((article) => article.id).join("|")])

  const visibleArticles = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container-prose py-8 md:py-10" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-8 py-8 md:py-10">
          <header className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cobertura</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Noticias</h1>
          </header>

          {featuredStories.length > 0 && (
            <section className="grid gap-6 xl:h-[34rem] xl:grid-cols-[1.9fr_0.95fr] xl:items-stretch">
              <FeaturedLeadCard article={rotatingFeaturedStories[0]} />
              <div className="flex flex-col gap-6 xl:h-full">
                {rotatingFeaturedStories.slice(1).map((article) => (
                  <FeaturedSideCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar noticia" className="h-10 w-full rounded-lg border border-input/70 bg-background/80 px-3.5 text-sm" />
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${item === category ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {competitions.map((item) => (
                <button key={item} type="button" onClick={() => setCompetition(item)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${item === competition ? "bg-secondary text-secondary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleArticles.map((article) => <NewsCard key={article.id} article={article} />)}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}>
                Cargar más
              </Button>
            </div>
          )}

          {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No encontramos noticias con esos filtros.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function mergeNewsOptions(defaults: string[], values: Array<string | undefined>) {
  return Array.from(new Set([...defaults, ...values].filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())))
}

function FeaturedLeadCard({ article }: { article: NewsArticle }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border shadow-[0_12px_34px_rgba(15,23,42,0.12)] xl:h-full">
      <Link href={`/noticias/${article.slug}`} className="group relative block min-h-[22rem] overflow-hidden md:min-h-[30rem] xl:h-full xl:min-h-0">
        <img src={getNewsImage(article)} alt={article.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/26 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 xl:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-primary-foreground">
              {article.category}
            </span>
            {article.competition && (
              <span className="inline-flex rounded-full bg-white/92 px-4 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-foreground">
                {article.competition}
              </span>
            )}
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-[2rem] font-extrabold leading-[1.08] text-white md:text-[2.6rem] xl:text-[3rem]">
            {article.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/82 md:text-base md:leading-8 xl:max-w-2xl">
            {article.excerpt}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.08em] text-white/65 md:text-sm">
            {article.author} · {timeAgo(article.date)}
          </p>
        </div>
      </Link>
    </article>
  )
}

function FeaturedSideCard({ article }: { article: NewsArticle }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm xl:flex-1">
      <Link href={`/noticias/${article.slug}`} className="grid h-full gap-4 p-5 sm:grid-cols-[9.5rem_1fr] sm:items-start xl:h-full">
        <img src={getNewsImage(article)} alt={article.title} className="h-40 w-full rounded-[1.35rem] object-cover sm:h-full sm:min-h-[9.5rem]" />
        <div className="flex h-full flex-col">
          <div>
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-primary">{article.category}</p>
            <h3 className="mt-3 max-w-md text-[1.18rem] font-extrabold leading-[1.28] tracking-[-0.02em] text-foreground">
              {article.title}
            </h3>
          </div>
          <p className="mt-auto pt-4 text-sm text-muted-foreground">{timeAgo(article.date)}</p>
        </div>
      </Link>
    </article>
  )
}
