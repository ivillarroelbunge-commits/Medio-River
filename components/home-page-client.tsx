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
import { useFastHomeNews } from "@/hooks/use-fast-home-news"
import { useFastNextMatch } from "@/hooks/use-fast-next-match"
import type { Match, NewsArticle } from "@/lib/data/types"
import { getCarouselNewsArticles } from "@/lib/news-carousel"

export function HomePageClient({
  initialFeaturedNews,
  initialLatestNews,
  initialNextMatch,
}: {
  initialFeaturedNews: NewsArticle[]
  initialLatestNews: NewsArticle[]
  initialNextMatch: Match | null
}) {
  const { news: appNews, matches, hasSyncedNews } = useAppState()
  const news = useFastHomeNews(appNews, hasSyncedNews, initialLatestNews)
  const nextMatch = useFastNextMatch(initialNextMatch)
  const carouselSource = hasSyncedNews && appNews.length > 0
    ? appNews
    : mergeUniqueNews([...initialFeaturedNews, ...news])
  const carouselItems = getCarouselNewsArticles(carouselSource, 5)
  const featured = carouselItems.length > 0 ? carouselItems : news.slice(0, 5)
  const latest = news.length > 0 ? news.slice(0, 6) : initialLatestNews.slice(0, 6)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-7 py-5 md:space-y-10 md:py-12">
          {featured.length > 0 ? (
            <NewsCarousel items={featured} matches={matches} />
          ) : (
            <div className="min-h-[17rem] animate-pulse rounded-[1.5rem] bg-muted md:min-h-[28rem] md:rounded-[2rem] lg:min-h-[30rem]" />
          )}

          {nextMatch && (
            <div className="grid items-stretch gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
              <HomeNextMatchPanel match={nextMatch} />
              <HomeTriviaPanel />
            </div>
          )}

          <section aria-label="Últimas noticias">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-[1.65rem] font-extrabold tracking-tight md:text-3xl">Últimas noticias</h2>
              </div>
              <Link href="/noticias" className="group hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
                Ver todas
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {latest.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-3">
                {latest.map((article) => (
                  <li key={article.id} className="flex">
                    <NewsCard article={article} match={article.matchId ? matches.find((match) => match.id === article.matchId) : undefined} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-[20rem] animate-pulse rounded-[1.4rem] bg-muted md:h-[25rem] md:rounded-[1.65rem]" />
                ))}
              </div>
            )}
          </section>

          <LatestTweetsSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function mergeUniqueNews(articles: NewsArticle[]) {
  return Array.from(new Map(articles.map((article) => [article.id, article])).values())
}
