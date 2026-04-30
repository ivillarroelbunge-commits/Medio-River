"use client"

import Link from "next/link"
import { useState } from "react"
import type { SquadPlayer } from "@/lib/data/types"

export function PlayerCard({ player }: { player: SquadPlayer }) {
  return (
    <Link href={`/plantel/${player.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {player.fromAcademy && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-primary-foreground md:right-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px] md:tracking-[0.12em]">
          Formado en River
        </span>
      )}

      <div className="flex items-center gap-3 bg-gradient-to-r from-muted/80 to-card p-4 pb-3 md:gap-4 md:p-5 md:pb-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-white md:h-32 md:w-28">
          <PlayerPhoto player={player} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">#{player.number}</p>
          <h3 className="mt-1 font-display text-lg font-extrabold leading-tight group-hover:text-primary md:text-xl">{player.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">{player.position}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-1.5 px-4 py-4 text-sm md:gap-2 md:px-5 md:py-5">
        <InfoBlock label="Edad" value={`${player.age}`} />
        <InfoBlock label="País" value={player.nationality} />
        <InfoBlock label="Pierna" value={player.foot} />
      </div>
    </Link>
  )
}

function PlayerPhoto({ player }: { player: SquadPlayer }) {
  const [failed, setFailed] = useState(false)

  if (!player.image || failed) {
    return <PlayerInitials name={player.name} />
  }

  return (
    <img
      src={player.image}
      alt={player.name}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover object-top"
      onError={() => setFailed(true)}
    />
  )
}

function PlayerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card text-2xl font-extrabold text-primary">
      {initials}
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-14 flex-col justify-between rounded-xl border border-border bg-muted/25 px-2 py-2.5 text-center md:min-h-16 md:px-3 md:py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground md:text-[10px] md:tracking-[0.12em]">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold leading-tight text-foreground md:text-sm" title={value}>{value}</p>
    </div>
  )
}
