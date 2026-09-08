"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrCreatePlayerRatingDeviceId } from "@/lib/player-rating-device"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  fetchMatchRatingBallot,
  submitMatchPlayerRatings,
  type MatchRatingBallot,
} from "@/lib/supabase/player-ratings"
import { cn } from "@/lib/utils"

export function PlayerRatingsArticle({ matchId }: { matchId: string }) {
  const [ballot, setBallot] = useState<MatchRatingBallot | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return

    const supabase = createSupabaseBrowserClient()
    setIsLoading(true)
    setError(null)

    void Promise.all([
      supabase.auth.getUser(),
      fetchMatchRatingBallot(supabase, matchId, deviceId),
    ]).then(([authResult, ballotResult]) => {
      if (!active) return

      setIsAuthenticated(Boolean(authResult.data.user))
      setBallot(ballotResult.ballot)
      setError(ballotResult.error)

      if (ballotResult.ballot) {
        const previousRatings = Object.fromEntries(
          ballotResult.ballot.players
            .filter((player) => player.myRating !== null)
            .map((player) => [player.id, player.myRating as number]),
        )
        setRatings(previousRatings)
        if (Object.keys(previousRatings).length > 0) setShowResults(true)
      }

      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [matchId])

  const selectedCount = Object.keys(ratings).length
  const totalVotes = useMemo(() => {
    if (!ballot) return 0
    return Math.max(0, ...ballot.players.map((player) => player.ratingCount))
  }, [ballot])

  async function handleSubmit() {
    if (!selectedCount || isSubmitting) return

    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return

    setIsSubmitting(true)
    setError(null)
    const supabase = createSupabaseBrowserClient()
    const result = await submitMatchPlayerRatings(supabase, matchId, deviceId, ratings)
    setIsSubmitting(false)

    if (result.error || !result.ballot) {
      setError(result.error ?? "No se pudieron guardar las puntuaciones.")
      return
    }

    setBallot(result.ballot)
    setRatings(Object.fromEntries(
      result.ballot.players
        .filter((player) => player.myRating !== null)
        .map((player) => [player.id, player.myRating as number]),
    ))
    setSubmitted(true)
    setShowResults(true)
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
        <div className="flex min-h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando jugadores...
        </div>
      </section>
    )
  }

  if (!ballot || ballot.players.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
        <p className="text-sm text-muted-foreground">Las puntuaciones todavía no están disponibles para este partido.</p>
        {error && <p className="mt-2 text-sm font-medium text-primary">{error}</p>}
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-[linear-gradient(135deg,rgba(220,38,38,0.08),transparent_55%)] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Tu opinión</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Poneles nota a los jugadores</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Del 1 al 10. Podés puntuar sólo a los que quieras. Los promedios de la gente permanecen ocultos hasta que decidas verlos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full md:w-auto"
            onClick={() => setShowResults((current) => !current)}
          >
            {showResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showResults ? "Ocultar promedios" : "Ver puntuaciones de la gente"}
          </Button>
        </div>
        {showResults && totalVotes > 0 && (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Los promedios se actualizan con cada voto.
          </p>
        )}
      </div>

      <div className="divide-y divide-border">
        {ballot.players.map((player) => {
          const selected = ratings[player.id]
          return (
            <div key={player.id} className="p-4 md:p-5">
              <div className="flex items-start gap-3 md:gap-4">
                <PlayerAvatar name={player.name} image={player.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-extrabold text-foreground md:text-xl">{player.name}</h3>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground md:text-sm">
                        {player.starter ? "Titular" : player.enteredMinute ? `Ingresó a los ${player.enteredMinute}'` : "Ingresó desde el banco"}
                        {player.position ? ` · ${player.position}` : ""}
                      </p>
                    </div>
                    {showResults && (
                      <div className="shrink-0 text-right">
                        <p className="font-display text-2xl font-black tabular-nums text-primary md:text-3xl">
                          {player.averageRating === null ? "—" : player.averageRating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {player.ratingCount === 1 ? "1 voto" : `${player.ratingCount} votos`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        aria-label={`Puntuar a ${player.name} con ${rating}`}
                        aria-pressed={selected === rating}
                        onClick={() => setRatings((current) => ({ ...current, [player.id]: rating }))}
                        className={cn(
                          "h-9 rounded-xl border text-sm font-extrabold tabular-nums transition-colors md:h-10",
                          selected === rating
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5",
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>

                  {showResults && player.myRating !== null && (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      Tu nota guardada: <span className="text-foreground">{player.myRating}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border bg-muted/25 p-4 md:p-5">
        {error && (
          <p className="mb-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">{error}</p>
        )}
        {submitted && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isAuthenticated
                ? "Tus puntuaciones quedaron guardadas en tu historial."
                : "Tus puntuaciones quedaron guardadas en este dispositivo. Si iniciás sesión más adelante desde acá, las sumamos a tu historial."}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedCount === 0
              ? "Elegí al menos una puntuación."
              : `${selectedCount} ${selectedCount === 1 ? "jugador puntuado" : "jugadores puntuados"} de ${ballot.players.length}.`}
          </p>
          <Button
            type="button"
            className="h-11 rounded-full px-6"
            disabled={selectedCount === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Enviar mis puntuaciones"}
          </Button>
        </div>
      </div>
    </section>
  )
}

function PlayerAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted font-display text-lg font-black text-primary md:h-16 md:w-16">
      {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
    </div>
  )
}
