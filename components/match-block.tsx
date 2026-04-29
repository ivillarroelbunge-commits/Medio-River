import Link from "next/link"
import { Calendar, Clock, MapPin, Tv } from "lucide-react"
import type { Match } from "@/lib/mock-data"
import {
  formatTime,
  formatWeekdayDate,
  isSameDay,
} from "@/lib/format"
import { Button } from "@/components/ui/button"
import { TeamCrest } from "@/components/team-crest"

interface MatchBlockProps {
  match: Match
}

export function MatchBlock({ match }: MatchBlockProps) {
  const matchDate = new Date(match.date)
  const playsToday = isSameDay(matchDate, new Date())

  if (playsToday) {
    return (
      <section
        aria-label="River juega hoy"
        className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg"
      >
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-foreground" />
              </span>
              Hoy juega River Plate
            </div>
            <div className="mt-4 flex items-center gap-3">
              <TeamCrest
                team="River Plate"
                size="lg"
                className="bg-primary-foreground ring-primary-foreground/40"
              />
              <span className="font-display text-xl font-extrabold text-primary-foreground/70 md:text-2xl">
                VS
              </span>
              <TeamCrest
                team={match.opponent}
                size="lg"
                className="bg-primary-foreground ring-primary-foreground/40"
              />
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-balance md:text-5xl">
              River Plate vs. {match.opponent}
            </h2>
            <p className="mt-2 text-sm uppercase tracking-wider text-primary-foreground/85 md:text-base">
              {match.competition}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:flex md:flex-col md:items-end md:gap-2">
            <InfoChip icon={<Clock className="h-4 w-4" />} label={formatTime(match.date) + " hs"} />
            {match.tvChannel && (
              <InfoChip icon={<Tv className="h-4 w-4" />} label={match.tvChannel} />
            )}
            <InfoChip
              icon={<MapPin className="h-4 w-4" />}
              label={match.isHome ? "Local" : "Visitante"}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Próximo partido"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Próximo partido
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-balance md:text-3xl">
            River vs. {match.opponent}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {match.competition} · {match.isHome ? "Local" : "Visitante"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<Calendar className="h-4 w-4" />}
            value={formatWeekdayDate(match.date)}
            label="Fecha"
          />
          <InfoTile
            icon={<Clock className="h-4 w-4" />}
            value={formatTime(match.date) + " hs"}
            label="Hora"
          />
          {match.tvChannel && (
            <InfoTile
              icon={<Tv className="h-4 w-4" />}
              value={match.tvChannel}
              label="TV"
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/fixture">Ver fixture</Link>
        </Button>
      </div>
    </section>
  )
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm ring-1 ring-primary-foreground/20">
      {icon}
      {label}
    </span>
  )
}

function InfoTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
