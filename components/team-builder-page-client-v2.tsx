"use client"

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { ChevronDown, Download, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { formationLayouts, formationOptions } from "@/lib/team-builder"
import { useAppState } from "@/components/app-state-provider"
import type { FormationCode, SquadPlayer, TeamBuilderSlot } from "@/lib/data/types"

type ExportTheme = "light" | "dark"

export function TeamBuilderPageClientV2() {
  const { squadPlayers } = useAppState()
  const [formation, setFormation] = useState<FormationCode>("4-3-3")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false)
  const [draggedSlot, setDraggedSlot] = useState<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  const dragPointer = useRef<{
    pointerId: number
    sourceSlot: string
    startX: number
    startY: number
    active: boolean
  } | null>(null)
  const suppressClick = useRef(false)

  const slots = formationLayouts[formation]
  const selectedSlotData = selectedSlot ? slots.find((slot) => slot.id === selectedSlot) : null
  const assignedIds = new Set(Object.values(assignments))
  const selectedPlayerId = selectedSlot ? assignments[selectedSlot] : null
  const selectedPlayer = selectedPlayerId ? squadPlayers.find((player) => player.id === selectedPlayerId) : null
  const completedCount = slots.filter((slot) => assignments[slot.id]).length
  const hasAssignments = completedCount > 0
  const isTeamComplete = completedCount === slots.length

  const availablePlayers = useMemo(
    () =>
      squadPlayers
        .filter((player) => !assignedIds.has(player.id) || player.id === selectedPlayerId)
        .sort((a, b) => {
          if (a.id === selectedPlayerId) return -1
          if (b.id === selectedPlayerId) return 1
          return sortPlayersForSlot(a, b, selectedSlotData)
        }),
    [squadPlayers, selectedPlayerId, selectedSlotData, assignments],
  )

  const downloadTeamImage = async (theme: ExportTheme) => {
    if (!isTeamComplete || isExporting) return

    setIsExporting(true)
    try {
      const pngBlob = await buildTeamImagePngBlob({
        theme,
        slots,
        assignments,
        players: squadPlayers,
      })
      const url = URL.createObjectURL(pngBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `medio-river-equipo-${theme === "light" ? "claro" : "oscuro"}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
      setIsThemePickerOpen(false)
    }
  }

  const handleSelectSlot = (slotId: string) => {
    const scrollTop = window.scrollY
    setSelectedSlot(slotId)
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollTop }))
  }

  const handleAssignPlayer = (playerId: string) => {
    if (!selectedSlot) return

    setAssignments((previous) => {
      if (previous[selectedSlot] === playerId) {
        const next = { ...previous }
        delete next[selectedSlot]
        return next
      }

      const next = Object.fromEntries(Object.entries(previous).filter(([, value]) => value !== playerId))
      next[selectedSlot] = playerId
      return next
    })
  }

  const moveOrSwapPlayers = (sourceSlot: string, targetSlot: string) => {
    if (sourceSlot === targetSlot) return

    setAssignments((previous) => {
      const sourcePlayerId = previous[sourceSlot]
      if (!sourcePlayerId) return previous

      const targetPlayerId = previous[targetSlot]
      const next = { ...previous, [targetSlot]: sourcePlayerId }

      if (targetPlayerId) next[sourceSlot] = targetPlayerId
      else delete next[sourceSlot]

      return next
    })

    setSelectedSlot(targetSlot)
  }

  const resetDrag = () => {
    dragPointer.current = null
    setDraggedSlot(null)
    setDragOverSlot(null)
  }

  const handlePlayerPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    slotId: string,
    hasPlayer: boolean,
  ) => {
    if (!hasPlayer || (event.pointerType === "mouse" && event.button !== 0)) return

    dragPointer.current = {
      pointerId: event.pointerId,
      sourceSlot: slotId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePlayerPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const currentDrag = dragPointer.current
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return

    const distance = Math.hypot(event.clientX - currentDrag.startX, event.clientY - currentDrag.startY)
    if (!currentDrag.active && distance < 8) return

    if (!currentDrag.active) {
      currentDrag.active = true
      suppressClick.current = true
      setDraggedSlot(currentDrag.sourceSlot)
    }

    event.preventDefault()
    const element = document.elementFromPoint(event.clientX, event.clientY)
    const target = element?.closest("[data-team-slot]") as HTMLElement | null
    const targetSlot = target?.dataset.teamSlot ?? null
    setDragOverSlot(targetSlot)
  }

  const handlePlayerPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const currentDrag = dragPointer.current
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return

    if (currentDrag.active && dragOverSlot && dragOverSlot !== currentDrag.sourceSlot) {
      moveOrSwapPlayers(currentDrag.sourceSlot, dragOverSlot)
    }

    resetDrag()
    if (suppressClick.current) {
      window.setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }
  }

  const handlePlayerPointerCancel = () => {
    resetDrag()
    suppressClick.current = false
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
    resetDrag()
  }

  const downloadTitle = !isTeamComplete
    ? `Completá los ${slots.length} jugadores para descargar`
    : isExporting
      ? "Generando imagen"
      : "Descargar imagen"

  return (
    <>
      <div className="grid min-w-0 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="order-1 min-w-0 space-y-4 overflow-hidden text-foreground md:rounded-[2rem] md:border md:border-zinc-200 md:bg-gradient-to-br md:from-zinc-950 md:via-zinc-900 md:to-red-950 md:p-5 md:text-white md:shadow-xl md:shadow-black/10 xl:order-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/70 md:inline-flex md:text-xs md:tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Pizarra táctica
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:mt-3 md:text-4xl">Arma tu equipo</h1>
              <p className="mt-1 hidden text-sm text-white/60 md:block">
                {completedCount}/{slots.length} jugadores elegidos · Formación {formation}
              </p>
            </div>

            <div className="flex w-full min-w-0 items-center gap-2 md:w-auto md:justify-end">
              <label className="relative w-44 shrink-0 sm:w-52 md:w-48">
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
                  resetDrag()
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/40 hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 md:border-white/10 md:bg-white/10 md:text-white md:hover:bg-white md:hover:text-zinc-950"
                aria-label="Limpiar equipo"
                title="Limpiar equipo"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsThemePickerOpen(true)}
                disabled={!isTeamComplete || isExporting}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none md:disabled:bg-white/10 md:disabled:text-white/30"
                aria-label={downloadTitle}
                title={downloadTitle}
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
              <PitchLines />

              {slots.map((slot) => {
                const player = squadPlayers.find((item) => item.id === assignments[slot.id])
                const isActive = selectedSlot === slot.id
                const isDragging = draggedSlot === slot.id
                const isDropTarget = Boolean(draggedSlot && dragOverSlot === slot.id && draggedSlot !== slot.id)
                const slotLabel = spanishSlotCode(slot)

                return (
                  <button
                    key={slot.id}
                    type="button"
                    tabIndex={-1}
                    data-team-slot={slot.id}
                    onPointerDown={(event) => handlePlayerPointerDown(event, slot.id, Boolean(player))}
                    onPointerMove={handlePlayerPointerMove}
                    onPointerUp={handlePlayerPointerUp}
                    onPointerCancel={handlePlayerPointerCancel}
                    onClick={(event) => {
                      if (suppressClick.current) {
                        event.preventDefault()
                        return
                      }
                      event.currentTarget.blur()
                      handleSelectSlot(slot.id)
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition ${player ? "touch-none cursor-grab active:cursor-grabbing" : "touch-manipulation"} ${isDragging ? "z-30 scale-110 opacity-65" : isActive || isDropTarget ? "z-20 scale-105" : "z-10 hover:scale-105"}`}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    aria-label={`${slotLabel}: ${player?.name ?? "sin jugador"}`}
                  >
                    {player ? (
                      <SelectedPlayerMarker player={player} active={isActive || isDropTarget} />
                    ) : (
                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-extrabold text-white shadow-lg shadow-black/25 transition md:h-11 md:w-11 md:text-[11px] ${isActive || isDropTarget ? "bg-zinc-950 ring-4 ring-primary/35" : "bg-primary"}`}
                      >
                        {slotLabel}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedSlotData && (
            <div className="space-y-2.5 xl:hidden">
              <div>
                <h2 className="font-display text-xl font-extrabold text-foreground">
                  {selectedPlayer?.name ?? selectionHeading(selectedSlotData)}
                </h2>
                {selectedPlayer && <p className="mt-0.5 text-xs text-muted-foreground">Volvé a tocarlo para quitarlo.</p>}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {availablePlayers.map((player) => (
                  <PlayerOptionCard
                    key={player.id}
                    player={player}
                    selected={player.id === selectedPlayerId}
                    onSelect={() => handleAssignPlayer(player.id)}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="order-2 hidden space-y-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:space-y-4 md:rounded-[1.75rem] md:p-5 xl:sticky xl:top-24 xl:flex xl:max-h-[calc(100dvh-7rem)] xl:flex-col xl:overflow-hidden">
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">
              {selectedSlotData ? selectedPlayer?.name ?? selectionHeading(selectedSlotData) : "Elegí una posición"}
            </h2>
            {selectedPlayer && <p className="mt-1 text-xs text-muted-foreground">Volvé a tocarlo para quitarlo.</p>}
          </div>

          <div className="hidden rounded-2xl border border-border bg-muted/25 p-2 xl:block">
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

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {selectedSlotData ? (
              availablePlayers.map((player) => (
                <PlayerOptionCard
                  key={player.id}
                  player={player}
                  selected={player.id === selectedPlayerId}
                  onSelect={() => handleAssignPlayer(player.id)}
                />
              ))
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-border bg-muted/25 p-5 text-sm leading-6 text-muted-foreground">
                Tocá una posición en la cancha para elegir el jugador.
              </div>
            )}
          </div>
        </aside>
      </div>

      {isThemePickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isExporting) setIsThemePickerOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-theme-title"
            className="w-full max-w-md rounded-[1.75rem] border border-border bg-background p-5 shadow-2xl md:p-6"
          >
            <div className="mb-5">
              <h2 id="export-theme-title" className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                ¿Cómo querés la imagen?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Elegí el estilo y se descarga al instante.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => void downloadTeamImage("light")}
                className="group rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
              >
                <ThemePreview theme="light" />
                <div className="mt-3">
                  <p className="font-bold text-foreground">Clara</p>
                  <p className="text-xs text-muted-foreground">Fondo blanco</p>
                </div>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => void downloadTeamImage("dark")}
                className="group rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
              >
                <ThemePreview theme="dark" />
                <div className="mt-3">
                  <p className="font-bold text-foreground">Oscura</p>
                  <p className="text-xs text-muted-foreground">Fondo negro</p>
                </div>
              </button>
            </div>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setIsThemePickerOpen(false)}
              className="mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-wait disabled:opacity-50"
            >
              {isExporting ? "Generando imagen…" : "Cancelar"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ThemePreview({ theme }: { theme: ExportTheme }) {
  const dark = theme === "dark"

  return (
    <div className={`relative aspect-square overflow-hidden rounded-xl border ${dark ? "border-white/10 bg-[#0f0f10]" : "border-zinc-200 bg-[#fafaf8]"}`}>
      <div className={`absolute inset-[9%] rounded-lg border ${dark ? "border-zinc-500/70" : "border-zinc-300"}`} />
      <div className={`absolute inset-x-[9%] top-1/2 border-t ${dark ? "border-zinc-500/70" : "border-zinc-300"}`} />
      <div className={`absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${dark ? "border-zinc-500/70" : "border-zinc-300"}`} />
      {[24, 50, 76].map((left, index) => (
        <div key={left} className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${left}%`, top: `${index === 1 ? 48 : 68}%` }}>
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full bg-primary" />
        </div>
      ))}
      <span className="absolute bottom-2 right-2 text-[8px] font-black text-primary">MR</span>
    </div>
  )
}

