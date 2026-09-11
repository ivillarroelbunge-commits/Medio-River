"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Download, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { formationLayouts, formationOptions } from "@/lib/team-builder"
import { useAppState } from "@/components/app-state-provider"
import type { FormationCode, SquadPlayer, TeamBuilderSlot } from "@/lib/data/types"

export function TeamBuilderPageClient() {
  const { squadPlayers } = useAppState()
  const [formation, setFormation] = useState<FormationCode>("4-3-3")
  const [teamName, setTeamName] = useState("Mi equipo")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)

  const slots = formationLayouts[formation]
  const selectedSlotData = selectedSlot ? slots.find((slot) => slot.id === selectedSlot) : null
  const assignedIds = new Set(Object.values(assignments))
  const selectedPlayerId = selectedSlot ? assignments[selectedSlot] : null
  const selectedPlayer = selectedPlayerId ? squadPlayers.find((player) => player.id === selectedPlayerId) : null
  const completedCount = slots.filter((slot) => assignments[slot.id]).length
  const hasAssignments = completedCount > 0

  const availablePlayers = useMemo(
    () =>
      squadPlayers
        .filter((player) => !assignedIds.has(player.id) || player.id === selectedPlayerId)
        .sort((a, b) => sortPlayersForSlot(a, b, selectedSlotData)),
    [assignedIds, selectedPlayerId, selectedSlotData],
  )

  const downloadTeamImage = async () => {
    setIsExporting(true)

    try {
      const pngBlob = await buildTeamImagePngBlob({
        formation,
        teamName,
        slots,
        assignments,
        players: squadPlayers,
      })
      const url = URL.createObjectURL(pngBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `medio-river-equipo-${formation.replaceAll("-", "")}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSelectSlot = (slotId: string) => {
    const scrollTop = window.scrollY
    setSelectedSlot(slotId)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollTop })
    })
  }

  const handleFormationChange = (nextFormation: FormationCode) => {
    if (nextFormation === formation) return

    const nextSlots = formationLayouts[nextFormation]
    const remapped = remapAssignmentsForFormation({
      previousAssignments: assignments,
      previousSlots: slots,
      nextSlots,
      players: squadPlayers,
    })

    setFormation(nextFormation)
    setAssignments(remapped.assignments)
    setSelectedSlot(selectedSlot ? remapped.slotMap.get(selectedSlot) ?? null : null)
  }

  return (
    <div className="grid min-w-0 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="order-1 min-w-0 space-y-4 overflow-hidden text-foreground md:rounded-[2rem] md:border md:border-zinc-200 md:bg-gradient-to-br md:from-zinc-950 md:via-zinc-900 md:to-red-950 md:p-5 md:text-white md:shadow-xl md:shadow-black/10 xl:order-1">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/70 md:inline-flex md:text-xs md:tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Pizarra táctica
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:mt-3 md:text-4xl">Arma tu equipo</h1>
            <p className="mt-1 hidden text-sm text-white/60 md:block">{completedCount}/11 jugadores elegidos · Formación {formation}</p>
          </div>
          <label className="hidden w-full max-w-sm space-y-2 md:ml-auto md:block">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/55">Nombre del equipo</span>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              maxLength={28}
              placeholder="Mi equipo"
              className="h-11 w-full rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-white placeholder:text-white/35 outline-none transition focus:border-primary focus:bg-white/15"
            />
          </label>
          <div className="flex min-w-0 w-full items-center gap-2 md:w-auto md:justify-end">
            <label className="relative min-w-0 flex-1 md:w-48 md:flex-none">
              <span className="sr-only">Formación</span>
              <select
                value={formation}
                onChange={(event) => handleFormationChange(event.target.value as FormationCode)}
                className="h-10 w-full appearance-none rounded-full border border-border bg-card px-4 pr-10 text-sm font-extrabold text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 md:border-white/10 md:bg-white/10 md:text-white md:focus:bg-white/15"
              >
                {formationOptions.map((option) => (
                  <option key={option} value={option} className="bg-background text-foreground">
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground md:text-white/70" />
            </label>
            <button
              type="button"
              disabled={!hasAssignments}
              onClick={() => {
                setAssignments({})
                setSelectedSlot(null)
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/40 hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 md:border-white/10 md:bg-white/10 md:text-white md:hover:bg-white md:hover:text-zinc-950"
              aria-label="Limpiar equipo"
              title="Limpiar equipo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={downloadTeamImage}
              disabled={isExporting}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
              aria-label={isExporting ? "Generando imagen" : "Descargar imagen"}
              title={isExporting ? "Generando imagen" : "Descargar imagen"}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative mx-0 w-full max-w-full overflow-hidden md:mx-auto md:max-w-[620px] md:rounded-[1.75rem] md:border md:border-white/15 md:bg-[#061f0f] md:p-3 md:shadow-2xl md:shadow-black/35">
          <div className="pointer-events-none absolute inset-x-8 top-0 hidden h-24 rounded-full bg-primary/25 blur-3xl md:block" />
          <div
            className="relative aspect-[10/13] overflow-hidden rounded-[1.25rem] border-[3px] border-white/95 shadow-2xl shadow-black/25 md:rounded-[1.35rem]"
            style={{
              backgroundImage:
                "linear-gradient(0deg, rgba(255,255,255,0.09) 1px, transparent 1px), repeating-linear-gradient(0deg, #10842b 0 12.5%, #0a7425 12.5% 25%)",
              backgroundSize: "100% 25%, 100% 100%",
            }}
          >
            <div className="absolute inset-x-0 top-[50%] border-t-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[50%] h-[18%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[50%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95" />

            <div className="absolute left-1/2 top-0 h-[18%] w-[46%] -translate-x-1/2 border-x-[3px] border-b-[3px] border-white/90" />
            <div className="absolute left-1/2 top-0 h-[8%] w-[22%] -translate-x-1/2 border-x-[3px] border-b-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[18%] h-[12%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/70 [clip-path:inset(50%_0_0_0)]" />

            <div className="absolute bottom-0 left-1/2 h-[24%] w-[62%] -translate-x-1/2 border-x-[3px] border-t-[3px] border-white/90" />
            <div className="absolute bottom-0 left-1/2 h-[10%] w-[30%] -translate-x-1/2 border-x-[3px] border-t-[3px] border-white/90" />
            <div className="absolute bottom-[24%] left-1/2 h-[13%] w-[26%] -translate-x-1/2 translate-y-1/2 rounded-full border-[3px] border-white/70 [clip-path:inset(0_0_50%_0)]" />
            <div className="absolute bottom-[16%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/95" />

            {slots.map((slot) => {
              const player = squadPlayers.find((item) => item.id === assignments[slot.id])
              const isActive = selectedSlot === slot.id
              const slotLabel = spanishSlotCode(slot)
              return (
                <button
                  key={slot.id}
                  type="button"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.currentTarget.blur()
                    handleSelectSlot(slot.id)
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition ${isActive ? "z-20 scale-105" : "z-10 hover:scale-105"}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  {player ? (
                    <SelectedPlayerMarker player={player} active={isActive} />
                  ) : (
                    <div className="space-y-1 md:space-y-1.5">
                      <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[9px] font-extrabold text-white shadow-lg shadow-black/25 transition md:h-11 md:w-11 md:text-[11px] ${isActive ? "bg-zinc-950 ring-4 ring-primary/35" : "bg-primary"}`}>
                        {slotLabel}
                      </div>
                      <p className="rounded-full bg-black/45 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white shadow-sm md:px-2 md:text-[10px]">{slot.role}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {selectedSlotData && (
          <div className="space-y-3 xl:hidden">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Seleccionar jugador</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-foreground">
                {spanishSlotCode(selectedSlotData)} · {selectedSlotData.role}
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {availablePlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    if (!selectedSlot) return
                    setAssignments((previous) => {
                      const next = Object.fromEntries(Object.entries(previous).filter(([, value]) => value !== player.id))
                      next[selectedSlot] = player.id
                      return next
                    })
                  }}
                  className="flex w-40 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {player.image ? (
                      <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">{player.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">#{player.number}</p>
                    <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{player.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-tight text-muted-foreground">{player.position}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="order-2 hidden space-y-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:space-y-4 md:rounded-[1.75rem] md:p-5 xl:sticky xl:top-24 xl:flex xl:max-h-[calc(100dvh-7rem)] xl:flex-col xl:overflow-hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seleccionar jugador</p>
          <h2 className="mt-1 font-display text-xl font-extrabold md:text-2xl">
            {selectedSlotData ? `${spanishSlotCode(selectedSlotData)} · ${selectedSlotData.role}` : "Elegí una posición"}
          </h2>
        </div>

        <div className="hidden rounded-2xl border border-border bg-muted/25 p-2 xl:block">
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Posiciones</p>
          <div className="grid grid-cols-6 gap-1.5 xl:grid-cols-4">
            {slots.map((slot) => {
              const isActive = selectedSlot === slot.id
              const player = squadPlayers.find((item) => item.id === assignments[slot.id])
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`rounded-xl px-2 py-2 text-center text-[10px] font-black transition md:text-[11px] ${isActive ? "bg-primary text-primary-foreground shadow-sm" : player ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-background text-muted-foreground hover:text-foreground"}`}
                  title={player?.name ?? slot.role}
                >
                  {spanishSlotCode(slot)}
                </button>
              )
            })}
          </div>
        </div>

        {selectedSlotData && (
          <div className="hidden items-center justify-between rounded-2xl border border-border bg-muted/35 px-3 py-2 xl:flex">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Actual</p>
              <p className="truncate text-sm font-semibold">{selectedPlayer?.name ?? "Sin jugador"}</p>
            </div>
            <button
              type="button"
              disabled={!selectedPlayerId}
              onClick={() => {
                if (!selectedSlot) return
                setAssignments((previous) => {
                  const next = { ...previous }
                  delete next[selectedSlot]
                  return next
                })
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Quitar jugador"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-1 xl:block xl:min-h-0 xl:max-h-[31rem] xl:flex-1 xl:space-y-2 xl:overflow-y-auto xl:pr-1">
          {selectedSlotData ? (
            availablePlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  if (!selectedSlot) return
                  setAssignments((previous) => {
                    const next = Object.fromEntries(Object.entries(previous).filter(([, value]) => value !== player.id))
                    next[selectedSlot] = player.id
                    return next
                  })
                }}
                className="flex w-40 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-background/70 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm xl:w-full xl:flex-row xl:items-center xl:gap-3 xl:py-2.5"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted xl:h-12 xl:w-12">
                  {player.image ? (
                    <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">{player.name.charAt(0)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">#{player.number}</p>
                  <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground xl:truncate xl:text-base">{player.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-tight text-muted-foreground xl:truncate xl:text-sm">{player.position}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-border bg-muted/25 p-5 text-sm leading-6 text-muted-foreground">
              Tocá una posición en la cancha para elegir el jugador.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function SelectedPlayerMarker({ player, active }: { player: SquadPlayer; active: boolean }) {
  return (
    <div className="relative w-[70px] md:w-[104px]">
      <div className={`relative z-10 mx-auto h-10 w-10 overflow-hidden rounded-full border-2 bg-white shadow-xl shadow-black/30 md:h-14 md:w-14 md:border-[3px] ${active ? "border-primary ring-4 ring-primary/35" : "border-white"}`}>
        {player.image ? (
          <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-primary-foreground">{player.number}</div>
        )}
      </div>
      <span className="absolute left-1/2 top-8 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-[7px] font-black leading-none text-primary-foreground shadow-md shadow-black/20 md:top-11 md:h-5 md:w-5 md:text-[8px]">
        {player.number}
      </span>
      <div className="mt-0.5 rounded-full border border-zinc-200 bg-white px-2 pb-1 pt-2 text-center text-zinc-950 shadow-lg shadow-black/20 md:mt-1 md:px-3 md:pb-1.5 md:pt-2.5">
        <p className="truncate text-[9px] font-extrabold leading-none md:text-[11px]">{shortPlayerName(player.name)}</p>
      </div>
    </div>
  )
}

function shortPlayerName(name: string) {
  const parts = name.trim().split(" ")
  return parts.length > 1 ? parts.at(-1) ?? name : name
}

function spanishSlotCode(slot: TeamBuilderSlot) {
  const idMap: Record<string, string> = {
    gk: "ARQ",
    lb: "LI",
    lwb: "LI",
    rb: "LD",
    rwb: "LD",
    lcb: "DFC",
    cb: "DFC",
    rcb: "DFC",
    cdm: "MCD",
    lcdm: "MCD",
    rcdm: "MCD",
    lcm: "MC",
    cm: "MC",
    rcm: "MC",
    lm: "MI",
    rm: "MD",
    cam: "MCO",
    lam: "EI",
    ram: "ED",
    lcf: "EI",
    cf: "DC",
    rcf: "ED",
  }

  return idMap[slot.id] ?? slot.code
}

function normalizeExportTeamName(teamName: string) {
  const normalized = teamName.trim().replace(/\s+/g, " ")
  return (normalized || "Mi equipo").toUpperCase()
}

function sortPlayersForSlot(a: SquadPlayer, b: SquadPlayer, slot?: TeamBuilderSlot | null) {
  const byFit = playerSlotScore(a, slot) - playerSlotScore(b, slot)
  if (byFit !== 0) return byFit
  return a.number - b.number
}

function playerSlotScore(player: SquadPlayer, slot?: TeamBuilderSlot | null) {
  if (!slot) return lineOrder(player)

  const position = player.position.toLowerCase()
  const code = slot.code.toLowerCase()

  if (slot.role === "Arquero") return player.line === "Arqueros" ? 0 : 5 + lineOrder(player)

  if (slot.role === "Defensor") {
    const isLeftSlot = code === "lb" || slot.id === "lwb" || code === "lcb"
    const isRightSlot = code === "rb" || slot.id === "rwb" || code === "rcb"
    const isSideBack = code === "lb" || code === "rb" || slot.id === "lwb" || slot.id === "rwb"
    const isCenterBackSlot = code.includes("cb")
    const isLeftFooted = player.foot.toLowerCase().includes("zurdo")
    const isRightFooted = player.foot.toLowerCase().includes("diestro")
    const naturalFootBonus = (isLeftSlot && isLeftFooted) || (isRightSlot && isRightFooted) ? 0 : 1
    const isCentralDefender = player.line === "Defensores" && (position.includes("defensor central") || position.includes("zaguero"))

    if (isCenterBackSlot && isCentralDefender) return naturalFootBonus

    if (isSideBack) {
      if (code === "lb" || slot.id === "lwb") {
        if (position.includes("lateral izquierdo")) return naturalFootBonus
        if (position.includes("lateral")) return 2 + naturalFootBonus
      }

      if (code === "rb" || slot.id === "rwb") {
        if (position.includes("lateral derecho")) return naturalFootBonus
        if (position.includes("lateral")) return 2 + naturalFootBonus
      }
    }

    if (isCenterBackSlot && player.line === "Defensores") return 3 + naturalFootBonus
    if (player.line === "Defensores") return 5 + naturalFootBonus
    if (position.includes("volante central")) return 8
    return 20 + lineOrder(player)
  }

  if (slot.role === "Medio") {
    if ((code.includes("dm") || code === "cm" || code.includes("cm")) && (position.includes("volante central") || position.includes("volante mixto") || position.includes("mediocampista"))) return 0
    if ((code.includes("am") || code === "lm" || code === "rm") && (position.includes("enganche") || position.includes("mediapunta") || position.includes("volante ofensivo") || position.includes("extremo"))) return 0
    if (player.line === "Mediocampistas") return 1
    if (player.line === "Delanteros" && (position.includes("extremo") || position.includes("delantero"))) return 3
    if (player.line === "Defensores" && position.includes("lateral")) return 4
    return 5 + lineOrder(player)
  }

  if (slot.role === "Delantero") {
    if (position.includes("centrodelantero") || position.includes("delantero") || position.includes("extremo")) return 0
    if (position.includes("mediapunta") || position.includes("enganche") || position.includes("volante ofensivo")) return 2
    if (player.line === "Delanteros") return 1
    return 5 + lineOrder(player)
  }

  return lineOrder(player)
}

function lineOrder(player: SquadPlayer) {
  const order = {
    Arqueros: 0,
    Defensores: 1,
    Mediocampistas: 2,
    Delanteros: 3,
  }

  return order[player.line]
}

function remapAssignmentsForFormation({
  previousAssignments,
  previousSlots,
  nextSlots,
  players,
}: {
  previousAssignments: Record<string, string>
  previousSlots: TeamBuilderSlot[]
  nextSlots: TeamBuilderSlot[]
  players: SquadPlayer[]
}) {
  const previousSlotById = new Map(previousSlots.map((slot) => [slot.id, slot]))
  const playerById = new Map(players.map((player) => [player.id, player]))
  const freeSlots = new Set(nextSlots.map((slot) => slot.id))
  const slotMap = new Map<string, string>()
  const assignments: Record<string, string> = {}

  const entries = Object.entries(previousAssignments)
    .map(([slotId, playerId], index) => ({
      previousSlot: previousSlotById.get(slotId),
      player: playerById.get(playerId),
      playerId,
      slotId,
      index,
    }))
    .filter((entry): entry is { previousSlot: TeamBuilderSlot; player: SquadPlayer; playerId: string; slotId: string; index: number } => Boolean(entry.previousSlot && entry.player))
    .sort((a, b) => playerSlotScore(a.player, a.previousSlot) - playerSlotScore(b.player, b.previousSlot) || a.index - b.index)

  for (const entry of entries) {
    const bestSlot = nextSlots
      .filter((slot) => freeSlots.has(slot.id))
      .map((slot) => ({
        slot,
        score: formationSlotTransferScore(entry.player, entry.previousSlot, slot),
      }))
      .sort((a, b) => a.score - b.score)[0]?.slot

    if (!bestSlot) continue

    assignments[bestSlot.id] = entry.playerId
    freeSlots.delete(bestSlot.id)
    slotMap.set(entry.slotId, bestSlot.id)
  }

  return { assignments, slotMap }
}

function formationSlotTransferScore(player: SquadPlayer, previousSlot: TeamBuilderSlot, nextSlot: TeamBuilderSlot) {
  if (previousSlot.id === nextSlot.id) return -1000
  if (previousSlot.code === nextSlot.code) return -800

  const rolePenalty = previousSlot.role === nextSlot.role ? 0 : 60
  const positionFit = playerSlotScore(player, nextSlot) * 45
  const fieldDistance = Math.abs(previousSlot.x - nextSlot.x) + Math.abs(previousSlot.y - nextSlot.y) * 0.9

  return positionFit + rolePenalty + fieldDistance
}

async function buildTeamImagePngBlob({
  formation,
  teamName,
  slots,
  assignments,
  players,
}: {
  formation: FormationCode
  teamName: string
  slots: TeamBuilderSlot[]
  assignments: Record<string, string>
  players: SquadPlayer[]
}) {
  const width = 1080
  const height = 1350
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("No se pudo crear el canvas para exportar el equipo.")

  const pitchX = 72
  const pitchY = 166
  const pitchWidth = 936
  const pitchHeight = 1120
  const getPlayer = (slot: TeamBuilderSlot) => players.find((player) => player.id === assignments[slot.id])

  const playerImages = new Map<string, HTMLImageElement>()
  await Promise.all(
    slots.map(async (slot) => {
      const player = getPlayer(slot)
      if (!player?.image) return
      const image = await loadExportImage(player.image)
      if (image) playerImages.set(player.id, image)
    }),
  )

  drawExportBackground(context, width, height)
  drawExportHeader(context, formation, teamName)
  drawExportPitch(context, pitchX, pitchY, pitchWidth, pitchHeight)

  for (const slot of slots) {
    const player = getPlayer(slot)
    const image = player ? playerImages.get(player.id) : undefined
    drawExportPlayer({
      context,
      x: pitchX + (slot.x / 100) * pitchWidth,
      y: pitchY + (slot.y / 100) * pitchHeight,
      slot,
      player,
      image,
    })
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("No se pudo generar el PNG del equipo."))
    }, "image/png")
  })
}

function drawExportBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, "#050505")
  gradient.addColorStop(0.62, "#171717")
  gradient.addColorStop(1, "#6f0d17")
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  context.globalAlpha = 0.24
  context.fillStyle = "#df1724"
  context.beginPath()
  context.arc(950, 95, 260, 0, Math.PI * 2)
  context.fill()

  context.globalAlpha = 0.18
  context.strokeStyle = "#df1724"
  context.lineWidth = 94
  context.beginPath()
  context.moveTo(-80, 1320)
  context.lineTo(1160, -80)
  context.stroke()

  context.globalAlpha = 0.2
  context.strokeStyle = "#ffffff"
  context.lineWidth = 22
  context.beginPath()
  context.moveTo(-72, 1320)
  context.lineTo(1168, -80)
  context.stroke()
  context.globalAlpha = 1
}

function drawExportHeader(context: CanvasRenderingContext2D, formation: FormationCode, teamName: string) {
  fillRoundRect(context, 64, 54, 952, 86, 34, "rgba(11,11,13,0.82)")
  strokeRoundRect(context, 64, 54, 952, 86, 34, "rgba(255,255,255,0.12)", 1)

  fillRoundRect(context, 90, 68, 58, 58, 29, "#ffffff")
  context.fillStyle = "#df1724"
  context.font = "900 22px Arial, Helvetica, sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText("MR", 119, 99)

  context.textAlign = "left"
  context.fillStyle = "#ffffff"
  context.font = "900 33px Arial, Helvetica, sans-serif"
  context.fillText(`${normalizeExportTeamName(teamName)} · ${formation}`, 168, 101, 800)
}

function drawExportPitch(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  fillRoundRect(context, x - 18, y - 18, width + 36, height + 36, 44, "rgba(0,0,0,0.34)")

  context.save()
  roundedPath(context, x, y, width, height, 34)
  context.clip()

  const stripeWidth = width / 8
  for (let index = 0; index < 8; index += 1) {
    context.fillStyle = index % 2 === 0 ? "#0b7023" : "#11852d"
    context.fillRect(x + stripeWidth * index, y, stripeWidth, height)
  }
  context.restore()

  strokeRoundRect(context, x, y, width, height, 34, "#ffffff", 7)
  strokeRoundRect(context, x + 18, y + 18, width - 36, height - 36, 22, "rgba(255,255,255,0.58)", 2)

  context.strokeStyle = "rgba(255,255,255,0.92)"
  context.fillStyle = "#ffffff"
  context.lineWidth = 5

  context.beginPath()
  context.moveTo(x, y + height / 2)
  context.lineTo(x + width, y + height / 2)
  context.stroke()

  context.beginPath()
  context.arc(x + width / 2, y + height / 2, 145, 0, Math.PI * 2)
  context.stroke()

  context.beginPath()
  context.arc(x + width / 2, y + height / 2, 7, 0, Math.PI * 2)
  context.fill()

  context.strokeRect(x + width * 0.23, y, width * 0.54, 190)
  context.strokeRect(x + width * 0.37, y, width * 0.26, 86)

  context.globalAlpha = 0.72
  context.beginPath()
  context.arc(x + width / 2, y + 190, 120, 0, Math.PI, false)
  context.stroke()
  context.globalAlpha = 1

  context.strokeRect(x + width * 0.19, y + height - 255, width * 0.62, 255)
  context.strokeRect(x + width * 0.35, y + height - 110, width * 0.3, 110)

  context.globalAlpha = 0.72
  context.beginPath()
  context.arc(x + width / 2, y + height - 255, 120, Math.PI, 0, false)
  context.stroke()
  context.globalAlpha = 1

  context.beginPath()
  context.arc(x + width / 2, y + height - 170, 6, 0, Math.PI * 2)
  context.fill()
}

function drawExportPlayer({
  context,
  x,
  y,
  slot,
  player,
  image,
}: {
  context: CanvasRenderingContext2D
  x: number
  y: number
  slot: TeamBuilderSlot
  player?: SquadPlayer
  image?: HTMLImageElement
}) {
  const slotLabel = spanishSlotCode(slot)
  const label = player ? shortPlayerName(player.name).toUpperCase() : slotLabel
  const number = player ? `#${player.number}` : slotLabel
  const initials = player ? playerInitials(player.name) : slotLabel.slice(0, 2)

  context.save()
  context.translate(x, y)

  context.beginPath()
  context.arc(0, -18, 47, 0, Math.PI * 2)
  context.fillStyle = "#ffffff"
  context.fill()

  context.save()
  context.beginPath()
  context.arc(0, -18, 39, 0, Math.PI * 2)
  context.clip()

  if (image) {
    drawImageCover(context, image, -39, -57, 78, 78)
  } else {
    context.fillStyle = player ? "#df1724" : "#141414"
    context.fillRect(-39, -57, 78, 78)
    context.strokeStyle = "rgba(255,255,255,0.18)"
    context.lineWidth = 13
    context.beginPath()
    context.moveTo(-24, -52)
    context.lineTo(24, 20)
    context.stroke()
    context.fillStyle = "#ffffff"
    context.font = "900 23px Arial, Helvetica, sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(initials, 0, -14)
  }
  context.restore()

  context.strokeStyle = "#ffffff"
  context.lineWidth = 5
  context.beginPath()
  context.arc(0, -18, 39, 0, Math.PI * 2)
  context.stroke()

  if (player) {
    fillRoundRect(context, -27, 10, 54, 25, 12, "#df1724")
    strokeRoundRect(context, -27, 10, 54, 25, 12, "#ffffff", 3)
    context.fillStyle = "#ffffff"
    context.font = "900 17px Arial, Helvetica, sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(number, 0, 23.5)
  }

  fillRoundRect(context, -78, 31, 156, 43, 17, "rgba(11,11,13,0.94)")
  strokeRoundRect(context, -78, 31, 156, 43, 17, "rgba(255,255,255,0.32)", 2)
  context.fillStyle = player ? "#ffffff" : "#df1724"
  context.font = "900 19px Arial, Helvetica, sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(label, 0, 54)

  context.restore()
}

async function loadExportImage(src: string) {
  try {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.referrerPolicy = "same-origin"
    image.decoding = "async"
    image.src = `/api/player-image?src=${encodeURIComponent(src)}`
    await image.decode()
    return image
  } catch {
    return undefined
  }
}

function drawImageCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const imageRatio = image.naturalWidth / image.naturalHeight
  const targetRatio = width / height
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.naturalWidth
  let sourceHeight = image.naturalHeight

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio
    sourceX = (image.naturalWidth - sourceWidth) / 2
  } else {
    sourceHeight = image.naturalWidth / targetRatio
    sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.12)
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function fillRoundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string) {
  roundedPath(context, x, y, width, height, radius)
  context.fillStyle = fillStyle
  context.fill()
}

function strokeRoundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, strokeStyle: string, lineWidth: number) {
  roundedPath(context, x, y, width, height, radius)
  context.strokeStyle = strokeStyle
  context.lineWidth = lineWidth
  context.stroke()
}

function roundedPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function playerInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}
