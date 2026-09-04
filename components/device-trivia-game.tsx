"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Clock, Flame, Medal, ShieldQuestion, Trophy, X } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  clearTriviaParticipant,
  createTriviaParticipant,
  ensureTriviaParticipant,
  fetchPublicTriviaResults,
  markTriviaParticipantPlayed,
  readTriviaParticipant,
  submitDeviceTriviaResult,
  type PublicTriviaResult,
  type TriviaParticipant,
} from "@/lib/trivia-participant"
import {
  getTriviaWeeklyKey,
  getWeeklyTriviaQuestions,
  getWeeklyTriviaStartDate,
  isWeeklyTriviaAvailable,
  WEEKLY_TRIVIA_SIZE,
} from "@/lib/trivia-daily"
import { cn } from "@/lib/utils"

type Phase = "start" | "playing" | "finished"

export function DeviceTriviaGame() {
  const { dailyTrivias, triviaQuestions } = useAppState()
  const supabase = useMemo(() => createClient(), [])
  const weeklyKey = useMemo(() => getTriviaWeeklyKey(), [])
  const triviaAvailable = useMemo(() => isWeeklyTriviaAvailable(), [])
  const weeklyQuestions = useMemo(() => {
    if (!triviaAvailable) return []
    const programmedTrivia = dailyTrivias.find((item) => item.dailyKey === weeklyKey)
    if (programmedTrivia?.questionIds.length) {
      const byId = new Map(triviaQuestions.map((question) => [question.id, question]))
      const programmed = programmedTrivia.questionIds
        .map((questionId) => byId.get(questionId))
        .filter((question) => Boolean(question))
      if (programmed.length > 0) return programmed.slice(0, WEEKLY_TRIVIA_SIZE)
    }
    return getWeeklyTriviaQuestions(triviaQuestions, weeklyKey)
  }, [dailyTrivias, triviaAvailable, triviaQuestions, weeklyKey])

  const [participant, setParticipant] = useState<TriviaParticipant | null>(null)
  const [results, setResults] = useState<PublicTriviaResult[]>([])
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<Phase>("start")
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    setParticipant(readTriviaParticipant())
    fetchPublicTriviaResults(supabase)
      .then((rows) => {
        if (active) setResults(rows)
      })
      .catch(() => {
        if (active) setSaveError("No pudimos cargar el ranking en este momento.")
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [supabase])

  const total = weeklyQuestions.length
  const question = weeklyQuestions[current]
  const alreadyPlayed = Boolean(
    participant &&
      (participant.playedKeys.includes(weeklyKey) ||
        results.some((result) => result.rankingId === participant.id && result.dailyKey === weeklyKey)),
  )
  const weeklyRanking = useMemo(() => buildWeeklyRanking(results, weeklyKey), [results, weeklyKey])
  const globalRanking = useMemo(() => buildGlobalRanking(results), [results])
  const progress = useMemo(
    () => (total > 0 ? Math.round(((current + (revealed ? 1 : 0)) / total) * 100) : 0),
    [current, revealed, total],
  )

  const startGame = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (alreadyPlayed || isSaving) return
    setSaveError(null)
    setIsSaving(true)

    let activeParticipant = participant
    if (!activeParticipant) {
      const normalizedName = name.trim()
      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedName || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        setSaveError("Ingresá tu nombre y un email válido para jugar.")
        setIsSaving(false)
        return
      }
      activeParticipant = createTriviaParticipant(normalizedName, normalizedEmail)
    }

    const ensured = await ensureTriviaParticipant(supabase, activeParticipant)
    if (!ensured.ok) {
      setSaveError("No pudimos registrar este dispositivo. Intentá nuevamente.")
      setIsSaving(false)
      return
    }

    const { data: existing } = await supabase
      .from("trivia_results")
      .select("id")
      .eq("ranking_id", activeParticipant.id)
      .eq("daily_key", weeklyKey)
      .maybeSingle()

    if (existing) {
      const updated = markTriviaParticipantPlayed(activeParticipant, weeklyKey)
      setParticipant(updated)
      setIsSaving(false)
      return
    }

    if (!participant) {
      saveNewParticipant(activeParticipant)
      setParticipant(activeParticipant)
    }

    setPhase("playing")
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setIsSaving(false)
  }

  const choose = (index: number) => {
    if (revealed || !question) return
    setSelected(index)
    setRevealed(true)
    if (index === question.correctIndex) setScore((value) => value + 1)
  }

  const next = async () => {
    if (current + 1 < total) {
      setCurrent((value) => value + 1)
      setSelected(null)
      setRevealed(false)
      return
    }

    if (!participant) return
    setIsSaving(true)
    setSaveError(null)
    const saved = await submitDeviceTriviaResult(supabase, participant, score, total, weeklyKey)
    setIsSaving(false)

    if (!saved.ok) {
      if ("alreadyPlayed" in saved && saved.alreadyPlayed) {
        const updated = markTriviaParticipantPlayed(participant, weeklyKey)
        setParticipant(updated)
        setPhase("start")
        return
      }
      if ("invalidDevice" in saved && saved.invalidDevice) {
        clearTriviaParticipant()
        setParticipant(null)
        setPhase("start")
      }
      setSaveError(saved.error ?? "No se pudo guardar el resultado.")
      return
    }

    const updated = markTriviaParticipantPlayed(participant, weeklyKey)
    setParticipant(updated)
    setResults((value) => [...value, saved.result])
    setPhase("finished")
  }

  if (!ready) {
    return <div className="rounded-[1.5rem] border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">Cargando trivia...</div>
  }

  if (!triviaAvailable) {
    const startDate = getWeeklyTriviaStartDate()
    return (
      <div className="space-y-6">
        <GameHero icon={<Clock className="h-8 w-8" />} eyebrow="Trivia semanal en pausa" title="Arranca el lunes 18/05">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">La trivia semanal va a estar disponible desde el lunes 18/05/2026 a las 00:00.</p>
          <p className="mt-4 text-sm font-semibold text-primary">Inicio: {startDate.toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })} hs</p>
        </GameHero>
        <RankingBlocks currentParticipantId={participant?.id} weeklyRanking={[]} globalRanking={globalRanking} />
      </div>
    )
  }

  if (total === 0 || !question) {
    return (
      <div className="space-y-6">
        <GameHero icon={<ShieldQuestion className="h-8 w-8" />} eyebrow="Trivia en preparación" title="Todavía no hay preguntas cargadas">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Estamos preparando la trivia de esta semana.</p>
        </GameHero>
        <RankingBlocks currentParticipantId={participant?.id} weeklyRanking={weeklyRanking} globalRanking={globalRanking} />
      </div>
    )
  }

  if (alreadyPlayed && phase !== "finished") {
    return (
      <div className="space-y-6">
        <GameHero icon={<Clock className="h-8 w-8" />} eyebrow={`Trivia semanal · ${weeklyKey}`} title="Ya jugaste la trivia de esta semana">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Volvé el próximo lunes para una nueva trivia de {WEEKLY_TRIVIA_SIZE} preguntas. Tu resultado ya cuenta para el ranking semanal y el general.</p>
        </GameHero>
        <RankingBlocks currentParticipantId={participant?.id} weeklyRanking={weeklyRanking} globalRanking={globalRanking} />
      </div>
    )
  }

  if (phase === "start") {
    return (
      <div className="space-y-6">
        <GameHero icon={<ShieldQuestion className="h-8 w-8" />} eyebrow={`Trivia semanal · ${weeklyKey}`} title={`${WEEKLY_TRIVIA_SIZE} preguntas, un solo intento`}>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Podés jugar una vez por semana desde este dispositivo. El puntaje suma al ranking semanal y al ranking general.</p>
          <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            <RulePill label="Preguntas" value={String(WEEKLY_TRIVIA_SIZE)} />
            <RulePill label="Intentos" value="1" />
            <RulePill label="Ranking" value="Semanal" />
          </div>

          {participant ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Jugás como <span className="font-semibold text-foreground">{participant.name}</span></p>
              <Button onClick={() => startGame()} size="lg" className="mt-3 rounded-full px-10" disabled={isSaving}>
                {isSaving ? "Preparando..." : "Jugar trivia semanal"}
              </Button>
            </div>
          ) : (
            <form onSubmit={startGame} className="mx-auto mt-6 max-w-md space-y-4 rounded-2xl border border-border bg-background p-4 text-left md:p-5">
              <div className="space-y-2">
                <Label htmlFor="trivia-name">Nombre</Label>
                <Input id="trivia-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trivia-email">Email</Label>
                <Input id="trivia-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="tu@email.com" required />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Completás estos datos una sola vez. Este navegador los recuerda para las próximas trivias y usamos tu email únicamente para identificar tu participación.</p>
              <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSaving}>{isSaving ? "Preparando..." : "Jugar trivia semanal"}</Button>
            </form>
          )}
          {saveError && <p className="mx-auto mt-4 max-w-md rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{saveError}</p>}
        </GameHero>
        <RankingBlocks currentParticipantId={participant?.id} weeklyRanking={weeklyRanking} globalRanking={globalRanking} />
      </div>
    )
  }

  if (phase === "finished") {
    return (
      <div className="space-y-6">
        <GameHero icon={<Trophy className="h-8 w-8" />} eyebrow="Resultado guardado" title="Resultado de la semana">
          <p className="mt-3 font-display text-5xl font-extrabold text-primary md:text-6xl">{score}<span className="text-3xl text-muted-foreground">/{total}</span></p>
          <p className="mt-3 text-muted-foreground">Tu resultado quedó guardado. La próxima trivia abre el lunes que viene.</p>
        </GameHero>
        <RankingBlocks currentParticipantId={participant?.id} weeklyRanking={buildWeeklyRanking(results, weeklyKey)} globalRanking={buildGlobalRanking(results)} />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-xl md:rounded-[2rem]">
      <div className="relative bg-secondary px-4 py-5 text-secondary-foreground md:px-8 md:py-6">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Trivia semanal · {weeklyKey}</p>
            <h2 className="mt-1 font-display text-xl font-extrabold md:text-3xl">Pregunta {current + 1} de {total}</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/15 md:px-4 md:py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Aciertos</p>
            <p className="font-display text-2xl font-extrabold md:text-3xl">{score}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 md:px-8 md:py-8">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mt-5 rounded-[1.25rem] border border-border bg-muted/25 p-4 md:mt-6 md:rounded-[1.5rem] md:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary"><Flame className="h-3.5 w-3.5" />A todo o nada</div>
          <h2 className="font-display text-xl font-extrabold leading-tight md:text-3xl">{question.question}</h2>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 md:mt-5 md:gap-3">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctIndex
            const isSelected = index === selected
            let stateClass = "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
            let icon: React.ReactNode = null
            if (revealed) {
              if (isCorrect) {
                stateClass = "border-green-500/60 bg-green-500/10"
                icon = <Check className="h-4 w-4 text-green-600" />
              } else if (isSelected) {
                stateClass = "border-primary/60 bg-primary/10"
                icon = <X className="h-4 w-4 text-primary" />
              }
            }
            return (
              <li key={index}>
                <button type="button" onClick={() => choose(index)} disabled={revealed} className={cn("flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all md:min-h-20 md:px-4 md:py-4", stateClass)}>
                  <span className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-extrabold">{String.fromCharCode(65 + index)}</span>{option}</span>
                  {icon}
                </button>
              </li>
            )
          })}
        </ul>
        {revealed && question.explanation && <p className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">{question.explanation}</p>}
        {saveError && <p className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm font-semibold text-primary">{saveError}</p>}
        <div className="mt-5 flex justify-end md:mt-6">
          <Button onClick={next} disabled={!revealed || isSaving} size="lg" className="w-full rounded-full px-8 sm:w-auto">{isSaving ? "Guardando..." : current + 1 >= total ? "Guardar resultado" : "Siguiente"}</Button>
        </div>
      </div>
    </div>
  )
}

