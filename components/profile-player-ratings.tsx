"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Star } from "lucide-react"
import { getOrCreatePlayerRatingDeviceId } from "@/lib/player-rating-device"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  fetchMyPlayerRatingSummary,
  type PlayerRatingSummary,
} from "@/lib/supabase/player-ratings"

export function ProfilePlayerRatings({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<PlayerRatingSummary[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const deviceId = getOrCreatePlayerRatingDeviceId()
    if (!deviceId) return

    setIsLoading(true)
    setError(null)
    const supabase = createSupabaseBrowserClient()

    void fetchMyPlayerRatingSummary(supabase, deviceId).then((result) => {
      if (!active) return
      setSummary(result.summary ?? [])
      setError(result.error)
      const newestYear = result.summary?.[0]?.seasonYear ?? null
      setSelectedYear((current) => current ?? newestYear)
      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [userId])

  const years = useMemo(
    () => Array.from(new Set(summary.map((row) => row.seasonYear))).sort((a, b) => b - a),
    [summary],
  )
  const visibleRows = useMemo(
    () => summary.filter((row) => row.seasonYear === selectedYear),
    [selectedYear, summary],
  )

  return (
    <section id="mis-puntuaciones" className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-6 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Mis puntuaciones</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">Cómo viste a cada jugador</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tu promedio personal se actualiza partido a partido con las notas que vas poniendo.
          </p>
        </div>
        {years.length > 1 && (
          <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            Temporada
            <select
              value={selectedYear ?? ""}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
            >
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando tus puntuaciones...
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-primary">{error}</p>
      ) : visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="font-semibold text-foreground">Todavía no tenés puntuaciones guardadas.</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Después de cada partido vas a poder calificar a quienes jugaron. Cuando lo hagas con tu cuenta, acá se irá armando tu evaluación de la temporada.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleRows.map((row) => (
            <article key={`${row.seasonYear}-${row.squadPlayerId ?? row.playerName}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 md:p-4">
              <PlayerAvatar name={row.playerName} image={row.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-extrabold text-foreground">{row.playerName}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {row.matchesRated} {row.matchesRated === 1 ? "partido puntuado" : "partidos puntuados"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-display text-2xl font-black tabular-nums">
                    {row.averageRating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Tu promedio</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function PlayerAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted font-display font-black text-primary">
      {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
    </div>
  )
}
