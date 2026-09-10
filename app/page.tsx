import { HomePageClient } from "@/components/home-page-client"
import { getPreloadedFeaturedNews } from "@/lib/news-preload"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const initialFeaturedNews = await getPreloadedFeaturedNews(5)

  return <HomePageClient initialFeaturedNews={initialFeaturedNews} />
}