function PitchLines() {
  return (
    <>
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
    </>
  )
}

function PlayerOptionCard({
  player,
  onSelect,
  compact = false,
  selected = false,
}: {
  player: SquadPlayer
  onSelect: () => void
  compact?: boolean
  selected?: boolean
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`flex w-44 shrink-0 items-center gap-2 rounded-xl border px-2 py-2 text-left shadow-sm transition sm:w-48 ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"}`}
      >
        <PlayerThumb player={player} className="h-12 w-12 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">#{player.number}</p>
            {selected && <span className="text-[9px] font-black uppercase tracking-[0.08em] text-primary">Elegido</span>}
          </div>
          <p className="whitespace-nowrap text-[13px] font-semibold leading-tight text-foreground">{shortPlayerName(player.name)}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition hover:shadow-sm ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border bg-background/70 hover:border-primary/40 hover:bg-muted/40"}`}
    >
      <PlayerThumb player={player} className="h-10 w-10 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">#{player.number}</p>
          <p className="truncate text-sm font-semibold leading-tight text-foreground">{player.name}</p>
          {selected && <span className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-[0.08em] text-primary">Elegido</span>}
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">{player.position}</p>
      </div>
    </button>
  )
}

function PlayerThumb({ player, className }: { player: SquadPlayer; className: string }) {
  return (
    <div className={`shrink-0 overflow-hidden bg-muted ${className}`}>
      {player.image ? (
        <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-base font-bold text-muted-foreground">{player.name.charAt(0)}</div>
      )}
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
  const trimmed = name.trim()
  if (/mart[ií]nez\s+quarta/i.test(trimmed)) return "M. Quarta"

  const parts = trimmed.split(" ")
  return parts.length > 1 ? parts.at(-1) ?? trimmed : trimmed
}

function selectionHeading(slot: TeamBuilderSlot) {
  const nounByRole: Record<TeamBuilderSlot["role"], string> = {
    Arquero: "arquero",
    Defensor: "defensor",
    Medio: "mediocampista",
    Delantero: "delantero",
  }

  return `Elegí tu ${nounByRole[slot.role]}`
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
      if ((code === "lb" || slot.id === "lwb") && position.includes("lateral izquierdo")) return naturalFootBonus
      if ((code === "rb" || slot.id === "rwb") && position.includes("lateral derecho")) return naturalFootBonus
      if (position.includes("lateral")) return 2 + naturalFootBonus
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
  const order = { Arqueros: 0, Defensores: 1, Mediocampistas: 2, Delanteros: 3 }
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
      .map((slot) => ({ slot, score: formationSlotTransferScore(entry.player, entry.previousSlot, slot) }))
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
  theme,
  slots,
  assignments,
  players,
}: {
  theme: ExportTheme
  slots: TeamBuilderSlot[]
  assignments: Record<string, string>
  players: SquadPlayer[]
}) {
  const width = 1080
  const height = 1080
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("No se pudo crear el canvas para exportar el equipo.")

  const pitchX = 64
  const pitchY = 44
  const pitchWidth = 952
  const pitchHeight = 952
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

  drawExportBackground(context, width, height, theme)
  drawExportPitch(context, pitchX, pitchY, pitchWidth, pitchHeight, theme)

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
      theme,
    })
  }

  drawExportBrand(context, width, height)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("No se pudo generar el PNG del equipo."))
    }, "image/png")
  })
}

