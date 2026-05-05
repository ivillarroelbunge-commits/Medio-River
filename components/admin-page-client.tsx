"use client"

import { type ReactNode, useMemo, useState } from "react"
import { CalendarDays, ChevronDown, FilePenLine, ShieldCheck, ShieldQuestion, Trophy, Users } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { EditorNewsForm } from "@/components/editor-news-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Competition, DailyTrivia, Match, NewsArticle, SquadPlayer, TriviaQuestion, UserRole } from "@/lib/data/types"
import { getAutomaticMatchUpdate } from "@/lib/match-autofill"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/roles"

const roles: UserRole[] = ["admin", "editor", "user"]
const sections = [
  { key: "noticias", label: "Noticias", icon: FilePenLine },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "jugadores", label: "Jugadores", icon: ShieldCheck },
  { key: "partidos", label: "Partidos", icon: CalendarDays },
  { key: "trivia", label: "Trivia", icon: ShieldQuestion },
] as const

const competitions: Competition[] = ["Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]
const playerLines: SquadPlayer["line"][] = ["Arqueros", "Defensores", "Mediocampistas", "Delanteros"]

export function AdminPageClient() {
  const {
    currentUser,
    dailyTrivias,
    matches,
    news,
    squadPlayers,
    triviaResults,
    triviaQuestions,
    users,
    createTriviaQuestion,
    deleteNews,
    deleteTriviaQuestion,
    saveNews,
    saveDailyTrivia,
    saveTriviaQuestion,
    updateMatch,
    updateSquadPlayer,
    updateUserRole,
  } = useAppState()
  const [active, setActive] = useState<(typeof sections)[number]["key"]>("noticias")
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null)
  const [editingPlayer, setEditingPlayer] = useState<SquadPlayer | null>(null)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [editingTriviaQuestion, setEditingTriviaQuestion] = useState<TriviaQuestion | null>(null)
  const [creatingTriviaQuestion, setCreatingTriviaQuestion] = useState(false)
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false)
  const [activeTriviaDay, setActiveTriviaDay] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingNewsId, setPendingNewsId] = useState<string | null>(null)

  const orderedUsers = useMemo(() => {
    const order: Record<UserRole, number> = { admin: 0, editor: 1, user: 2 }
    return [...users].sort((a, b) => {
      if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role]
      return a.name.localeCompare(b.name)
    })
  }, [users])

  const sortedMatches = useMemo(
    () => matches.slice().sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [matches],
  )

  const triviaPlannerDays = useMemo(
    () => buildTriviaPlannerDays(dailyTrivias),
    [dailyTrivias],
  )

  const triviaQuestionById = useMemo(
    () => new Map(triviaQuestions.map((question) => [question.id, question])),
    [triviaQuestions],
  )
  const usedTriviaQuestionIds = useMemo(
    () => new Set(dailyTrivias.flatMap((dailyTrivia) => dailyTrivia.questionIds)),
    [dailyTrivias],
  )
  const lockedTriviaDays = useMemo(
    () => new Set(triviaResults.map((result) => result.dailyKey).filter((dailyKey): dailyKey is string => Boolean(dailyKey))),
    [triviaResults],
  )

  const newsCategoryOptions = useMemo(() => getUniqueNewsOptions(news.map((article) => article.category)), [news])
  const newsCompetitionOptions = useMemo(() => getUniqueNewsOptions(news.map((article) => article.competition)), [news])

  const counts = {
    news: news.length,
    users: users.length,
    players: squadPlayers.length,
    matches: matches.length,
    triviaQuestions: triviaQuestions.length,
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="space-y-4 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:space-y-5 md:rounded-[2rem] md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel admin</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">Centro de gestión</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Desde acá el administrador edita noticias, usuarios, jugadores y partidos de River.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-5">
          <StatCard icon={<FilePenLine className="h-4 w-4 text-primary" />} label="Noticias" value={String(counts.news)} />
          <StatCard icon={<Users className="h-4 w-4 text-primary" />} label="Usuarios" value={String(counts.users)} />
          <StatCard icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Jugadores" value={String(counts.players)} />
          <StatCard icon={<Trophy className="h-4 w-4 text-primary" />} label="Partidos" value={String(counts.matches)} />
          <StatCard icon={<ShieldQuestion className="h-4 w-4 text-primary" />} label="Preguntas" value={String(counts.triviaQuestions)} />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto border-t border-border px-1 pt-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pt-5">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  setActive(section.key)
                  setError(null)
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${active === section.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            )
          })}
        </div>
      </section>

      {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{error}</p>}

      {active === "noticias" && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-extrabold md:text-2xl">Noticias</h2>
              <p className="text-sm text-muted-foreground">Editar o eliminar notas publicadas.</p>
            </div>
            {editingNews && <Badge variant="outline" className="rounded-full">Editando: {editingNews.title}</Badge>}
          </div>

          {news.map((article) => (
            <div key={article.id} className="space-y-3">
              <div className={`flex flex-col gap-3 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${editingNews?.id === article.id ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                <div>
                  <p className="font-semibold text-foreground">{article.title}</p>
                  <p className="text-sm text-muted-foreground">{article.category} · {article.competition ?? "Sin competencia"}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditingNews(editingNews?.id === article.id ? null : article)}>
                    {editingNews?.id === article.id ? "Cerrar" : "Editar"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-full"
                    disabled={pendingNewsId === article.id}
                    onClick={async () => {
                      setError(null)
                      setPendingNewsId(article.id)
                      const result = await deleteNews(article.id)
                      setPendingNewsId(null)
                      if (!result.ok) setError(result.error ?? "No se pudo eliminar la noticia.")
                    }}
                  >
                    {pendingNewsId === article.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </div>
              {editingNews?.id === article.id && (
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
                  <EditorNewsForm
                    categoryOptions={newsCategoryOptions}
                    competitionOptions={newsCompetitionOptions}
                    initialArticle={editingNews}
                    submitLabel="Guardar cambios"
                    onSubmit={async (input) => {
                      setError(null)
                      setPendingNewsId(input.id ?? "new")
                      const result = await saveNews(input)
                      setPendingNewsId(null)
                      if (!result.ok) {
                        setError(result.error ?? "No se pudo guardar la noticia.")
                        return
                      }
                      setEditingNews(null)
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {active === "usuarios" && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <h2 className="font-display text-xl font-extrabold md:text-2xl">Usuarios</h2>
          {orderedUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-border p-3 md:flex-row md:items-center md:justify-between md:p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <Badge variant="outline" className={`rounded-full ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  {currentUser?.id === user.id && (
                    <Badge variant="outline" className="rounded-full border-border bg-muted text-muted-foreground">
                      Tu cuenta
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              </div>
              <select
                value={user.role}
                onChange={async (event) => {
                  setError(null)
                  setPendingUserId(user.id)
                  const result = await updateUserRole(user.id, event.target.value as UserRole)
                  setPendingUserId(null)
                  if (!result.ok) setError(result.error ?? "No se pudo actualizar el rol.")
                }}
                disabled={pendingUserId === user.id || currentUser?.id === user.id}
                className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm disabled:opacity-60 md:w-auto"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{getRoleLabel(role)}</option>
                ))}
              </select>
            </div>
          ))}
        </section>
      )}

      {active === "jugadores" && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">Jugadores</h2>
            <p className="text-sm text-muted-foreground">Modificar datos del plantel que se ven en Plantel y Arma tu equipo.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {squadPlayers.map((player) => (
              <div key={player.id} className={`space-y-3 rounded-2xl border p-3 md:p-4 ${editingPlayer?.id === player.id ? "border-primary/40 bg-primary/5 md:col-span-2" : "border-border"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">#{player.number} · {player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.line} · {player.position}</p>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto" onClick={() => setEditingPlayer(editingPlayer?.id === player.id ? null : player)}>
                    {editingPlayer?.id === player.id ? "Cerrar" : "Editar"}
                  </Button>
                </div>
                {editingPlayer?.id === player.id && (
                  <PlayerEditForm player={editingPlayer} onCancel={() => setEditingPlayer(null)} onSave={(updatedPlayer) => {
                    updateSquadPlayer(updatedPlayer)
                    setEditingPlayer(null)
                  }} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {active === "partidos" && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">Partidos de River</h2>
            <p className="text-sm text-muted-foreground">Modificar fixture, resultados, estadio y TV.</p>
          </div>

          <div className="space-y-3">
            {sortedMatches.map((match) => (
              <div key={match.id} className="space-y-3">
                <div className={`flex flex-col gap-3 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${editingMatch?.id === match.id ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                  <div>
                    <p className="font-semibold text-foreground">{match.isHome ? "River Plate" : match.opponent} vs. {match.isHome ? match.opponent : "River Plate"}</p>
                    <p className="text-sm text-muted-foreground">{match.competition} · {new Date(match.date).toLocaleString("es-AR")} · {match.status === "played" ? `${match.riverScore ?? 0}-${match.opponentScore ?? 0}` : "Próximo"}</p>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto" onClick={() => setEditingMatch(editingMatch?.id === match.id ? null : match)}>
                    {editingMatch?.id === match.id ? "Cerrar" : "Editar"}
                  </Button>
                </div>
                {editingMatch?.id === match.id && (
                  <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
                    <MatchEditForm
                      match={editingMatch}
                      onCancel={() => setEditingMatch(null)}
                      onAutofill={async (matchToAutofill) => {
                        setError(null)
                        const automaticMatch = getAutomaticMatchUpdate(matchToAutofill)
                        if (!automaticMatch) {
                          setError("Todavía no hay una carga automática disponible para este partido.")
                          return false
                        }

                        const result = await updateMatch(automaticMatch)
                        if (!result.ok) {
                          setError(result.error ?? "No se pudo guardar el partido.")
                          return false
                        }

                        setEditingMatch(null)
                        return true
                      }}
                      onSave={async (updatedMatch) => {
                        setError(null)
                        const result = await updateMatch(updatedMatch)
                        if (!result.ok) {
                          setError(result.error ?? "No se pudo guardar el partido.")
                          return
                        }
                        setEditingMatch(null)
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {active === "trivia" && (
        <section className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-6 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-extrabold md:text-2xl">Trivia diaria</h2>
              <p className="text-sm text-muted-foreground">Primero cargá preguntas. Después armá la trivia de cada día con 5 preguntas.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-background p-3 md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold md:text-xl">Banco de preguntas</h3>
                <p className="text-sm text-muted-foreground">{triviaQuestions.length} preguntas cargadas. La respuesta correcta se marca con el círculo de cada opción.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsQuestionBankOpen((value) => !value)}
                >
                  <ChevronDown className={`h-4 w-4 transition ${isQuestionBankOpen ? "rotate-180" : ""}`} />
                  {isQuestionBankOpen ? "Ocultar banco" : "Ver banco"}
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => {
                    setIsQuestionBankOpen(true)
                    setEditingTriviaQuestion(null)
                    setCreatingTriviaQuestion((value) => !value)
                  }}
                >
                  {creatingTriviaQuestion ? "Cerrar formulario" : "Nueva pregunta"}
                </Button>
              </div>
            </div>

            {isQuestionBankOpen && (
            <div className="space-y-3 border-t border-border pt-4">
              {creatingTriviaQuestion && (
                <TriviaQuestionForm
                  onCancel={() => setCreatingTriviaQuestion(false)}
                  onSave={async (question) => {
                    setError(null)
                    const result = await createTriviaQuestion(question)
                    if (!result.ok) {
                      setError(result.error ?? "No se pudo crear la pregunta.")
                      return
                    }
                    setCreatingTriviaQuestion(false)
                  }}
                />
              )}

              {triviaQuestions.map((question) => (
                <div key={question.id} className={`space-y-3 rounded-2xl border p-3 md:p-4 ${editingTriviaQuestion?.id === question.id ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{question.question}</p>
                        {usedTriviaQuestionIds.has(question.id) && (
                          <Badge variant="outline" className="rounded-full border-primary/25 bg-primary/10 text-primary">
                            Usada
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Correcta: {question.options[question.correctIndex] ?? "Sin definir"}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditingTriviaQuestion(editingTriviaQuestion?.id === question.id ? null : question)}>
                        {editingTriviaQuestion?.id === question.id ? "Cerrar" : "Editar"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-full"
                        disabled={usedTriviaQuestionIds.has(question.id)}
                        onClick={async () => {
                          setError(null)
                          const result = await deleteTriviaQuestion(question.id)
                          if (!result.ok) setError(result.error ?? "No se pudo eliminar la pregunta.")
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  {editingTriviaQuestion?.id === question.id && (
                    <TriviaQuestionForm
                      question={editingTriviaQuestion}
                      onCancel={() => setEditingTriviaQuestion(null)}
                      onSave={async (updatedQuestion) => {
                        setError(null)
                        const result = await saveTriviaQuestion({ ...updatedQuestion, id: question.id })
                        if (!result.ok) {
                          setError(result.error ?? "No se pudo guardar la pregunta.")
                          return
                        }
                        setEditingTriviaQuestion(null)
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-background p-3 md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold md:text-xl">Trivias por día</h3>
                <p className="text-sm text-muted-foreground">Elegí un día y seleccioná sus 5 preguntas.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                  {triviaPlannerDays.filter((day) => day.trivia).length} programados
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {triviaPlannerDays.filter((day) => !day.trivia).length} pendientes
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {triviaPlannerDays.map((day) => {
                const programmedQuestions = day.trivia?.questionIds
                  .map((questionId) => triviaQuestionById.get(questionId))
                  .filter((question): question is TriviaQuestion => Boolean(question)) ?? []
                const isActive = activeTriviaDay === day.dailyKey
                const isLocked = lockedTriviaDays.has(day.dailyKey)

                return (
                  <article key={day.dailyKey} className={`space-y-3 rounded-2xl border p-3 md:p-4 ${isLocked ? "border-zinc-900/20 bg-zinc-900/[0.03]" : day.trivia ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{day.weekday}</p>
                        <h4 className="font-display text-lg font-extrabold">{day.label}</h4>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {isLocked && (
                          <Badge variant="outline" className="rounded-full border-zinc-900/15 bg-zinc-900 text-white">
                            Con participantes
                          </Badge>
                        )}
                        <Badge variant="outline" className={`rounded-full ${day.trivia ? "border-primary/30 bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"}`}>
                          {day.trivia ? "Programada" : "Sin programar"}
                        </Badge>
                        <Button type="button" variant={day.trivia ? "outline" : "default"} className="rounded-full" onClick={() => setActiveTriviaDay(isActive ? null : day.dailyKey)}>
                          {isActive ? "Cerrar" : isLocked ? "Ver preguntas" : day.trivia ? "Editar" : "Programar"}
                        </Button>
                      </div>
                    </div>

                    {day.trivia && !isActive && (
                      <div className="grid gap-2 md:grid-cols-5">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <div key={index} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">
                            <span className="text-primary">{index + 1}.</span> {programmedQuestions[index]?.question ?? "Sin definir"}
                          </div>
                        ))}
                      </div>
                    )}

                    {isActive && (
                      <DailyTriviaForm
                        dailyKey={day.dailyKey}
                        dailyTrivia={day.trivia ?? null}
                        isLocked={isLocked}
                        questions={triviaQuestions}
                        usedQuestionIds={usedTriviaQuestionIds}
                        onCancel={() => setActiveTriviaDay(null)}
                        onSave={async (dailyTrivia) => {
                          setError(null)
                          const result = await saveDailyTrivia(dailyTrivia)
                          if (!result.ok) {
                            setError(result.error ?? "No se pudo guardar la trivia diaria.")
                            return
                          }
                          setActiveTriviaDay(null)
                        }}
                      />
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function getUniqueNewsOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())))
}

type EditableTriviaQuestion = Omit<TriviaQuestion, "id"> & { id?: string }

interface TriviaPlannerDay {
  dailyKey: string
  label: string
  weekday: string
  trivia?: DailyTrivia
}

const triviaPlannerDaysCount = 14

function buildTriviaPlannerDays(dailyTrivias: DailyTrivia[]): TriviaPlannerDay[] {
  const programmedByDay = new Map(dailyTrivias.map((dailyTrivia) => [dailyTrivia.dailyKey, dailyTrivia]))
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  return Array.from({ length: triviaPlannerDaysCount }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    const dailyKey = getDateInputValue(date)

    return {
      dailyKey,
      label: date.toLocaleDateString("es-AR", { day: "numeric", month: "long" }),
      weekday: date.toLocaleDateString("es-AR", { weekday: "long" }),
      trivia: programmedByDay.get(dailyKey),
    }
  })
}

function getDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function TriviaQuestionForm({
  onCancel,
  onSave,
  question,
}: {
  onCancel: () => void
  onSave: (question: EditableTriviaQuestion) => void
  question?: TriviaQuestion
}) {
  const options = question?.options.length === 4 ? question.options : ["", "", "", ""]
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0)

  return (
    <form
      className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const nextOptions = [0, 1, 2, 3].map((index) => String(formData.get(`option-${index}`) || "").trim())
        const nextCorrectIndex = Number(formData.get("correctIndex") || 0)
        const nextQuestion = String(formData.get("question") || "").trim()

        if (!nextQuestion || nextOptions.some((option) => !option)) {
          return
        }

        onSave({
          id: question?.id,
          question: nextQuestion,
          options: nextOptions,
          correctIndex: nextCorrectIndex,
          explanation: String(formData.get("explanation") || "").trim() || undefined,
        })
      }}
    >
      <label className="space-y-1.5 text-sm font-semibold text-foreground">
        <span>Pregunta</span>
        <textarea name="question" defaultValue={question?.question ?? ""} rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal" />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Respuestas</p>
        <p className="text-xs text-muted-foreground">Marcá el círculo de la respuesta correcta.</p>
        {options.map((option, index) => (
          <label
            key={index}
            className={`grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_auto] md:items-center ${correctIndex === index ? "border-primary bg-background shadow-sm" : "border-border bg-card"}`}
          >
            <span className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Respuesta {String.fromCharCode(65 + index)}
              </span>
              <input name={`option-${index}`} defaultValue={option} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal" />
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${correctIndex === index ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
              <input
                name="correctIndex"
                type="radio"
                value={index}
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
                className="h-4 w-4 accent-primary"
              />
              Correcta
            </span>
          </label>
        ))}
      </div>

      <label className="space-y-1.5 text-sm font-semibold text-foreground">
        <span>Explicación</span>
        <textarea name="explanation" defaultValue={question?.explanation ?? ""} rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal" />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="rounded-full">Guardar pregunta</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function DailyTriviaForm({
  dailyKey,
  dailyTrivia,
  isLocked,
  onCancel,
  onSave,
  questions,
  usedQuestionIds,
}: {
  dailyKey: string
  dailyTrivia: DailyTrivia | null
  isLocked: boolean
  onCancel: () => void
  onSave: (dailyTrivia: DailyTrivia) => void
  questions: TriviaQuestion[]
  usedQuestionIds: Set<string>
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const orderedQuestions = useMemo(
    () => questions.slice().sort((a, b) => {
      const aSelected = dailyTrivia?.questionIds.includes(a.id) ? 0 : 1
      const bSelected = dailyTrivia?.questionIds.includes(b.id) ? 0 : 1
      if (aSelected !== bSelected) return aSelected - bSelected

      const aUsed = usedQuestionIds.has(a.id) ? 1 : 0
      const bUsed = usedQuestionIds.has(b.id) ? 1 : 0
      if (aUsed !== bUsed) return aUsed - bUsed

      return a.question.localeCompare(b.question)
    }),
    [dailyTrivia?.questionIds, questions, usedQuestionIds],
  )

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const questionIds = [0, 1, 2, 3, 4]
          .map((index) => String(formData.get(`question-${index}`) || ""))
          .filter(Boolean)
        const uniqueQuestionIds = Array.from(new Set(questionIds))

        if (uniqueQuestionIds.length !== 5) {
          setFormError("Elegí 5 preguntas distintas.")
          return
        }

        setFormError(null)
        onSave({ dailyKey, questionIds: uniqueQuestionIds })
      }}
    >
      {isLocked && (
        <p className="rounded-xl border border-zinc-900/15 bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
          Esta trivia ya tiene participantes: no se puede cambiar la selección de preguntas. Sí podés corregir redacción o respuesta correcta editando cada pregunta desde el banco.
        </p>
      )}
      <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
        <span className="font-semibold text-foreground">Fecha: </span>
        <span className="text-muted-foreground">{dailyKey}</span>
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <label key={index} className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>Pregunta {index + 1}</span>
            <select
              name={`question-${index}`}
              defaultValue={dailyTrivia?.questionIds[index] ?? ""}
              disabled={isLocked}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal"
            >
              <option value="">Elegir pregunta</option>
              {orderedQuestions.map((question) => (
                <option key={question.id} value={question.id}>
                  {usedQuestionIds.has(question.id) ? "[USADA] " : ""}{question.question}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {formError && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{formError}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="rounded-full" disabled={isLocked}>{dailyTrivia ? "Actualizar trivia" : "Programar trivia"}</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function PlayerEditForm({ player, onCancel, onSave }: { player: SquadPlayer; onCancel: () => void; onSave: (player: SquadPlayer) => void }) {
  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        onSave({
          ...player,
          name: String(formData.get("name") || player.name),
          number: Number(formData.get("number") || player.number),
          line: String(formData.get("line") || player.line) as SquadPlayer["line"],
          position: String(formData.get("position") || player.position),
          age: Number(formData.get("age") || player.age),
          nationality: String(formData.get("nationality") || player.nationality),
          foot: String(formData.get("foot") || player.foot),
          image: String(formData.get("image") || "") || undefined,
          fromAcademy: formData.get("fromAcademy") === "on",
        })
      }}
    >
      <AdminInput label="Nombre" name="name" defaultValue={player.name} />
      <AdminInput label="Número" name="number" type="number" defaultValue={String(player.number)} />
      <AdminSelect label="Línea" name="line" defaultValue={player.line} options={playerLines} />
      <AdminInput label="Posición" name="position" defaultValue={player.position} />
      <AdminInput label="Edad" name="age" type="number" defaultValue={String(player.age)} />
      <AdminInput label="Nacionalidad" name="nationality" defaultValue={player.nationality} />
      <AdminInput label="Pierna" name="foot" defaultValue={player.foot} />
      <AdminInput label="Imagen URL" name="image" defaultValue={player.image ?? ""} />
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <input name="fromAcademy" type="checkbox" defaultChecked={player.fromAcademy} />
        Formado en River
      </label>
      <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
        <Button type="submit" className="rounded-full">Guardar jugador</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function MatchEditForm({
  match,
  onAutofill,
  onCancel,
  onSave,
}: {
  match: Match
  onAutofill: (match: Match) => Promise<boolean>
  onCancel: () => void
  onSave: (match: Match) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isAutofilling, setIsAutofilling] = useState(false)

  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault()
        setIsSaving(true)
        const formData = new FormData(event.currentTarget)
        const status = String(formData.get("status") || match.status) as Match["status"]
        await onSave({
          ...match,
          opponent: String(formData.get("opponent") || match.opponent),
          competition: String(formData.get("competition") || match.competition) as Competition,
          date: String(formData.get("date") || match.date),
          status,
          isHome: formData.get("isHome") === "home",
          stadium: String(formData.get("stadium") || match.stadium),
          tvChannel: String(formData.get("tvChannel") || "") || undefined,
          riverScore: status === "played" ? Number(formData.get("riverScore") || 0) : undefined,
          opponentScore: status === "played" ? Number(formData.get("opponentScore") || 0) : undefined,
        })
        setIsSaving(false)
      }}
    >
      <AdminInput label="Rival" name="opponent" defaultValue={match.opponent} />
      <AdminSelect label="Competencia" name="competition" defaultValue={match.competition} options={competitions} />
      <AdminInput label="Fecha ISO" name="date" defaultValue={match.date} />
      <AdminSelect label="Estado" name="status" defaultValue={match.status} options={["upcoming", "played"]} />
      <AdminSelect label="Condición" name="isHome" defaultValue={match.isHome ? "home" : "away"} options={["home", "away"]} />
      <AdminInput label="Estadio" name="stadium" defaultValue={match.stadium} />
      <AdminInput label="TV" name="tvChannel" defaultValue={match.tvChannel ?? ""} />
      <AdminInput label="Goles River" name="riverScore" type="number" defaultValue={String(match.riverScore ?? 0)} />
      <AdminInput label="Goles rival" name="opponentScore" type="number" defaultValue={String(match.opponentScore ?? 0)} />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:col-span-2">
        <Button type="submit" className="rounded-full" disabled={isSaving || isAutofilling}>
          {isSaving ? "Guardando..." : "Guardar partido"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          disabled={isSaving || isAutofilling}
          onClick={async () => {
            setIsAutofilling(true)
            await onAutofill(match)
            setIsAutofilling(false)
          }}
        >
          {isAutofilling ? "Cargando..." : "Cargar datos automáticos"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminInput({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal" />
    </label>
  )
}

function AdminSelect({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3 md:p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground md:gap-2 md:text-sm">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-foreground md:mt-3 md:text-3xl">{value}</p>
    </div>
  )
}
