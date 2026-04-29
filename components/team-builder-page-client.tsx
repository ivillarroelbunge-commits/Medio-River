"use client"

import { useMemo, useRef, useState } from "react"
import { Download, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { formationLayouts, formationOptions } from "@/lib/team-builder"
import { useAppState } from "@/components/app-state-provider"
import type { FormationCode, SquadPlayer, TeamBuilderSlot } from "@/lib/data/types"

export function TeamBuilderPageClient() {
  const { squadPlayers } = useAppState()
  const [formation, setFormation] = useState<FormationCode>("4-3-3")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)
  const selectorRef = useRef<HTMLElement>(null)

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
    setSelectedSlot(slotId)

    if (window.matchMedia("(max-width: 1279px)").matches) {
      window.setTimeout(() => {
        selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 40)
    }
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="order-2 space-y-4 rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 p-4 text-white shadow-xl shadow-black/10 md:p-5 xl:order-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Pizarra táctica
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">Arma tu equipo</h1>
            <p className="mt-1 text-sm text-white/60">{completedCount}/11 jugadores elegidos · Formación {formation}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={downloadTeamImage}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground disabled:cursor-wait disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Generando..." : "Descargar PNG"}
            </button>
            <button
              type="button"
              disabled={!hasAssignments}
              onClick={() => {
                setAssignments({})
                setSelectedSlot(null)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/10 p-1 shadow-sm backdrop-blur">
              {formationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleFormationChange(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${option === formation ? "bg-primary text-primary-foreground shadow-sm" : "text-white/62 hover:bg-white/10 hover:text-white"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#061f0f] p-2 shadow-2xl shadow-black/35 md:p-3">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-primary/25 blur-3xl" />
          <div
            className="relative aspect-[10/13] overflow-hidden rounded-[1.35rem] border-[3px] border-white/95"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.16), transparent 16%), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px), repeating-linear-gradient(90deg, #10842b 0 12.5%, #0a7425 12.5% 25%)",
              backgroundSize: "100% 100%, 25% 100%, 100% 100%",
            }}
          >
            <div className="absolute inset-x-0 top-[50%] border-t-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[50%] h-[18%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[50%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95" />

            <div className="absolute inset-x-0 top-0 h-[10%] border-b-[3px] border-white/90" />
            <div className="absolute left-1/2 top-0 h-[18%] w-[46%] -translate-x-1/2 border-x-[3px] border-b-[3px] border-white/90" />
            <div className="absolute left-1/2 top-0 h-[8%] w-[22%] -translate-x-1/2 border-x-[3px] border-b-[3px] border-white/90" />
            <div className="absolute left-1/2 top-[18%] h-[12%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/70" />

            <div className="absolute bottom-0 left-1/2 h-[24%] w-[62%] -translate-x-1/2 border-x-[3px] border-t-[3px] border-white/90" />
            <div className="absolute bottom-0 left-1/2 h-[10%] w-[30%] -translate-x-1/2 border-x-[3px] border-t-[3px] border-white/90" />
            <div className="absolute bottom-[24%] left-1/2 h-[13%] w-[26%] -translate-x-1/2 translate-y-1/2 rounded-full border-[3px] border-white/70" />
            <div className="absolute bottom-[16%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/95" />

            {slots.map((slot) => {
              const player = squadPlayers.find((item) => item.id === assignments[slot.id])
              const isActive = selectedSlot === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(slot.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition ${isActive ? "z-20 scale-105" : "z-10 hover:scale-105"}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  {player ? (
                    <SelectedPlayerMarker player={player} active={isActive} />
                  ) : (
                    <div className="space-y-1.5">
                      <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-[11px] font-extrabold text-white shadow-lg shadow-black/25 transition ${isActive ? "bg-zinc-950 ring-4 ring-primary/35" : "bg-primary"}`}>
                        {slot.code}
                      </div>
                      <p className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">{slot.role}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <aside ref={selectorRef} className="order-1 space-y-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-sm xl:sticky xl:top-24 xl:order-2 xl:flex xl:max-h-[calc(100dvh-7rem)] xl:flex-col xl:overflow-hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seleccionar jugador</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">
            {selectedSlotData ? `${selectedSlotData.code} · ${selectedSlotData.role}` : "Elegí una posición"}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-muted/25 p-2">
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Posiciones</p>
          <div className="grid grid-cols-4 gap-1.5">
            {slots.map((slot) => {
              const isActive = selectedSlot === slot.id
              const player = squadPlayers.find((item) => item.id === assignments[slot.id])
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`rounded-xl px-2 py-2 text-center text-[11px] font-black transition ${isActive ? "bg-primary text-primary-foreground shadow-sm" : player ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-background text-muted-foreground hover:text-foreground"}`}
                  title={player?.name ?? slot.role}
                >
                  {slot.code}
                </button>
              )
            })}
          </div>
        </div>

        {selectedSlotData && (
          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/35 px-3 py-2">
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

        <div className="max-h-[31rem] space-y-2 overflow-y-auto pr-1 xl:min-h-0 xl:flex-1">
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
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {player.image ? (
                    <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">{player.name.charAt(0)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">#{player.number}</p>
                  <p className="truncate font-semibold text-foreground">{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.position}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-5 text-sm leading-6 text-muted-foreground">
              Elegí una posición desde los botones de arriba o tocando la cancha. Después te muestro primero los jugadores más naturales para ese puesto.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function SelectedPlayerMarker({ player, active }: { player: SquadPlayer; active: boolean }) {
  return (
    <div className="w-[96px]">
      <div className={`mx-auto h-14 w-14 overflow-hidden rounded-full border-[3px] bg-white shadow-xl shadow-black/30 ${active ? "border-primary ring-4 ring-primary/35" : "border-white"}`}>
        {player.image ? (
          <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-primary-foreground">{player.number}</div>
        )}
      </div>
      <div className="mt-1 rounded-xl border border-white/40 bg-zinc-950/90 px-1.5 py-1.5 text-center text-white shadow-lg shadow-black/25 backdrop-blur">
        <p className="text-[10px] font-black leading-none text-primary">#{player.number}</p>
        <p className="mt-0.5 truncate text-[10px] font-extrabold leading-none">{shortPlayerName(player.name)}</p>
      </div>
    </div>
  )
}

function shortPlayerName(name: string) {
  const parts = name.trim().split(" ")
  return parts.length > 1 ? parts.at(-1) ?? name : name
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
  slots,
  assignments,
  players,
}: {
  formation: FormationCode
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

  const pitchX = 96
  const pitchY = 176
  const pitchWidth = 888
  const pitchHeight = 1000
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
  drawExportHeader(context, formation, Object.keys(assignments).length)
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

  drawExportFooter(context)

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

function drawExportHeader(context: CanvasRenderingContext2D, formation: FormationCode, selectedCount: number) {
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
  context.fillText(`MI EQUIPO · ${formation}`, 168, 101)

  context.textAlign = "right"
  context.fillStyle = "rgba(255,255,255,0.72)"
  context.font = "900 20px Arial, Helvetica, sans-serif"
  context.fillText(`${selectedCount}/11`, 958, 101)
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
  const label = player ? shortPlayerName(player.name).toUpperCase() : slot.code
  const number = player ? `#${player.number}` : slot.code
  const initials = player ? playerInitials(player.name) : slot.code.slice(0, 2)

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

function drawExportFooter(context: CanvasRenderingContext2D) {
  fillRoundRect(context, 90, 1228, 900, 72, 36, "rgba(255,255,255,0.09)")
  strokeRoundRect(context, 90, 1228, 900, 72, 36, "rgba(255,255,255,0.2)", 1)

  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillStyle = "#df1724"
  context.font = "900 18px Arial, Helvetica, sans-serif"
  context.fillText("PIZARRA TÁCTICA", 540, 1255)
  context.fillStyle = "#ffffff"
  context.font = "900 22px Arial, Helvetica, sans-serif"
  context.fillText("GENERADO EN MEDIO RIVER", 540, 1284)
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
