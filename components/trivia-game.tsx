"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Check, Clock, Flame, LockKeyhole, Medal, ShieldQuestion, Trophy, X } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getDailyTriviaQuestions, getTriviaDailyKey } from "@/lib/trivia-daily"

type Phase = "start" | "playing" | "finished"

export function TriviaGame() {
  const {
    addTriviaResult,
    currentUser,
    dailyTrivias,
    getDailyRanking,
    hasPlayedDailyTrivia,
    ranking,
    triviaQuestions,
  } = useAppState()
  const dailyKey = useMemo(() => getTriviaDailyKey(), [])
  const dailyQuestions = useMemo(() => {
    const programmedTrivia = dailyTrivias.find((item) => item.dailyKey === dailyKey)
    if (programmedTrivia?.questionIds.length) {
      const questionById = new Map(triviaQuestions.map((question) => [question.id, question]))
      const programmedQuestions = programmedTrivia.questionIds
        .map((questionId) => questionById.get(questionId))
        .filter((question) => Boolean(question))

      if (programmedQuestions.length > 0) return programmedQuestions.slice(0, 5)
    }

    return getDailyTriviaQuestions(triviaQuestions, dailyKey)
  }, [dailyKey, dailyTrivias, triviaQuestions])
  const alreadyPlayed = currentUser ? hasPlayedDailyTrivia(currentUser.id, dailyKey) : false
  const dailyRanking = getDailyRanking(dailyKey)
  const [phase, setPhase] = useState<Phase>("start")
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const total = dailyQuestions.length
  const question = dailyQuestions[current]
  const progress = useMemo(() => (total > 0 ? Math.round(((current + (revealed ? 1 : 0)) / total) * 100) : 0), [current, revealed, total])

  const start = () => {
    if (!currentUser || alreadyPlayed) return
    setPhase("playing")
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setSaveError(null)
  }

  const choose = (index: number) => {
    if (revealed || !question) return
    setSelected(index)
    setRevealed(true)
    if (index === question.correctIndex) setScore((value) => value + 1)
  }

  if (total === 0 || !question) {
    return (
      <div className="space-y-6">
        <GameHero icon={<ShieldQuestion className="h-8 w-8" />} eyebrow="Trivia en preparación" title="Todavía no hay preguntas cargadas">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Un administrador tiene que cargar preguntas desde el panel admin para activar la trivia diaria.</p>
        </GameHero>
        <RankingBlocks dailyRanking={dailyRanking} globalRanking={ranking} />
      </div>
    )
  }

  const next = async () => {
    if (current + 1 >= total) {
      if (currentUser) {
        setIsSaving(true)
        setSaveError(null)
        const result = await addTriviaResult(score, total, dailyKey)
        setIsSaving(false)

        if (!result.ok) {
          setSaveError(result.error ?? "No se pudo guardar el resultado.")
          return
        }
      }
      setPhase("finished")
      return
    }
    setCurrent((value) => value + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <GameHero icon={<LockKeyhole className="h-8 w-8" />} eyebrow="Acceso requerido" title="Trivia diaria para usuarios">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Iniciá sesión para jugar las 5 preguntas del día, guardar tu puntaje y entrar al ranking.</p>
          <Button asChild size="lg" className="mt-6 rounded-full px-10">
            <Link href="/iniciar-sesion">Iniciar sesión</Link>
          </Button>
        </GameHero>
        <RankingBlocks dailyRanking={dailyRanking} globalRanking={ranking} />
      </div>
    )
  }

  if (alreadyPlayed && phase !== "finished") {
    return (
      <div className="space-y-6">
        <GameHero icon={<Clock className="h-8 w-8" />} eyebrow={`Trivia del día · ${dailyKey}`} title="Ya jugaste la trivia de hoy">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Volvé mañana para una nueva trivia de 5 preguntas. Tu resultado de hoy ya cuenta para el ranking diario y el general.</p>
        </GameHero>
        <RankingBlocks dailyRanking={dailyRanking} globalRanking={ranking} />
      </div>
    )
  }

  if (phase === "start") {
    return (
      <div className="space-y-6">
        <GameHero icon={<ShieldQuestion className="h-8 w-8" />} eyebrow={`Trivia del día · ${dailyKey}`} title="5 preguntas, un solo intento">
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Cada usuario puede jugar una vez por día. El puntaje suma al ranking diario y al ranking general acumulado.</p>
          <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            <RulePill label="Preguntas" value="5" />
            <RulePill label="Intentos" value="1" />
            <RulePill label="Ranking" value="Diario" />
          </div>
          <Button onClick={start} size="lg" className="mt-6 rounded-full px-10">Jugar trivia diaria</Button>
        </GameHero>
        <RankingBlocks dailyRanking={dailyRanking} globalRanking={ranking} />
      </div>
    )
  }

  if (phase === "finished") {
    const updatedDailyRanking = getDailyRanking(dailyKey)
    return (
      <div className="space-y-6">
        <GameHero icon={<Trophy className="h-8 w-8" />} eyebrow="Resultado guardado" title="Resultado de hoy">
          <p className="mt-3 font-display text-5xl font-extrabold text-primary md:text-6xl">{score}<span className="text-3xl text-muted-foreground">/{total}</span></p>
          <p className="mt-3 text-muted-foreground">Tu resultado quedó guardado. Mañana vas a tener una trivia nueva.</p>
        </GameHero>
        <RankingBlocks dailyRanking={updatedDailyRanking} globalRanking={ranking} />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-xl md:rounded-[2rem]">
      <div className="relative bg-secondary px-4 py-5 text-secondary-foreground md:px-8 md:py-6">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,transparent_0%,transparent_45%,white_46%,white_49%,transparent_50%,transparent_100%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Trivia diaria · {dailyKey}</p>
            <h2 className="mt-1 font-display text-xl font-extrabold md:text-3xl">Pregunta {current + 1} de {total}</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/15 md:px-4 md:py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Aciertos</p>
            <p className="font-display text-2xl font-extrabold md:text-3xl">{score}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 md:px-8 md:py-8">
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-primary via-red-500 to-black transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 rounded-[1.25rem] border border-border bg-muted/25 p-4 md:mt-6 md:rounded-[1.5rem] md:p-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          <Flame className="h-3.5 w-3.5" />
          A todo o nada
        </div>
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
              <button type="button" onClick={() => choose(index)} disabled={revealed} className={cn("flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none md:min-h-20 md:px-4 md:py-4", stateClass)}>
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-extrabold text-foreground md:h-9 md:w-9">{String.fromCharCode(65 + index)}</span>
                  {option}
                </span>
                {icon}
              </button>
            </li>
          )
        })}
      </ul>
      {revealed && question.explanation && <p className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">{question.explanation}</p>}
      {saveError && <p className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm font-semibold text-primary">{saveError}</p>}
      <div className="mt-5 flex justify-end md:mt-6">
        <Button onClick={next} disabled={!revealed || isSaving} size="lg" className="w-full rounded-full px-8 sm:w-auto">
          {isSaving ? "Guardando..." : current + 1 >= total ? "Guardar resultado" : "Siguiente"}
        </Button>
      </div>
      </div>
    </div>
  )
}

