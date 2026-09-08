import type { Metadata } from "next"
import { NoticiaDetalleClient } from "./noticia-detalle-client"
import { createClient } from "@/lib/supabase/server"
import { fetchNewsArticleBySlug } from "@/lib/supabase/news"
import { getNewsImage } from "@/lib/news-media"

const SITE_URL = "https://medioriver.com.ar"

type NoticiaPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NoticiaPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { article } = await fetchNewsArticleBySlug(supabase, slug)

  if (!article) {
    return {
      title: "Noticia no encontrada",
      robots: { index: false, follow: false },
    }
  }

  const articlePath = `/noticias/${encodeURIComponent(article.slug)}`
  const articleUrl = `${SITE_URL}${articlePath}`
  const description = article.excerpt?.trim() || article.intro?.trim() || "Actualidad de River Plate en Medio River."
  const socialImage = article.articleType === "player_ratings" && article.matchId
    ? `${SITE_URL}/api/social-card/noticia/${encodeURIComponent(article.slug)}`
    : toAbsoluteUrl(getNewsImage(article))

  return {
    title: article.title,
    description,
    alternates: {
      canonical: articlePath,
    },
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: "Medio River",
      locale: "es_AR",
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [socialImage],
    },
  }
}

export default function NoticiaDetallePage() {
  return <NoticiaDetalleClient />
}

function toAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, SITE_URL).toString()
}
