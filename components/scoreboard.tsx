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
        className="relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_0%,rgba(220,38,38,0.34),transparent_34%),linear-gradient(145deg,#090909_0%,#1d1112_48%,#360c12_100%)] text-secondary-foreground shadow-[0_18px_38px_rgba(15,23,42,0.18)] md:rounded-2xl"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
        />
        <div aria-hidden="true" className="absolute inset-0 opacity-18 [background-image:linear-gradient(115deg,transparent_0%,transparent_43%,white_44%,white_46%,transparent_47%,transparent_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex items-center gap-2 text-[0.66rem] font-black uppercase tracking-[0.24em] text-white/78">
            <span className="h-1 w-6 rounded-full bg-primary" aria-hidden="true" />
            Próximo partido
            </div>
          </div>

          <div className="grid min-w-0 gap-3 md:flex md:items-center md:gap-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[1.15rem] bg-white/[0.08] px-3 py-3 ring-1 ring-white/10 md:flex md:shrink-0 md:justify-start md:gap-3 md:bg-transparent md:p-0 md:ring-0">
              <div className="flex flex-col items-center gap-1">
                <TeamCrest team={homeTeam} size="md" className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sm md:h-12 md:w-12" />
                <span className="max-w-[5.5rem] truncate text-[0.62rem] font-bold text-white/70 md:hidden">{homeTeam}</span>
              </div>
              <span className="rounded-full bg-primary px-2.5 py-1 font-display text-[0.68rem] font-extrabold tracking-wider text-white shadow-sm md:bg-transparent md:px-0 md:py-0 md:text-lg md:text-secondary-foreground/80 md:shadow-none">
                VS
              </span>
              <div className="flex flex-col items-center gap-1">
                <TeamCrest team={awayTeam} size="md" className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sm md:h-12 md:w-12" />
                <span className="max-w-[5.5rem] truncate text-[0.62rem] font-bold text-white/70 md:hidden">{awayTeam}</span>
              </div>
            </div>
            <div className="min-w-0 text-center md:text-left">
              <div className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary-foreground/70 md:flex">
                <span className="h-1 w-6 rounded-full bg-primary" aria-hidden="true" />
                Próximo partido
              </div>
              <h2 className="font-display text-[1.08rem] font-extrabold leading-tight text-white md:mt-1 md:truncate md:text-2xl">
                {homeTeam} vs. {awayTeam}
              </h2>
              <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/56 md:text-xs md:text-secondary-foreground/60">
                {match.competition} · {match.isHome ? "Local" : "Visitante"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 md:gap-3">
            <div className="grid grid-cols-3 gap-1.5 rounded-[1.05rem] bg-black/18 p-2.5 text-[0.68rem] ring-1 ring-white/10 md:flex md:flex-wrap md:items-center md:gap-x-4 md:bg-transparent md:p-0 md:text-sm md:ring-0">
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
    <div className="rounded-xl bg-primary px-2 py-1.5 text-center text-primary-foreground shadow-sm ring-1 ring-white/10 md:rounded-lg">
      <p className="font-display text-base font-extrabold tabular-nums leading-none md:text-lg">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground/80 md:text-[9px]">
        {label}
      </p>
    </div>
  )
}
