"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HomeNextMatchPanel, HomeTriviaPanel } from "@/components/home-panels"
import { LatestTweetsSection } from "@/components/latest-tweets-section"
import { NewsCard } from "@/components/news-card"
import { NewsCarousel } from "@/components/news-carousel"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useAppState } from "@/components/app-state-provider"

export default function HomePage() {
  const { news, matches, isHydrated } = useAppState()
  const carouselItems = news.filter((article) => article.featured).slice(0, 5)
  const featured = carouselItems.length > 0 ? carouselItems : news.slice(0, 5)
  const latest = news.slice(0, 6)
  const nextMatch = matches.filter((match) => match.status === "upcoming").sort((a, b) => +new Date(a.date) - +new Date(b.date))[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-10 py-8 md:py-12">
          {isHydrated ? (
            <NewsCarousel items={featured} />
          ) : (
            <div className="min-h-[20rem] animate-pulse rounded-[2rem] bg-muted md:min-h-[28rem] lg:min-h-[30rem]" />
          )}

          {isHydrated && nextMatch && (
            <div className="grid items-stretch gap-6 md:grid-cols-2">
              <HomeNextMatchPanel match={nextMatch} />
              <HomeTriviaPanel />
            </div>
          )}

          <section aria-label="Últimas noticias">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cobertura</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Últimas noticias</h2>
              </div>
              <Link href="/noticias" className="group hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
                Ver todas
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isHydrated ? (
              <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((article) => (
                  <li key={article.id} className="flex">
                    <NewsCard article={article} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-[25rem] animate-pulse rounded-[1.65rem] bg-muted" />
                ))}
              </div>
            )}
          </section>

          {isHydrated && <LatestTweetsSection />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
