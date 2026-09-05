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
        className="relative overflow-hidden rounded-[1.1rem] bg-[#07090b] text-white shadow-[0_16px_34px_rgba(15,23,42,0.22)] ring-1 ring-white/10 md:rounded-[1.25rem]"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(115deg,rgba(255,255,255,0.06)_0%,transparent_38%,rgba(255,255,255,0.08)_39%,transparent_55%)]" />
        <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:10px_10px]" />
        <div aria-hidden="true" className="absolute -left-10 top-4 h-48 w-24 rotate-[34deg] bg-[linear-gradient(90deg,transparent,rgba(218,28,39,0.18),rgba(218,28,39,0.55),transparent)] blur-[1px]" />
        <div aria-hidden="true" className="absolute -left-4 top-20 h-36 w-28 rotate-[45deg] bg-[linear-gradient(90deg,transparent,rgba(218,28,39,0.16),rgba(218,28,39,0.38),transparent)]" />
        <div aria-hidden="true" className="absolute -right-8 bottom-0 h-48 w-24 rotate-[34deg] bg-[linear-gradient(90deg,transparent,rgba(218,28,39,0.14),rgba(218,28,39,0.52),transparent)]" />
        <div aria-hidden="true" className="absolute right-8 bottom-8 h-28 w-16 rotate-[45deg] bg-[linear-gradient(90deg,transparent,rgba(218,28,39,0.16),rgba(218,28,39,0.34),transparent)]" />

        <div className="relative px-4 pb-3.5 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/90 min-[390px]:text-[0.68rem] sm:text-xs sm:tracking-[0.28em]">
              Próximo partido
            </div>
            <div className="shrink-0 text-right text-[0.62rem] font-medium uppercase leading-relaxed tracking-[0.08em] text-white/60 sm:text-xs">
              <p>{match.competition}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-5 sm:gap-7">
            <CompactTeam name={homeTeam} />
            <div className="font-display text-xl font-black tracking-[0.08em] text-white sm:text-2xl">
              VS
            </div>
            <CompactTeam name={awayTeam} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-x-2.5 text-[0.8rem] text-white/88 sm:mt-5 sm:gap-x-4 sm:text-sm">
            <InfoInline
              icon={<Calendar className="h-3.5 w-3.5" />}
              value={match.dateTbd ? "Fecha a confirmar" : formatWeekdayDate(match.date)}
            />
            {!match.dateTbd && <span className="h-5 w-px bg-white/22" aria-hidden="true" />}
            {!match.dateTbd && (
              <InfoInline
                icon={<Clock className="h-3.5 w-3.5" />}
                value={match.timeTbd ? "--:--" : `${formatTime(match.date)} hs`}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center border-t border-white/10 pt-3 sm:mt-5 sm:pt-4">
            <CountdownMini value={mounted ? countdown.d : 0} label="Días" />
            <span className="h-8 w-px bg-white/28" aria-hidden="true" />
            <CountdownMini value={mounted ? countdown.h : 0} label="Horas" />
            <span className="h-8 w-px bg-white/28" aria-hidden="true" />
            <CountdownMini value={mounted ? countdown.m : 0} label="Min" />
            <span className="h-8 w-px bg-white/28" aria-hidden="true" />
            <CountdownMini value={mounted ? countdown.s : 0} label="Seg" />
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
    <span className="inline-flex items-center justify-center gap-1.5 text-center text-[0.76rem] text-white/84 sm:text-[0.82rem]">
      <span className="text-primary">{icon}</span>
      <span className="font-medium leading-tight">{value}</span>
    </span>
  )
}

function CompactTeam({ name }: { name: string }) {
  return (
    <div className="min-w-0 text-center">
      <TeamCrest team={name} size="lg" className="mx-auto h-16 w-16 bg-transparent drop-shadow-[0_8px_16px_rgba(0,0,0,0.42)] sm:h-20 sm:w-20" />
      <p className="mx-auto mt-1.5 max-w-28 text-balance text-[0.66rem] font-black uppercase leading-tight tracking-[0.03em] text-white/92 sm:mt-2 sm:max-w-40 sm:text-xs">
        {name}
      </p>
    </div>
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
    <div className="px-1 text-center text-white">
      <p className="font-display text-[1.15rem] font-black tabular-nums leading-none sm:text-2xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[0.54rem] font-bold uppercase tracking-[0.08em] text-white/82 sm:text-[0.68rem]">
        {label}
      </p>
    </div>
  )
}