function GameHero({
  children,
  eyebrow,
  icon,
  title,
}: {
  children: React.ReactNode
  eyebrow: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 text-center shadow-xl md:rounded-[2rem] md:p-12">
      <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
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
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold text-foreground">{value}</p>
    </div>
  )
}

function RankingBlocks({
  dailyRanking,
  globalRanking,
}: {
  dailyRanking: Array<{ user: { id: string; name: string }; score: number; totalQuestions: number }>
  globalRanking: Array<{ user: { id: string; name: string }; totalScore: number; gamesPlayed: number }>
}) {
  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
        <div className="flex items-center justify-between bg-secondary px-4 py-3 text-secondary-foreground md:px-5 md:py-4">
          <h3 className="font-display text-lg font-extrabold md:text-xl">Ranking diario</h3>
          <Medal className="h-5 w-5 text-primary" />
        </div>
        <div className="p-4 md:p-5">
        <div className="space-y-2 md:mt-4">
          {dailyRanking.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Todavía nadie jugó hoy.</p>
          ) : dailyRanking.slice(0, 10).map((entry, index) => (
            <div key={entry.user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm md:px-4 md:py-3">
              <span className="font-semibold">{index + 1}. {entry.user.name}</span>
              <span className="font-semibold text-primary">{entry.score}/{entry.totalQuestions}</span>
            </div>
          ))}
        </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground md:px-5 md:py-4">
          <h3 className="font-display text-lg font-extrabold md:text-xl">Ranking general</h3>
          <Trophy className="h-5 w-5" />
        </div>
        <div className="p-4 md:p-5">
        <div className="space-y-2 md:mt-4">
          {globalRanking.slice(0, 10).map((entry, index) => (
            <div key={entry.user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm md:px-4 md:py-3">
              <span className="font-semibold">{index + 1}. {entry.user.name}</span>
              <span className="font-semibold text-primary">{entry.totalScore} pts</span>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
