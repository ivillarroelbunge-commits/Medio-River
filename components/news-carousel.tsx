"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage } from "@/lib/news-media"

export function NewsCarousel({ items }: { items: NewsArticle[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [items.length])

  useEffect(() => {
    setIndex(0)
  }, [items.map((item) => item.id).join("|")])

  const article = items[index]
  if (!article) return null

  const goPrevious = () => {
    setIndex((current) => (current - 1 + items.length) % items.length)
  }

  const goNext = () => {
    setIndex((current) => (current + 1) % items.length)
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-secondary text-secondary-foreground shadow-lg">
      <img src={getNewsImage(article)} alt={article.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/22 to-black/0" />

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Noticia anterior"
            onClick={goPrevious}
            className="absolute left-5 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/18 text-white backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white/28 hover:scale-[1.02] md:left-6 md:h-12 md:w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Noticia siguiente"
            onClick={goNext}
            className="absolute right-5 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/14 text-white backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white/24 hover:scale-[1.02] md:right-6 md:h-12 md:w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <Link
        href={`/noticias/${article.slug}`}
        className="relative block min-h-[20rem] px-8 pb-9 pl-16 pt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:min-h-[28rem] md:px-10 md:pb-12 md:pl-24 md:pt-10 lg:min-h-[30rem] lg:px-12 lg:pb-14 lg:pl-28"
      >
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/78 via-black/30 to-transparent md:h-[40%]" />
        <div className="relative flex min-h-[inherit] items-end">
          <div className="max-w-3xl pb-1 md:max-w-3xl lg:max-w-4xl">
            <span className="inline-flex rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-primary-foreground shadow-sm md:px-4.5 md:py-1.5">
              {article.category}
            </span>
            <h1 className="mt-4 max-w-3xl font-display text-xl font-extrabold leading-[1.08] text-white md:text-[2.35rem] lg:text-[2.85rem]">
              {article.title}
            </h1>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-white/82 md:text-sm md:leading-7 lg:max-w-3xl">
              {article.excerpt}
            </p>
          </div>
        </div>
      </Link>

      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-3 md:bottom-8">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.title}
              onClick={() => setIndex(itemIndex)}
              className={`h-2.5 rounded-full transition-all ${itemIndex === index ? "w-14 bg-primary" : "w-5 bg-white/55"}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
