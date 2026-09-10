import { HomePageClient } from "@/components/home-page-client"
import { getPreloadedMatches, getUpcomingFromMatches } from "@/lib/matches-preload"
import { getPreloadedFeaturedNews, getPreloadedLatestNews } from "@/lib/news-preload"

// Keep the homepage on Vercel's CDN and refresh the server snapshot frequently.
// Client subscriptions still refresh content in the background.
export const revalidate = 60

export default async function HomePage() {
  const [initialFeaturedNews, initialLatestNews, initialMatches] = await Promise.all([
    getPreloadedFeaturedNews(5),
    getPreloadedLatestNews(12),
    getPreloadedMatches(),
  ])
  const initialNextMatch = getUpcomingFromMatches(initialMatches)[0] ?? null

  return (
    <HomePageClient
      initialFeaturedNews={initialFeaturedNews}
      initialLatestNews={initialLatestNews}
      initialNextMatch={initialNextMatch}
    />
  )
}
