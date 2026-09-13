import type { NewsArticle } from "@/lib/data/types"

export function isCarouselNewsArticle(article: NewsArticle) {
  return Boolean(article.featured || article.articleType === "player_ratings")
}

export function sortNewsByDateDesc(articles: NewsArticle[]) {
  return [...articles].sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function getCarouselNewsArticles(articles: NewsArticle[], limit: number) {
  return sortNewsByDateDesc(articles).filter(isCarouselNewsArticle).slice(0, limit)
}
