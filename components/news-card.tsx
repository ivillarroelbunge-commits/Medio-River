import Link from "next/link"
import type { NewsArticle } from "@/lib/data/types"
import { getNewsImage } from "@/lib/news-media"
import { timeAgo } from "@/lib/format"

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[1.65rem] border border-border bg-card shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <Link href={`/noticias/${article.slug}`} className="group flex h-full flex-col">
        <div className="relative">
          <img src={getNewsImage(article)} alt={article.title} className="h-44 w-full object-cover" />
          <span className={`absolute left-4 top-4 inline-flex rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-white shadow-sm ${article.tag === "Opinión" ? "bg-black" : "bg-primary"}`}>
            {article.tag}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-primary">
              {article.category}
            </span>
            {article.competition && (
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {article.competition}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-[1.45rem] font-extrabold leading-[1.2] tracking-[-0.025em] text-foreground">
            {article.title}
          </h3>

          <p className="mt-3 flex-1 text-[0.95rem] leading-7 text-muted-foreground">
            {article.excerpt}
          </p>

          <p className="mt-5 text-right text-sm text-muted-foreground">
            {timeAgo(article.date)}
          </p>
        </div>
      </Link>
    </article>
  )
}
