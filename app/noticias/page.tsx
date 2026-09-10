import { NoticiasPageClient } from "@/components/noticias-page-client"
import { getPreloadedFeaturedNews, getPreloadedLatestNews } from "@/lib/news-preload"

// News cards are refreshed client-side as soon as the page hydrates. Keeping the
// initial shell on ISR avoids paying a serverless TTFB on every navigation.
export const revalidate = 60

export default async function NoticiasPage() {
  const [initialFeaturedNews, initialLatestNews] = await Promise.all([
    getPreloadedFeaturedNews(3),
    getPreloadedLatestNews(18),
  ])

  return (
    <NoticiasPageClient
      initialFeaturedNews={initialFeaturedNews}
      initialLatestNews={initialLatestNews}
    />
  )
}