function drawExportBackground(context: CanvasRenderingContext2D, width: number, height: number, theme: ExportTheme) {
  const gradient = context.createLinearGradient(0, 0, width, height)
  if (theme === "light") {
    gradient.addColorStop(0, "#fdfdfb")
    gradient.addColorStop(1, "#f5f5f2")
  } else {
    gradient.addColorStop(0, "#09090a")
    gradient.addColorStop(1, "#151517")
  }
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

function drawExportPitch(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: ExportTheme,
) {
  const line = theme === "light" ? "#d0d0d0" : "#5f5f63"
  const field = theme === "light" ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.012)"

  fillRoundRect(context, x, y, width, height, 26, field)
  strokeRoundRect(context, x, y, width, height, 26, line, 4)

  context.strokeStyle = line
  context.fillStyle = line
  context.lineWidth = 4

  context.beginPath()
  context.moveTo(x, y + height / 2)
  context.lineTo(x + width, y + height / 2)
  context.stroke()

  context.beginPath()
  context.arc(x + width / 2, y + height / 2, 118, 0, Math.PI * 2)
  context.stroke()

  context.beginPath()
  context.arc(x + width / 2, y + height / 2, 5, 0, Math.PI * 2)
  context.fill()

  context.strokeRect(x + width * 0.23, y, width * 0.54, height * 0.18)
  context.strokeRect(x + width * 0.37, y, width * 0.26, height * 0.08)
  context.strokeRect(x + width * 0.23, y + height * 0.82, width * 0.54, height * 0.18)
  context.strokeRect(x + width * 0.37, y + height * 0.92, width * 0.26, height * 0.08)

  drawCornerArc(context, x, y, 33, 0, Math.PI / 2, line)
  drawCornerArc(context, x + width, y, 33, Math.PI / 2, Math.PI, line)
  drawCornerArc(context, x, y + height, 33, -Math.PI / 2, 0, line)
  drawCornerArc(context, x + width, y + height, 33, Math.PI, Math.PI * 1.5, line)
}

