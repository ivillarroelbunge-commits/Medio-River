"use client"

import Link from "next/link"
import { useState } from "react"
import type { SquadPlayer } from "@/lib/data/types"

export function PlayerCard({ player }: { player: SquadPlayer }) {
  return (
    <Link href={`/plantel/${player.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {player.fromAcademy && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
          Formado en River
        </span>
      )}

      <div className="flex items-center gap-4 bg-gradient-to-r from-muted/80 to-card p-5 pb-4">
        <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl border border-border bg-white">
          <PlayerPhoto player={player} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">#{player.number}</p>
          <h3 className="mt-1 font-display text-xl font-extrabold leading-tight group-hover:text-primary">{player.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{player.position}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 px-5 py-5 text-sm">
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
    <div className="flex min-h-16 flex-col justify-between rounded-xl border border-border bg-muted/25 px-3 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold leading-tight text-foreground" title={value}>{value}</p>
    </div>
  )
}
