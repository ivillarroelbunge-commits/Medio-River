"use client"

import { useMemo, useState } from "react"
import { NewsCard } from "@/components/news-card"
import type { NewsArticle } from "@/lib/data/types"
import { defaultNewsCategories, normalizeNewsCategory } from "@/lib/news-taxonomy"
import { cn } from "@/lib/utils"

const defaultCategories = defaultNewsCategories
const defaultCompetitions = ["Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  const [tag, setTag] = useState("Todas")
  const [category, setCategory] = useState("Todas")
  const [competition, setCompetition] = useState("Todas")
  const categories = useMemo(() => ["Todas", ...mergeNewsOptions(defaultCategories, articles.map((article) => article.category))], [articles])
  const competitions = useMemo(() => ["Todas", ...mergeNewsOptions(defaultCompetitions, articles.map((article) => article.competition))], [articles])

  const filtered = useMemo(() => articles.filter((article) => {
    const tagMatch = tag === "Todas" || article.tag === tag
    const categoryMatch = category === "Todas" || normalizeNewsCategory(article.category) === category
    const competitionMatch = competition === "Todas" || article.competition === competition
    return tagMatch && categoryMatch && competitionMatch
  }), [articles, category, competition, tag])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <FilterRow label="Tipo" options={["Todas", "Información", "Opinión"]} value={tag} onChange={setTag} />
        <FilterRow label="Categoría" options={categories} value={category} onChange={setCategory} />
        <FilterRow label="Competencia" options={competitions} value={competition} onChange={setCompetition} />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => <NewsCard key={article.id} article={article} />)}
      </div>
    </div>
  )
}

function mergeNewsOptions(defaults: string[], values: Array<string | undefined>) {
  return Array.from(new Set([...defaults, ...values].filter((value): value is string => Boolean(value?.trim())).map((value) => normalizeNewsCategory(value)).filter(Boolean)))
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: any) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