function drawCornerArc(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  start: number,
  end: number,
  strokeStyle: string,
) {
  context.strokeStyle = strokeStyle
  context.lineWidth = 4
  context.beginPath()
  context.arc(x, y, radius, start, end)
  context.stroke()
}

function drawExportPlayer({
  context,
  x,
  y,
  slot,
  player,
  image,
  theme,
}: {
  context: CanvasRenderingContext2D
  x: number
  y: number
  slot: TeamBuilderSlot
  player?: SquadPlayer
  image?: HTMLImageElement
  theme: ExportTheme
}) {
  const slotLabel = spanishSlotCode(slot)
  const label = player ? shortPlayerName(player.name).toUpperCase() : slotLabel
  const number = player ? String(player.number) : slotLabel
  const initials = player ? playerInitials(player.name) : slotLabel.slice(0, 2)
  const nameFill = theme === "light" ? "#111112" : "#111112"
  const nameStroke = theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.38)"

  context.save()
  context.translate(x, y)

  context.beginPath()
  context.arc(0, -18, 43, 0, Math.PI * 2)
  context.fillStyle = "#ffffff"
  context.fill()
  context.strokeStyle = theme === "light" ? "#dedede" : "#ffffff"
  context.lineWidth = theme === "light" ? 2 : 3
  context.stroke()

  context.save()
  context.beginPath()
  context.arc(0, -18, 37, 0, Math.PI * 2)
  context.clip()

  if (image) {
    drawImageCover(context, image, -37, -55, 74, 74)
  } else {
    context.fillStyle = "#df1724"
    context.fillRect(-37, -55, 74, 74)
    context.fillStyle = "#ffffff"
    context.font = "900 22px Arial, Helvetica, sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(initials, 0, -17)
  }
  context.restore()

  if (player) {
    const numberWidth = Math.max(48, 24 + number.length * 15)
    fillRoundRect(context, -numberWidth / 2, 12, numberWidth, 27, 13, "#df1724")
    context.fillStyle = "#ffffff"
    context.font = "900 18px Arial, Helvetica, sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(number, 0, 26)
  }

  const measuredWidth = measureLabelWidth(context, label)
  const labelWidth = Math.max(132, Math.min(178, measuredWidth + 34))
  fillRoundRect(context, -labelWidth / 2, 42, labelWidth, 40, 15, nameFill)
  strokeRoundRect(context, -labelWidth / 2, 42, labelWidth, 40, 15, nameStroke, 2)
  context.fillStyle = player ? "#ffffff" : "#df1724"
  context.font = "900 18px Arial, Helvetica, sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(label, 0, 63, labelWidth - 18)
  context.restore()
}

function measureLabelWidth(context: CanvasRenderingContext2D, label: string) {
  context.save()
  context.font = "900 18px Arial, Helvetica, sans-serif"
  const width = context.measureText(label).width
  context.restore()
  return width
}

function drawExportBrand(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#df1724"
  context.font = "900 22px Arial, Helvetica, sans-serif"
  context.textAlign = "right"
  context.textBaseline = "bottom"
  context.fillText("MR", width - 24, height - 20)
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
