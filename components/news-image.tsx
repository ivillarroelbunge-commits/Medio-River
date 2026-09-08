import type { NewsArticle } from "@/lib/data/types"
import type { Match } from "@/lib/data/types"
import { getTeamCrest } from "@/lib/data"
import { getNewsImage, getNewsImageStyle } from "@/lib/news-media"
import { cn } from "@/lib/utils"

export function NewsImage({
  article,
  match,
  className,
  imageClassName,
}: {
  article: NewsArticle
  match?: Match
  className?: string
  imageClassName?: string
}) {
  if (article.articleType === "player_ratings" && match) {
    const homeTeam = match.isHome ? "River Plate" : match.opponent
    const awayTeam = match.isHome ? match.opponent : "River Plate"

    return (
      <div className={cn("relative overflow-hidden bg-white", className)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.08),transparent_42%)]" />
        <div className="absolute inset-y-[18%] left-1/2 w-px -translate-x-1/2 bg-border" />
        <div className="relative grid h-full w-full grid-cols-2 items-center">
          <div className="flex h-full items-center justify-center px-5">
            <img src={getTeamCrest(homeTeam)} alt={homeTeam} className={cn("max-h-[62%] max-w-[68%] object-contain", imageClassName)} />
          </div>
          <div className="flex h-full items-center justify-center px-5">
            <img src={getTeamCrest(awayTeam)} alt={awayTeam} className={cn("max-h-[62%] max-w-[68%] object-contain", imageClassName)} />
          </div>
        </div>
      </div>
    )
  }

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
