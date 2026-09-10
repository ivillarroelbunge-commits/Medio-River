import type { Metadata } from "next"
import { NoticiaDetalleClient } from "./noticia-detalle-client"
import { getPreloadedNewsArticle } from "@/lib/news-preload"

const SITE_URL = "https://medioriver.com.ar"

export const revalidate = 60

// New articles are generated on first request and then kept in the ISR cache.
export function generateStaticParams() {
  return []
}

type NoticiaPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NoticiaPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getPreloadedNewsArticle(slug)

  if (!article) {
    return {
      title: "Noticia no encontrada",
      robots: { index: false, follow: false },
    }
  }

  const articlePath = `/noticias/${encodeURIComponent(article.slug)}`
  const articleUrl = `${SITE_URL}${articlePath}`
  const description = article.excerpt.trim() || article.intro.trim() || "Actualidad de River Plate en Medio River."
  const socialImage = `${SITE_URL}/api/social-card/noticia/${encodeURIComponent(article.slug)}`

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

export default async function NoticiaDetallePage({ params }: NoticiaPageProps) {
  const { slug } = await params
  const initialArticle = await getPreloadedNewsArticle(slug)

  return <NoticiaDetalleClient initialArticle={initialArticle} />
}
