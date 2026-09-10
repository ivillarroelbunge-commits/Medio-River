import { NoticiasPageClient } from "@/components/noticias-page-client"
import { getPreloadedFeaturedNews } from "@/lib/news-preload"

// News cards are refreshed client-side as soon as the page hydrates. Keeping the
// initial shell on ISR avoids paying a serverless TTFB on every navigation.
export const revalidate = 60

export default async function NoticiasPage() {
  const initialFeaturedNews = await getPreloadedFeaturedNews(3)

  return <NoticiasPageClient initialFeaturedNews={initialFeaturedNews} />
}
