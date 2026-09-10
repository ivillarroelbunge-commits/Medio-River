import { HomePageClient } from "@/components/home-page-client"
import { getPreloadedFeaturedNews, getPreloadedLatestNews } from "@/lib/news-preload"

// Keep the homepage on Vercel's CDN and refresh the server snapshot frequently.
// The client still refreshes news in the background, so this removes request-time
// rendering without making the visible feed feel stale.
export const revalidate = 60

export default async function HomePage() {
  const [initialFeaturedNews, initialLatestNews] = await Promise.all([
    getPreloadedFeaturedNews(5),
    getPreloadedLatestNews(12),
  ])

  return (
    <HomePageClient
      initialFeaturedNews={initialFeaturedNews}
      initialLatestNews={initialLatestNews}
    />
  )
}
