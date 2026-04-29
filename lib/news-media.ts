import type { NewsArticle } from "@/lib/data/types"

export function getNewsImage(article: NewsArticle) {
  return article.image?.trim() || "/placeholder.jpg"
}
