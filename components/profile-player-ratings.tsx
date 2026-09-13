"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CalendarDays, Loader2, Star, Trophy } from "lucide-react"
import { getOrCreatePlayerRatingDeviceId } from "@/lib/player-rating-device"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  fetchMyPlayerRatingSummary,
  readPlayerRatingSummaryCache,
  writePlayerRatingSummaryCache,
  type PlayerRatingHistoryRow,
  type PlayerRatingSummary,
} from "@/lib/supabase/player-ratings"

type AggregateRow = {
  squadPlayerId: string | null
  playerName: string
  image: string | null
  matchesRated: number
  averageRating: number
}

export function ProfilePlayerRatings({ userId }: { userId: string }) {
  const currentSeasonYear = useMemo(() => getCurrentSeasonYear(), [])
  const currentCompetition = useMemo(() => getCurrentLeagueCompetition(), [])
  const [summary, setSummary] = useState<PlayerRatingSummary[]>([])
  const [history, setHistory] = useState<PlayerRatingHistoryRow[]>([])
  const [selectedYear, setSelectedYear] = useState(currentSeasonYear)
  const [selectedCompetition, setSelectedCompetition] = useState(currentCompetition)
  const [selectedMatchId, setSelectedMatchId] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const deviceId = getOrCreatePlayerRatingDeviceId()
    const cached = readPlayerRatingSummaryCache(userId)

    if (cached) {
      setSummary(cached.summary)
      setHistory(cached.history)
      setIsLoading(false)
      setError(null)
    } else {
      setIsLoading(true)
      setError(null)
    }

    if (!deviceId) {
      if (!cached) {
        setIsLoading(false)
        setError("No se pudieron cargar tus puntuaciones en este dispositivo.")
      }
      return
    }

    if (cached?.isFresh) {
      return () => {
        active = false
      }
    }

    const supabase = createSupabaseBrowserClient()

    void fetchMyPlayerRatingSummary(supabase, deviceId).then((result) => {
      if (!active) return

      if (result.summary && result.history) {
        setSummary(result.summary)
        setHistory(result.history)
        writePlayerRatingSummaryCache(userId, result.summary, result.history)
        setError(null)
      } else if (!cached) {
        setError(result.error)
      }

      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [userId])

  const years = useMemo(
    () => Array.from(new Set([Number(currentSeasonYear), ...history.map((row) => row.seasonYear)])).sort((a, b) => b - a),
    [currentSeasonYear, history],
  )

  const competitions = useMemo(() => {
    const scoped = selectedYear === "all"
      ? history
      : history.filter((row) => row.seasonYear === Number(selectedYear))
    return Array.from(new Set(scoped.map((row) => row.competition))).sort((a, b) => a.localeCompare(b, "es"))
  }, [history, selectedYear])

  const matches = useMemo(() => {
    const byMatch = new Map<string, PlayerRatingHistoryRow>()

    for (const row of history) {
      if (selectedYear !== "all" && row.seasonYear !== Number(selectedYear)) continue
      if (selectedCompetition !== "all" && row.competition !== selectedCompetition) continue
      if (!byMatch.has(row.matchId)) byMatch.set(row.matchId, row)
    }

    return [...byMatch.values()].sort(
      (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime(),
    )
  }, [history, selectedCompetition, selectedYear])

  const filteredHistory = useMemo(
    () => history.filter((row) => {
      if (selectedYear !== "all" && row.seasonYear !== Number(selectedYear)) return false
      if (selectedCompetition !== "all" && row.competition !== selectedCompetition) return false
      if (selectedMatchId !== "all" && row.matchId !== selectedMatchId) return false
      return true
    }),
    [history, selectedCompetition, selectedMatchId, selectedYear],
  )

  const aggregateRows = useMemo<AggregateRow[]>(() => {
    if (selectedMatchId !== "all") return []

    const grouped = new Map<string, AggregateRow & { ratingSum: number }>()

    for (const row of filteredHistory) {
      const key = row.squadPlayerId ? `squad:${row.squadPlayerId}` : `name:${row.playerName.toLowerCase()}`
      const current = grouped.get(key) ?? {
        squadPlayerId: row.squadPlayerId,
        playerName: row.playerName,
        image: row.image,
        matchesRated: 0,
        averageRating: 0,
        ratingSum: 0,
      }

      current.ratingSum += row.rating
      current.matchesRated += 1
      grouped.set(key, current)
    }

    return [...grouped.values()]
      .map(({ ratingSum, ...row }) => ({
        ...row,
        averageRating: Number((ratingSum / row.matchesRated).toFixed(2)),
      }))
      .sort((a, b) => b.averageRating - a.averageRating || a.playerName.localeCompare(b.playerName, "es"))
  }, [filteredHistory, selectedMatchId])

  const exactRows = useMemo(
    () => selectedMatchId === "all"
      ? []
      : [...filteredHistory].sort((a, b) => b.rating - a.rating || a.playerName.localeCompare(b.playerName, "es")),
    [filteredHistory, selectedMatchId],
  )

  const selectedMatch = useMemo(
    () => matches.find((match) => match.matchId === selectedMatchId)
      ?? history.find((match) => match.matchId === selectedMatchId)
      ?? null,
    [history, matches, selectedMatchId],
  )

  const hasData = history.length > 0 || summary.length > 0

  return (
    <section id="mis-puntuaciones" className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-6 md:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Mis puntuaciones</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">Cómo viste a cada jugador</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Filtrá tus notas por año, torneo o partido. En un partido puntual vas a ver la nota exacta que le diste a cada jugador.
        </p>
      </div>

      {!isLoading && hasData && history.length > 0 && (
        <div className="grid gap-3 rounded-2xl border border-border bg-muted/25 p-3 md:grid-cols-3 md:p-4">
          <FilterSelect
            label="Año"
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value)
              setSelectedCompetition(value === currentSeasonYear ? currentCompetition : "all")
              setSelectedMatchId("all")
            }}
          >
            <option value="all">Todos</option>
            {years.map((year) => <option key={year} value={String(year)}>{year}</option>)}
          </FilterSelect>

          <FilterSelect
            label="Torneo"
            value={selectedCompetition}
            onChange={(value) => {
              setSelectedCompetition(value)
              setSelectedMatchId("all")
            }}
          >
            <option value="all">Todos</option>
            {competitions.map((competition) => (
              <option key={competition} value={competition}>{competition}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Partido"
            value={selectedMatchId}
            onChange={setSelectedMatchId}
          >
            <option value="all">Todos los partidos</option>
            {matches.map((match) => (
              <option key={match.matchId} value={match.matchId}>
                {formatShortDate(match.matchDate)} · vs {match.opponent}
              </option>
            ))}
          </FilterSelect>
        </div>
      )}

      {selectedMatch && selectedMatchId !== "all" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-display text-base font-extrabold text-foreground">River vs {selectedMatch.opponent}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatLongDate(selectedMatch.matchDate)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            {selectedMatch.competition}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando tus puntuaciones...
        </div>
      ) : error && !hasData ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-primary">{error}</p>
      ) : !hasData ? (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="font-semibold text-foreground">Todavía no tenés puntuaciones guardadas.</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Después de cada partido vas a poder calificar a quienes jugaron. Cuando lo hagas con tu cuenta, acá se irá armando tu evaluación.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="font-semibold text-foreground">No hay puntuaciones con estos filtros.</p>
          <p className="mt-1 text-sm text-muted-foreground">Probá cambiando el año, el torneo o el partido.</p>
        </div>
      ) : selectedMatchId !== "all" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {exactRows.map((row) => (
            <RatingCard
              key={`${row.matchId}-${row.squadPlayerId ?? row.playerName}`}
              name={row.playerName}
              image={row.image}
              supportingText={row.competition}
              value={row.rating.toLocaleString("es-AR")}
              valueLabel="Tu nota"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {aggregateRows.map((row) => (
            <RatingCard
              key={row.squadPlayerId ?? row.playerName}
              name={row.playerName}
              image={row.image}
              supportingText={`${row.matchesRated} ${row.matchesRated === 1 ? "partido puntuado" : "partidos puntuados"}`}
              value={row.averageRating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              valueLabel="Tu promedio"
            />
          ))}
        </div>
      )}
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary"
      >
        {children}
      </select>
    </label>
  )
}

function RatingCard({
  name,
  image,
  supportingText,
  value,
  valueLabel,
}: {
  name: string
  image: string | null
  supportingText: string
  value: string
  valueLabel: string
}) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-background p-3 md:p-4">
      <PlayerAvatar name={name} image={image} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-extrabold text-foreground">{name}</p>
        <p className="text-xs font-medium text-muted-foreground">{supportingText}</p>
      </div>
      <div className="min-w-[4.25rem] shrink-0 text-right md:min-w-[5rem]">
        <div className="flex items-center justify-end gap-1 text-primary">
          <Star className="h-3.5 w-3.5 fill-current md:h-4 md:w-4" />
          <span className="font-display text-xl font-black tabular-nums md:text-2xl">{value}</span>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.09em] text-muted-foreground md:text-[10px] md:tracking-[0.12em]">{valueLabel}</p>
      </div>
    </article>
  )
}

function PlayerAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted font-display font-black text-primary">
      {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
    </div>
  )
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  })
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  })
}

function getCurrentSeasonYear() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  })
}

function getCurrentLeagueCompetition() {
  const month = Number(new Date().toLocaleDateString("en-US", {
    month: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }))

  return month >= 7 ? "Torneo Clausura" : "Torneo Apertura"
}
