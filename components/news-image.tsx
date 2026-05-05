import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage, getNewsImageStyle } from "@/lib/news-media"
import { cn } from "@/lib/utils"

export function NewsImage({
  article,
  className,
  imageClassName,
}: {
  article: NewsArticle
  className?: string
  imageClassName?: string
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={getNewsImage(article)}
        alt={article.title}
        className={cn("absolute inset-0 h-full w-full object-cover", imageClassName)}
        style={getNewsImageStyle(article)}
      />
    </div>
  )
}