function saveNewParticipant(participant: TriviaParticipant) {
  if (typeof window !== "undefined") window.localStorage.setItem("medio-river-trivia-participant-v1", JSON.stringify(participant))
}

function buildWeeklyRanking(results: PublicTriviaResult[], weeklyKey: string) {
  return results
    .filter((result) => result.dailyKey === weeklyKey)
    .sort((a, b) => b.score - a.score || new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())
    .map((result) => ({ id: result.rankingId, name: result.participantName, score: result.score, totalQuestions: result.totalQuestions }))
}

function buildGlobalRanking(results: PublicTriviaResult[]) {
  const grouped = new Map<string, { id: string; name: string; totalScore: number; gamesPlayed: number }>()
  for (const result of results) {
    const current = grouped.get(result.rankingId) ?? { id: result.rankingId, name: result.participantName, totalScore: 0, gamesPlayed: 0 }
    current.totalScore += result.score
    current.gamesPlayed += 1
    current.name = result.participantName
    grouped.set(result.rankingId, current)
  }
  return Array.from(grouped.values()).sort((a, b) => b.totalScore - a.totalScore || a.gamesPlayed - b.gamesPlayed || a.name.localeCompare(b.name))
}

function GameHero({ children, eyebrow, icon, title }: { children: React.ReactNode; eyebrow: string; icon: React.ReactNode; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 text-center shadow-xl md:rounded-[2rem] md:p-12">
      <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="relative">
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">{icon}</div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-4xl">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function RulePill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-background px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-extrabold">{value}</p></div>
}

function RankingBlocks({
  currentParticipantId,
  weeklyRanking,
  globalRanking,
}: {
  currentParticipantId?: string
  weeklyRanking: Array<{ id: string; name: string; score: number; totalQuestions: number }>
  globalRanking: Array<{ id: string; name: string; totalScore: number; gamesPlayed: number }>
}) {
  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <RankingCard
        title="Ranking semanal"
        subtitle="Esta semana"
        rows={weeklyRanking.map((entry) => ({ id: entry.id, name: entry.name, value: `${entry.score}/${entry.totalQuestions}` }))}
        currentParticipantId={currentParticipantId}
      />
      <RankingCard
        title="Ranking general"
        subtitle="Acumulado"
        rows={globalRanking.map((entry) => ({ id: entry.id, name: entry.name, value: `${entry.totalScore} pts` }))}
        currentParticipantId={currentParticipantId}
      />
    </div>
  )
}

function RankingCard({ title, subtitle, rows, currentParticipantId }: { title: string; subtitle: string; rows: Array<{ id: string; name: string; value: string }>; currentParticipantId?: string }) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{subtitle}</p><h3 className="mt-1 font-display text-xl font-extrabold">{title}</h3></div>
        <Trophy className="h-5 w-5 text-primary" />
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">Todavía no hay resultados.</p> : rows.slice(0, 20).map((row, index) => (
          <div key={`${row.id}-${index}`} className={cn("flex items-center gap-3 px-5 py-3", row.id === currentParticipantId && "bg-primary/5")}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-extrabold">{index < 3 ? <Medal className="h-4 w-4 text-primary" /> : index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.name}{row.id === currentParticipantId ? " · Vos" : ""}</span>
            <span className="text-sm font-extrabold text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
