"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Copy, ImageDown, Link as LinkIcon, Loader2, MessageCircle, Twitter, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  buildFullRatingsText,
  buildXRatingsText,
  generateRatingsShareImage,
  getArticleShareUrl,
} from "@/lib/player-ratings-share"
import type { MatchRatingBallot } from "@/lib/supabase/player-ratings"
import { cn } from "@/lib/utils"

interface PlayerRatingsShareDialogProps {
  ballot: MatchRatingBallot
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerRatingsShareDialog({ ballot, open, onOpenChange }: PlayerRatingsShareDialogProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)

  function resetFeedback() {
    setMessage(null)
    setError(null)
  }

  async function handleCopyText() {
    try {
      resetFeedback()
      await copyToClipboard(buildFullRatingsText(ballot, getArticleShareUrl()))
      setMessage("¡Puntuaciones copiadas!")
      closeAfterFeedback(onOpenChange)
    } catch {
      setError("No se pudo copiar el texto. Probá nuevamente.")
    }
  }

  async function handleCopyLink() {
    try {
      resetFeedback()
      await copyToClipboard(getArticleShareUrl())
      setMessage("¡Enlace copiado!")
      closeAfterFeedback(onOpenChange)
    } catch {
      setError("No se pudo copiar el enlace. Probá nuevamente.")
    }
  }

  function handleShareX() {
    try {
      resetFeedback()
      const text = buildXRatingsText(ballot)
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      const popup = window.open(shareUrl, "_blank", "noopener,noreferrer")
      if (!popup) {
        return
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo preparar el texto para X.")
    }
  }

  function handleShareWhatsApp() {
    try {
      resetFeedback()
      const text = buildFullRatingsText(ballot, getArticleShareUrl())
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      const popup = window.open(shareUrl, "_blank", "noopener,noreferrer")
      if (!popup) {
        return
      }
      onOpenChange(false)
    } catch {
      setError("No se pudo preparar el mensaje de WhatsApp.")
    }
  }

  async function handleShareImage() {
    setImageBusy(true)
    resetFeedback()

    try {
      const image = await generateRatingsShareImage(ballot, getArticleShareUrl())
      const canShareFile = Boolean(
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [image.file] }),
      )

      if (canShareFile) {
        await navigator.share({
          files: [image.file],
          title: "Mis puntuaciones",
          text: "Mis puntuaciones de Medio River",
        })
        onOpenChange(false)
        return
      }

      const url = URL.createObjectURL(image.blob)
      const link = document.createElement("a")
      link.href = url
      link.download = image.fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1500)
      setMessage("Imagen descargada.")
      closeAfterFeedback(onOpenChange)
    } catch {
      setError("No se pudo generar la imagen para compartir.")
    } finally {
      setImageBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetFeedback()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="fixed bottom-0 left-0 top-auto max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl p-5 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl md:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">Compartir mis puntuaciones</DialogTitle>
          <DialogDescription>
            Elegí cómo querés compartir las notas que guardaste para este partido.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <ShareActionButton icon={imageBusy ? Loader2 : ImageDown} busy={imageBusy} onClick={handleShareImage}>
            Compartir imagen
          </ShareActionButton>
          <ShareActionButton icon={Twitter} onClick={handleShareX}>
            Compartir en X
          </ShareActionButton>
          <ShareActionButton icon={MessageCircle} onClick={handleShareWhatsApp}>
            Compartir por WhatsApp
          </ShareActionButton>
          <ShareActionButton icon={Copy} onClick={handleCopyText}>
            Copiar texto
          </ShareActionButton>
          <ShareActionButton icon={LinkIcon} onClick={handleCopyLink}>
            Copiar enlace
          </ShareActionButton>
        </div>

        {(message || error) && (
          <p className={cn("rounded-2xl px-3 py-2 text-sm font-semibold", error ? "bg-primary/10 text-primary" : "bg-success/10 text-success")}>
            {error ?? message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ShareActionButton({
  icon: Icon,
  busy = false,
  children,
  onClick,
}: {
  icon: LucideIcon
  busy?: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Button type="button" variant="outline" className="h-12 justify-start rounded-2xl" disabled={busy} onClick={onClick}>
      <Icon className={cn("h-4 w-4", busy && "animate-spin")} />
      {children}
    </Button>
  )
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  textarea.remove()
  if (!copied) throw new Error("copy failed")
}

function closeAfterFeedback(onOpenChange: (open: boolean) => void) {
  window.setTimeout(() => onOpenChange(false), 850)
}
