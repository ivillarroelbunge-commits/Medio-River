"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Eye, EyeOff, Loader2, Share2, User, UserRoundPlus } from "lucide-react"
import { PlayerRatingsShareDialog } from "@/components/player-ratings-share-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getOrCreatePlayerRatingDeviceId } from "@/lib/player-rating-device"
import { getShareableRatings } from "@/lib/player-ratings-share"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  fetchMatchRatingBallot,
  submitMatchPlayerRatings,
  type MatchRatingBallot,
} from "@/lib/supabase/player-ratings"
import { cn } from "@/lib/utils"

const PENDING_RATINGS_PREFIX = "medio-river-pending-player-ratings-v1"
const BA_TIME_ZONE = "America/Argentina/Buenos_Aires"

export function PlayerRatingsArticle({ matchId }: { matchId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [ballot, setBallot] = useState<MatchRatingBallot | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submitChoiceOpen, setSubmitChoiceOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBallot = useCallback(async () => {
    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return null

    const supabase = createSupabaseBrowserClient()
    const result = await fetchMatchRatingBallot(supabase, matchId, deviceId)

    if (result.ballot) {
      setBallot(result.ballot)
      setError(result.error)
      setRatings({})

      if (!isBallotOpen(result.ballot)) {
        clearPendingAccountRatings(matchId)
        setSubmitChoiceOpen(false)
        setShowResults(true)
      } else if (result.ballot.players.length > 0 && result.ballot.players.every((player) => player.myRating !== null)) {
        setShowResults(true)
      }
    } else {
      setError(result.error)
    }

    return result.ballot
  }, [matchId])

  useEffect(() => {
    let active = true
    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return

    const supabase = createSupabaseBrowserClient()
    setIsLoading(true)
    setError(null)

    void (async () => {
      const [authResult, ballotResult] = await Promise.all([
        supabase.auth.getUser(),
        fetchMatchRatingBallot(supabase, matchId, deviceId),
      ])

      if (!active) return

      const userIsAuthenticated = Boolean(authResult.data.user)
      setIsAuthenticated(userIsAuthenticated)
      setBallot(ballotResult.ballot)
      setError(ballotResult.error)
      setRatings({})

      if (!ballotResult.ballot) {
        setIsLoading(false)
        return
      }

      if (!isBallotOpen(ballotResult.ballot)) {
        clearPendingAccountRatings(matchId)
        setShowResults(true)
        setIsLoading(false)
        return
      }

      const pendingRatings = getPendingAccountRatings(matchId)

      if (pendingRatings && Object.keys(pendingRatings).length > 0 && userIsAuthenticated) {
        setIsSubmitting(true)
        const submitResult = await submitMatchPlayerRatings(supabase, matchId, deviceId, pendingRatings)
        if (!active) return

        setIsSubmitting(false)

        if (!submitResult.error && submitResult.ballot) {
          setBallot(submitResult.ballot)
          setRatings({})
          setShowResults(true)
          clearPendingAccountRatings(matchId)
          setIsLoading(false)
          return
        }

        if (submitResult.error?.includes("cerró")) {
          clearPendingAccountRatings(matchId)
          await refreshBallot()
          if (!active) return
          setIsLoading(false)
          return
        }

        setError(submitResult.error ?? "No se pudieron guardar las puntuaciones.")
      }

      if (ballotResult.ballot.players.every((player) => player.myRating !== null)) {
        setShowResults(true)
      }

      setIsLoading(false)
    })()

    return () => {
      active = false
    }
  }, [matchId, refreshBallot])

  useEffect(() => {
    if (!ballot || !isBallotOpen(ballot)) return

    const closesAtMs = getBallotClosesAtMs(ballot)
    if (closesAtMs === null) return

    const delay = closesAtMs - Date.now()
    const refreshAfterClose = () => {
      void refreshBallot()
    }

    if (delay <= 0) {
      refreshAfterClose()
      return
    }

    const timeout = window.setTimeout(refreshAfterClose, Math.min(delay + 500, 2_147_483_647))
    return () => window.clearTimeout(timeout)
  }, [ballot, refreshBallot])

  const selectedCount = Object.keys(ratings).length
  const savedCount = ballot?.players.filter((player) => player.myRating !== null).length ?? 0
  const totalPlayers = ballot?.players.length ?? 0
  const completedCount = savedCount + selectedCount
  const missingCount = Math.max(0, totalPlayers - completedCount)
  const votingClosed = ballot ? !isBallotOpen(ballot) : false
  const userCompletedBallot = totalPlayers > 0 && savedCount === totalPlayers
  const canSubmit = Boolean(ballot && isBallotOpen(ballot)) && totalPlayers > 0 && completedCount === totalPlayers && selectedCount > 0
  const resultsMode = votingClosed || userCompletedBallot
  const shareableRatings = ballot ? getShareableRatings(ballot) : null
  const canShareRatings = Boolean(shareableRatings)
  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`
  const loginHref = `/iniciar-sesion?next=${encodeURIComponent(returnTo)}`
  const registerHref = `/registrarse?next=${encodeURIComponent(returnTo)}`

  const totalVotes = useMemo(() => {
    if (!ballot) return 0
    return Math.max(0, ...ballot.players.map((player) => player.ratingCount))
  }, [ballot])

  const figurePlayerIds = useMemo(() => {
    const figures = new Set<string>()
    if (!ballot || isBallotOpen(ballot)) return figures

    const ratedPlayers = ballot.players.filter((player) => player.ratingCount > 0 && player.averageRating !== null)
    if (!ratedPlayers.length) return figures

    const bestAverage = Math.max(...ratedPlayers.map((player) => player.averageRating ?? Number.NEGATIVE_INFINITY))
    for (const player of ratedPlayers) {
      if (player.averageRating === bestAverage) figures.add(player.id)
    }

    return figures
  }, [ballot])

  const submitRatings = useCallback(async (ratingsToSubmit = ratings) => {
    if (!ballot || !isBallotOpen(ballot)) {
      clearPendingAccountRatings(matchId)
      await refreshBallot()
      return
    }

    const nextRatings = getSubmittableRatings(ballot, ratingsToSubmit)
    if (!nextRatings || isSubmitting) return

    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return

    setIsSubmitting(true)
    setError(null)
    const supabase = createSupabaseBrowserClient()
    const result = await submitMatchPlayerRatings(supabase, matchId, deviceId, nextRatings)
    setIsSubmitting(false)

    if (result.error || !result.ballot) {
      if (result.error?.includes("cerró")) {
        clearPendingAccountRatings(matchId)
        await refreshBallot()
      }
      setError(result.error ?? "No se pudieron guardar las puntuaciones.")
      return
    }

    setBallot(result.ballot)
    setRatings({})
    setShowResults(true)
    setSubmitChoiceOpen(false)
    clearPendingAccountRatings(matchId)
  }, [ballot, isSubmitting, matchId, ratings, refreshBallot])

  async function handleSubmit() {
    if (!canSubmit || isSubmitting || !ballot || !isBallotOpen(ballot)) return

    if (!isAuthenticated) {
      setSubmitChoiceOpen(true)
      return
    }

    await submitRatings()
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

  if (resultsMode) {
    return (
      <>
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-[linear-gradient(135deg,rgba(220,38,38,0.1),transparent_58%)] p-5 md:p-7">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                  {votingClosed ? "Puntuación de los hinchas" : "Puntuaciones enviadas"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                  {votingClosed ? "Así puntuó la gente a los jugadores de River" : "Así los puntuó la gente"}
                </h2>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  {totalVotes === 1 ? "1 hincha participó" : `${totalVotes} hinchas participaron`}
                </p>
                {canShareRatings && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 h-10 rounded-full bg-background/80 px-4"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir mis puntuaciones
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {ballot.players.map((player) => {
              const isFigure = figurePlayerIds.has(player.id)

              return (
                <div
                  key={player.id}
                  className={cn(
                    "p-4 md:p-5",
                    isFigure && "bg-primary/5 ring-1 ring-inset ring-primary/15",
                  )}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <PlayerAvatar name={player.name} image={player.image} />

                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        {isFigure && (
                          <span className="mb-1 inline-flex w-fit rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.08em] text-primary-foreground">
                            Figura del partido
                          </span>
                        )}
                        <div className="min-w-0 md:flex md:items-baseline md:gap-2">
                          <h3 className="truncate font-display text-lg font-extrabold text-foreground md:text-xl">{player.name}</h3>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground md:mt-0 md:shrink-0 md:text-sm">
                            {player.starter ? "Titular" : player.enteredMinute ? `Ingresó a los ${player.enteredMinute}'` : "Ingresó desde el banco"}
                          </p>
                        </div>
                      </div>

                      {player.myRating !== null && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1">
                          <span className="text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted-foreground md:text-xs">Tu nota</span>
                          <span className="font-display text-base font-black tabular-nums text-foreground md:text-lg">{player.myRating}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Promedio</p>
                      <p className="mt-0.5 font-display text-4xl font-black leading-none tabular-nums text-primary md:text-5xl">
                        {player.averageRating === null
                          ? "—"
                          : player.averageRating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {canShareRatings && (
          <PlayerRatingsShareDialog ballot={ballot} open={shareOpen} onOpenChange={setShareOpen} />
        )}
      </>
    )
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-[linear-gradient(135deg,rgba(220,38,38,0.08),transparent_55%)] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Tu opinión</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Poneles nota a los jugadores</h2>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              {totalVotes === 1 ? "1 hincha participó" : `${totalVotes} hinchas participaron`} en esta votación.
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
          const locked = player.myRating !== null
          const selected = locked ? player.myRating : ratings[player.id]

          return (
            <div key={player.id} className="p-4 md:p-5">
              <div className="flex items-start gap-3 md:gap-4">
                <PlayerAvatar name={player.name} image={player.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 md:flex md:items-baseline md:gap-2">
                        <h3 className="truncate font-display text-lg font-extrabold text-foreground md:text-xl">{player.name}</h3>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground md:mt-0 md:shrink-0 md:text-sm">
                          {player.starter ? "Titular" : player.enteredMinute ? `Ingresó a los ${player.enteredMinute}'` : "Ingresó desde el banco"}
                        </p>
                    </div>
                    {showResults && (
                      <div className="shrink-0 text-right">
                        <p className="font-display text-2xl font-black tabular-nums text-primary md:text-3xl">
                          {player.averageRating === null ? "—" : player.averageRating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        disabled={locked}
                        aria-label={locked
                          ? `Nota definitiva de ${player.name}: ${player.myRating}`
                          : `Puntuar a ${player.name} con ${rating}`}
                        aria-pressed={selected === rating}
                        onClick={() => {
                          if (locked) return
                          setRatings((current) => ({ ...current, [player.id]: rating }))
                        }}
                        className={cn(
                          "h-9 rounded-xl border text-sm font-extrabold tabular-nums transition-colors md:h-10",
                          selected === rating
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5",
                          locked && selected !== rating && "cursor-not-allowed opacity-45 hover:border-border hover:bg-background",
                          locked && selected === rating && "cursor-not-allowed",
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {completedCount} de {totalPlayers} jugadores puntuados
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {missingCount === 0
                ? "Listo. Ya podés enviar tus puntuaciones."
                : `Te ${missingCount === 1 ? "falta" : "faltan"} ${missingCount} ${missingCount === 1 ? "jugador" : "jugadores"} por puntuar.`}
            </p>
          </div>
          <Button
            type="button"
            className="h-11 rounded-full px-6"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Enviar mis puntuaciones"}
          </Button>
        </div>
        </div>
      </section>

      <Dialog open={submitChoiceOpen && Boolean(ballot && isBallotOpen(ballot))} onOpenChange={setSubmitChoiceOpen}>
        <DialogContent className="rounded-3xl p-5 sm:max-w-md md:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">¿Cómo querés puntuar?</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Si puntuás como <strong className="font-bold text-foreground">invitado</strong>, tus notas se registran solo para esta votación. Si ingresás con una <strong className="font-bold text-foreground">cuenta</strong>, tus puntuaciones quedan guardadas en tu <strong className="font-bold text-foreground">perfil</strong> y se suman a tu <strong className="font-bold text-foreground">historial</strong> para consultar, con el tiempo, cómo evaluaste el rendimiento de cada jugador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button type="button" className="h-11 rounded-full" disabled={isSubmitting} onClick={() => submitRatings()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
              Puntuar como invitado
            </Button>
            <Button asChild type="button" variant="outline" className="h-11 rounded-full">
              <Link href={loginHref} onClick={() => savePendingAccountRatings(matchId, ratings)}>
                <UserRoundPlus className="h-4 w-4" />
                Puntuar con una cuenta
              </Link>
            </Button>
          </div>
          <DialogFooter className="sm:justify-center">
            <p className="text-center text-xs text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href={registerHref} className="font-semibold text-primary hover:underline" onClick={() => savePendingAccountRatings(matchId, ratings)}>
                Creala acá
              </Link>
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PlayerAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted font-display text-lg font-black text-primary md:h-16 md:w-16">
      {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
    </div>
  )
}

function isBallotOpen(ballot: MatchRatingBallot) {
  if (ballot.isOpen === false) return false

  const closesAtMs = getBallotClosesAtMs(ballot)
  if (closesAtMs === null) return ballot.isOpen !== false

  return Date.now() < closesAtMs
}

function getBallotClosesAtMs(ballot: MatchRatingBallot) {
  const providedClosesAt = ballot.closesAt ? new Date(ballot.closesAt).getTime() : Number.NaN
  if (Number.isFinite(providedClosesAt)) return providedClosesAt

  const fallbackClosesAt = getRatingClosesAt(ballot.match.date)?.getTime()
  return Number.isFinite(fallbackClosesAt) ? fallbackClosesAt : null
}

function getRatingClosesAt(matchDate: string) {
  const match = new Date(matchDate)
  if (Number.isNaN(match.getTime())) return null

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BA_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(match)

  const year = Number(parts.find((part) => part.type === "year")?.value)
  const month = Number(parts.find((part) => part.type === "month")?.value)
  const day = Number(parts.find((part) => part.type === "day")?.value)
  if (!year || !month || !day) return null

  return new Date(Date.UTC(year, month - 1, day + 1, 15, 0, 0))
}

function pendingRatingsKey(matchId: string) {
  return `${PENDING_RATINGS_PREFIX}:${matchId}`
}

function savePendingAccountRatings(matchId: string, ratings: Record<string, number>) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(
    pendingRatingsKey(matchId),
    JSON.stringify({
      matchId,
      ratings,
      savedAt: Date.now(),
    }),
  )
}

function getPendingAccountRatings(matchId: string) {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(pendingRatingsKey(matchId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as { matchId?: unknown; ratings?: unknown }
    if (parsed.matchId !== matchId || !parsed.ratings || typeof parsed.ratings !== "object") return null

    return Object.fromEntries(
      Object.entries(parsed.ratings).filter((entry): entry is [string, number] => {
        const [, value] = entry
        return Number.isInteger(value) && value >= 1 && value <= 10
      }),
    )
  } catch {
    clearPendingAccountRatings(matchId)
    return null
  }
}

function clearPendingAccountRatings(matchId: string) {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(pendingRatingsKey(matchId))
}

function getSubmittableRatings(ballot: MatchRatingBallot | null, ratings: Record<string, number>) {
  if (!ballot) return null

  const unsavedPlayers = ballot.players.filter((player) => player.myRating === null)
  if (!unsavedPlayers.length) return null

  const nextRatings: Record<string, number> = {}
  for (const player of unsavedPlayers) {
    const rating = ratings[player.id]
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) return null
    nextRatings[player.id] = rating
  }

  return nextRatings
}
