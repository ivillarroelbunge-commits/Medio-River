"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { NewsCard } from "@/components/news-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/components/app-state-provider"
import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage } from "@/lib/news-media"
import { timeAgo } from "@/lib/format"
import { defaultNewsCategories, normalizeNewsCategory } from "@/lib/news-taxonomy"

const defaultCategories = defaultNewsCategories
const defaultCompetitions = ["Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]
const INITIAL_VISIBLE = 9
const LOAD_MORE_STEP = 6

export default function NoticiasPage() {
  const { news, isHydrated } = useAppState()
  const [query, setQuery] = useState("")
  const [tag, setTag] = useState("Todas")
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
    const matchesTag = tag === "Todas" || article.tag === tag
    const matchesCategory = category === "Todas" || normalizeNewsCategory(article.category) === category
    const matchesCompetition = competition === "Todas" || article.competition === competition
    const matchesQuery = query.trim().length === 0 || article.title.toLowerCase().includes(query.toLowerCase()) || article.excerpt.toLowerCase().includes(query.toLowerCase())
    return matchesTag && matchesCategory && matchesCompetition && matchesQuery
  }), [category, competition, featuredIds, news, query, tag])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [category, competition, query, tag])

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
          <div className="container-prose py-5 md:py-10" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-6 py-5 md:space-y-8 md:py-10">
          <header className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cobertura</p>
            <h1 className="font-display text-[2rem] font-extrabold tracking-tight md:text-4xl">Noticias</h1>
          </header>

          {featuredStories.length > 0 && (
            <section className="grid gap-3 sm:gap-4 md:gap-6 xl:h-[34rem] xl:grid-cols-[1.9fr_0.95fr] xl:items-stretch">
              <FeaturedLeadCard article={rotatingFeaturedStories[0]} />
              <div className="flex flex-col gap-4 md:gap-6 xl:h-full">
                {rotatingFeaturedStories.slice(1).map((article) => (
                  <FeaturedSideCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-2.5 sm:p-3 md:p-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar noticia" className="h-10 w-full rounded-lg border border-input/70 bg-background/80 px-3.5 text-sm" />
            <div className="grid gap-2 sm:grid-cols-3">
              <FilterSelect label="Tipo" value={tag} options={["Todas", "Información", "Opinión"]} onChange={setTag} tone="dark" />
              <FilterSelect label="Categoría" value={category} options={categories} onChange={setCategory} tone="primary" />
              <FilterSelect label="Competencia" value={competition} options={competitions} onChange={setCompetition} tone="secondary" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {visibleArticles.map((article) => <NewsCard key={article.id} article={article} />)}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}>
                Cargar más
              </Button>
            </div>
          )}

          {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground md:p-8">No encontramos noticias con esos filtros.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function mergeNewsOptions(defaults: string[], values: Array<string | undefined>) {
  return Array.from(new Set([...defaults, ...values].filter((value): value is string => Boolean(value?.trim())).map((value) => normalizeNewsCategory(value)).filter(Boolean)))
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
  tone,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  tone: "dark" | "primary" | "secondary"
}) {
  const active = value !== "Todas"
  const activeClass =
    tone === "dark"
      ? "border-foreground bg-foreground text-background"
      : tone === "primary"
        ? "border-primary bg-primary text-primary-foreground"
        : "border-secondary bg-secondary text-secondary-foreground"

  return (
    <label className="relative block">
      <span className="mb-1.5 block text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full appearance-none rounded-full border px-3.5 pr-9 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-ring ${active ? activeClass : "border-border bg-background text-muted-foreground hover:text-foreground"}`}
      >
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <ChevronDown className={`pointer-events-none absolute bottom-3 right-3 h-4 w-4 ${active ? "opacity-80" : "text-muted-foreground"}`} />
    </label>
  )
}

function FeaturedLeadCard({ article }: { article: NewsArticle }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-border shadow-[0_12px_34px_rgba(15,23,42,0.12)] md:rounded-[2rem] xl:h-full">
      <Link href={`/noticias/${article.slug}`} className="group relative block min-h-[16rem] overflow-hidden sm:min-h-[18rem] md:min-h-[30rem] xl:h-full xl:min-h-0">
        <img src={getNewsImage(article)} alt={article.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/26 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-7 xl:p-8">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-primary-foreground md:px-4 md:py-1.5 md:text-[0.72rem]">
              {normalizeNewsCategory(article.category)}
            </span>
            {article.competition && (
              <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-foreground md:px-4 md:py-1.5 md:text-[0.72rem]">
                {article.competition}
              </span>
            )}
          </div>
          <h2 className="mt-3 max-w-3xl font-display text-[1.25rem] font-extrabold leading-[1.08] text-white sm:text-[1.45rem] md:mt-4 md:text-[2.6rem] xl:text-[3rem]">
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-white/82 md:mt-3 md:line-clamp-none md:text-base md:leading-8 xl:max-w-2xl">
            {article.excerpt}
          </p>
          <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-white/65 md:mt-4 md:text-sm">
            {article.author} · {timeAgo(article.date)}
          </p>
        </div>
      </Link>
    </article>
  )
}

function FeaturedSideCard({ article }: { article: NewsArticle }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem] xl:flex-1">
      <Link href={`/noticias/${article.slug}`} className="grid h-full grid-cols-[5.5rem_1fr] gap-3 p-3 sm:grid-cols-[9.5rem_1fr] sm:items-start md:gap-4 md:p-5 xl:h-full">
        <img src={getNewsImage(article)} alt={article.title} className="h-full min-h-[6.5rem] w-full rounded-[1rem] object-cover sm:min-h-[9.5rem] md:rounded-[1.35rem]" />
        <div className="flex h-full flex-col">
          <div>
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-primary">{normalizeNewsCategory(article.category)}</p>
            <h3 className="mt-2 line-clamp-3 max-w-md text-[0.98rem] font-extrabold leading-[1.22] tracking-[-0.02em] text-foreground md:mt-3 md:line-clamp-none md:text-[1.18rem] md:leading-[1.28]">
              {article.title}
            </h3>
          </div>
          <p className="mt-auto pt-3 text-xs text-muted-foreground md:pt-4 md:text-sm">{timeAgo(article.date)}</p>
        </div>
      </Link>
    </article>
  )
}
