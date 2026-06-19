"use client"

import { useEffect, useState } from "react"
import { Check, Link2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareButtonsProps {
  title: string
  slug: string
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState(`/noticias/${slug}`)

  useEffect(() => {
    setUrl(`${window.location.origin}/noticias/${slug}`)
  }, [slug])

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground sm:shrink-0">
        Compartir
      </span>
      <div className="flex min-w-0 flex-nowrap gap-2">
        <Button asChild variant="outline" size="sm" className="h-9 min-w-0 flex-1 rounded-full px-3 text-xs sm:flex-none sm:px-4 sm:text-sm">
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
            <Twitter className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
            Twitter / X
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 min-w-0 flex-1 rounded-full px-3 text-xs sm:flex-none sm:px-4 sm:text-sm"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4 shrink-0 text-success sm:mr-1.5" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Link2 className="mr-1 h-4 w-4 shrink-0 sm:mr-1.5" />
              Copiar enlace
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
