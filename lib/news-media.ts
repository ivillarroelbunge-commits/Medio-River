import type { CSSProperties } from "react"
import type { NewsArticle } from "@/lib/data/types"

export function getNewsImage(article: NewsArticle) {
  return article.image?.trim() || "/placeholder.jpg"
}

export function getNewsImagePosition(article: NewsArticle) {
  const x = clampImageValue(article.imageFocusX, 50, 0, 100)
  const y = clampImageValue(article.imageFocusY, 50, 0, 100)
  return `${x}% ${y}%`
}

export function getNewsImageZoom(article: NewsArticle) {
  return clampImageValue(article.imageZoom, 1, 1, 2)
}

export function getNewsImageStyle(article: NewsArticle): CSSProperties {
  const position = getNewsImagePosition(article)
  const zoom = getNewsImageZoom(article)

  return {
    objectPosition: position,
    transform: zoom > 1 ? `scale(${zoom})` : undefined,
    transformOrigin: position,
  }
}

function clampImageValue(value: number | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, value))
}
