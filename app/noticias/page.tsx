import { NoticiasPageClient } from "@/components/noticias-page-client"
import { getPreloadedFeaturedNews } from "@/lib/news-preload"

export const dynamic = "force-dynamic"

export default async function NoticiasPage() {
  const initialFeaturedNews = await getPreloadedFeaturedNews(3)

  return <NoticiasPageClient initialFeaturedNews={initialFeaturedNews} />
}
