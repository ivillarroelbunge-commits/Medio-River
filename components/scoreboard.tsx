"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Tv } from "lucide-react"
import type { Match } from "@/lib/mock-data"
import { formatTime, formatWeekdayDate } from "@/lib/format"
import { TeamCrest } from "@/components/team-crest"

interface ScoreboardProps {
  match: Match
  variant?: "hero" | "compact"
}

function getDiff(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true }
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return { d, h, m, s, ended: false }
}

export function Scoreboard({ match, variant = "hero" }: ScoreboardProps) {
  const [countdown, setCountdown] = useState(() => getDiff(match.date))
  const [mounted, setMounted] = useState(false)
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCountdown(getDiff(match.date))
    }, 1000)
    return () => clearInterval(interval)
  }, [match.date])

  if (variant === "compact") {
    return (
      <section
        aria-label="Próximo partido"
        className="relative overflow-hidden rounded-2xl bg-secondary text-secondary-foreground shadow-sm"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
        />

        <div className="relative grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <TeamCrest team={homeTeam} size="sm" className="md:h-12 md:w-12" />
              <span className="font-display text-base font-extrabold tracking-wider text-secondary-foreground/80 md:text-lg">
                VS
              </span>
              <TeamCrest team={awayTeam} size="sm" className="md:h-12 md:w-12" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary-foreground/70">
                <span className="h-1 w-6 rounded-full bg-primary" aria-hidden="true" />
                Próximo partido
              </div>
              <h2 className="mt-1 font-display text-lg font-extrabold leading-tight md:truncate md:text-2xl">
                {homeTeam} vs. {awayTeam}
              </h2>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-secondary-foreground/60">
                {match.competition} · {match.isHome ? "Local" : "Visitante"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:gap-x-4 md:text-sm">
              <InfoInline
                icon={<Calendar className="h-3.5 w-3.5" />}
                value={formatWeekdayDate(match.date)}
              />
              <InfoInline
                icon={<Clock className="h-3.5 w-3.5" />}
                value={`${formatTime(match.date)} hs`}
              />
              {match.tvChannel && (
                <InfoInline
                  icon={<Tv className="h-3.5 w-3.5" />}
                  value={match.tvChannel}
                />
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <CountdownMini value={mounted ? countdown.d : 0} label="D" />
              <CountdownMini value={mounted ? countdown.h : 0} label="H" />
              <CountdownMini value={mounted ? countdown.m : 0} label="M" />
              <CountdownMini value={mounted ? countdown.s : 0} label="S" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Próximo partido"
      className="relative overflow-hidden rounded-2xl bg-secondary text-secondary-foreground shadow-lg"
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-30">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative p-6 md:p-10">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground/70">
          <span className="h-1 w-8 rounded-full bg-primary" />
          Próximo partido · {match.competition}
        </div>

        <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <TeamRow name="River Plate" home={match.isHome} accent />
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold tracking-widest md:text-5xl">
              VS
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-secondary-foreground/60">
              {match.isHome ? "Local" : "Visitante"}
            </p>
          </div>
          <TeamRow name={match.opponent} home={!match.isHome} />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="Fecha" value={formatWeekdayDate(match.date)} />
          <InfoTile icon={<Clock className="h-4 w-4" />} label="Hora" value={`${formatTime(match.date)} hs`} />
          {match.tvChannel && <InfoTile icon={<Tv className="h-4 w-4" />} label="TV" value={match.tvChannel} />}
          <InfoTile icon={<MapPin className="h-4 w-4" />} label="Estadio" value={match.stadium} />
        </div>

        {/* Countdown */}
        <div className="mt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground/70">
            Faltan
          </p>
          <div className="mx-auto mt-3 grid max-w-md grid-cols-4 gap-2">
            <CountdownBox value={mounted ? countdown.d : 0} label="Días" />
            <CountdownBox value={mounted ? countdown.h : 0} label="Hs" />
            <CountdownBox value={mounted ? countdown.m : 0} label="Min" />
            <CountdownBox value={mounted ? countdown.s : 0} label="Seg" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamRow({
  name,
  home,
  accent = false,
}: {
  name: string
  home: boolean
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-2xl shadow-md ring-1 md:h-28 md:w-28 ${
          accent
            ? "bg-primary-foreground/95 ring-primary-foreground/40"
            : "bg-secondary-foreground/10 ring-secondary-foreground/20"
        }`}
      >
        <TeamCrest team={name} size="xl" className="h-20 w-20 ring-0 bg-transparent" />
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-tight md:text-xl">
          {name}
        </p>
        <p className="text-xs uppercase tracking-wider text-secondary-foreground/60">
          {home ? "Local" : "Visitante"}
        </p>
      </div>
    </div>
  )
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-secondary-foreground/10 p-3 ring-1 ring-secondary-foreground/15 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-secondary-foreground/70">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function InfoInline({
  icon,
  value,
}: {
  icon: React.ReactNode
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-secondary-foreground/85">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold text-secondary-foreground">{value}</span>
    </span>
  )
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-primary p-3 text-center text-primary-foreground shadow-md">
      <p className="font-display text-2xl font-extrabold tabular-nums md:text-3xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground/85">
        {label}
      </p>
    </div>
  )
}

function CountdownMini({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-primary px-2 py-1.5 text-center text-primary-foreground">
      <p className="font-display text-lg font-extrabold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/80">
        {label}
      </p>
    </div>
  )
}
