import Link from "next/link"
import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage } from "@/lib/news-media"
import { normalizeNewsCategory } from "@/lib/news-taxonomy"
import { timeAgo } from "@/lib/format"

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] md:rounded-[1.65rem]">
      <Link href={`/noticias/${article.slug}`} className="group flex h-full flex-col">
        <div className="relative">
          <img src={getNewsImage(article)} alt={article.title} className="h-36 w-full object-cover md:h-44" />
          <span className={`absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm md:left-4 md:top-4 md:px-3.5 md:py-1.5 md:text-xs ${article.tag === "Opinión" ? "bg-black" : "bg-primary"}`}>
            {article.tag}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-primary">
              {normalizeNewsCategory(article.category)}
            </span>
            {article.competition && (
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {article.competition}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-[1.16rem] font-extrabold leading-[1.18] tracking-[-0.025em] text-foreground md:mt-4 md:text-[1.45rem]">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground md:mt-3 md:line-clamp-none md:text-[0.95rem] md:leading-7">
            {article.excerpt}
          </p>

          <p className="mt-4 text-right text-xs text-muted-foreground md:mt-5 md:text-sm">
            {timeAgo(article.date)}
          </p>
        </div>
      </Link>
    </article>
  )
}
