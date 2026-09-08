"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Button } from "@/components/ui/button"
import { readTriviaParticipant } from "@/lib/trivia-participant"

export function TriviaSaveProgress() {
  const { currentUser } = useAppState()
  const [hasGuestProgress, setHasGuestProgress] = useState(false)

  useEffect(() => {
    const checkProgress = () => {
      const participant = readTriviaParticipant()
      setHasGuestProgress(Boolean(participant?.name))
    }

    checkProgress()
    const interval = window.setInterval(checkProgress, 500)
    window.addEventListener("focus", checkProgress)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", checkProgress)
    }
  }, [])

  if (currentUser || !hasGuestProgress) return null

  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-5 text-center shadow-sm md:rounded-[2rem] md:p-7">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-xl font-extrabold md:text-2xl">Guardá tu progreso</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        Tus puntos ya están guardados en este navegador. Vinculalos a una cuenta para conservar tu mismo player y tu ranking si cambiás de dispositivo.
      </p>
      <div className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/registrarse?next=/trivia">Guardar mi progreso</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
          <Link href="/iniciar-sesion?next=/trivia">Ya tengo cuenta</Link>
        </Button>
      </div>
    </section>
  )
}
