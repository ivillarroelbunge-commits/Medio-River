"use client"

import { useState } from "react"
import { Check, Link2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareButtonsProps {
  title: string
  slug: string
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/noticias/${slug}`
      : `/noticias/${slug}`

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
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Compartir
      </span>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="mr-1.5 h-4 w-4" />
          Twitter / X
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="mr-1.5 h-4 w-4 text-success" />
            ¡Copiado!
          </>
        ) : (
          <>
            <Link2 className="mr-1.5 h-4 w-4" />
            Copiar enlace
          </>
        )}
      </Button>
    </div>
  )
}
