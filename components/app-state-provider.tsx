"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Provider, User } from "@supabase/supabase-js"
import {
  createInitialState,
  createNewsArticleId,
  createSlug,
  createTriviaQuestionId,
  createTriviaResultId,
  STORAGE_KEY,
} from "@/lib/app-state"
import type { AppUser, DailyTrivia, Match, NewsArticle, SquadPlayer, TriviaQuestion, TriviaResult, UserRole } from "@/lib/data/types"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchNewsArticles, mapNewsRowToArticle, NEWS_SELECT } from "@/lib/supabase/news"
import { mapProfileToAppUser, type ProfileRow } from "@/lib/supabase/profiles"

interface RegisterInput {
  name: string
  email: string
  password: string
  captchaToken?: string
}

interface NewsInput {
  id?: string
  title: string
  intro: string
  content: string
  category: NewsArticle["category"]
  competition?: NewsArticle["competition"]
  image?: string
}

interface AuthActionResult {
  ok: boolean
  error?: string
  redirectTo?: string
}

interface ProfileActionResult {
  ok: boolean
  error?: string
}

interface LocalState {
  news: NewsArticle[]
  matches: Match[]
  squadPlayers: SquadPlayer[]
  triviaQuestions: TriviaQuestion[]
  dailyTrivias: DailyTrivia[]
  triviaResults: TriviaResult[]
}

interface AppStateContextValue {
  isHydrated: boolean
  currentUser: AppUser | null
  users: AppUser[]
  news: NewsArticle[]
  matches: Match[]
  squadPlayers: SquadPlayer[]
  triviaQuestions: TriviaQuestion[]
  dailyTrivias: DailyTrivia[]
  triviaResults: TriviaResult[]
  login: (email: string, password: string, captchaToken?: string) => Promise<AuthActionResult>
  register: (input: RegisterInput) => Promise<AuthActionResult>
  loginWithProvider: (provider: Extract<Provider, "google" | "x">) => Promise<AuthActionResult>
  logout: () => Promise<void>
  updateProfile: (input: { name: string; avatar?: string }) => Promise<ProfileActionResult>
  saveNews: (input: NewsInput) => Promise<ProfileActionResult>
  deleteNews: (id: string) => Promise<ProfileActionResult>
  updateMatch: (match: Match) => void
  updateSquadPlayer: (player: SquadPlayer) => void
  saveTriviaQuestion: (question: TriviaQuestion) => void
  createTriviaQuestion: (question: Omit<TriviaQuestion, "id">) => void
  deleteTriviaQuestion: (id: string) => void
  saveDailyTrivia: (dailyTrivia: DailyTrivia) => void
  updateUserRole: (userId: string, role: UserRole) => Promise<ProfileActionResult>
  addTriviaResult: (score: number, totalQuestions: number, dailyKey?: string) => void
  getUserResults: (userId: string) => TriviaResult[]
  getUserTotalScore: (userId: string) => number
  ranking: Array<{ user: AppUser; totalScore: number; gamesPlayed: number }>
  getDailyRanking: (dailyKey: string) => Array<{ user: AppUser; score: number; totalQuestions: number; playedAt: string }>
  hasPlayedDailyTrivia: (userId: string, dailyKey: string) => boolean
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

const PROFILE_SELECT = "id, email, display_name, avatar_url, role, created_at"

function createInitialLocalState(): LocalState {
  const initialState = createInitialState()
  return {
    news: initialState.news,
    matches: initialState.matches,
    squadPlayers: initialState.squadPlayers,
    triviaQuestions: initialState.triviaQuestions,
    dailyTrivias: initialState.dailyTrivias,
    triviaResults: initialState.triviaResults,
  }
}

function mergeStoredMatches(seedMatches: Match[], storedMatches: Match[]) {
  const storedById = new Map(storedMatches.map((match) => [match.id, match]))

  const merged = seedMatches.map((seedMatch) => {
    const storedMatch = storedById.get(seedMatch.id)

    if (!storedMatch) return seedMatch
    if (storedMatch.opponent !== seedMatch.opponent || storedMatch.status !== seedMatch.status) return seedMatch

    return {
      ...seedMatch,
      ...storedMatch,
      referee: storedMatch.referee ?? seedMatch.referee,
      detail: storedMatch.detail ?? seedMatch.detail,
    }
  })

  for (const storedMatch of storedMatches) {
    if (!seedMatches.some((seedMatch) => seedMatch.id === storedMatch.id)) {
      merged.push(storedMatch)
    }
  }

  return merged
}

function getProfilePayload(user: User) {
  return {
    id: user.id,
    email: user.email ?? null,
    display_name:
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
      user.email?.split("@")[0] ||
      "Usuario",
    avatar_url:
      typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url.trim()
        ? user.user_metadata.avatar_url.trim()
        : null,
  }
}

function getAuthCallbackUrl(next = "/perfil") {
  if (typeof window === "undefined") return undefined
  const callbackUrl = new URL("/auth/callback", window.location.origin)
  callbackUrl.searchParams.set("next", next)
  return callbackUrl.toString()
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [localState, setLocalState] = useState<LocalState>(createInitialLocalState)
  const [users, setUsers] = useState<AppUser[]>([])
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  async function ensureProfile(user: User) {
    const payload = getProfilePayload(user)

    await supabase.from("profiles").upsert(payload, {
      onConflict: "id",
      ignoreDuplicates: false,
    })
  }

  async function loadProfiles(currentAuthUser?: User) {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .order("created_at", { ascending: true })

    if (error || !data) {
      return currentAuthUser ? await loadCurrentProfile(currentAuthUser) : []
    }

    return data.map((profile) => mapProfileToAppUser(profile, profile.id === currentAuthUser?.id ? currentAuthUser : undefined))
  }

  async function loadCurrentProfile(user: User) {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", user.id)
      .single<ProfileRow>()

    if (!data) {
      return []
    }

    return [mapProfileToAppUser(data, user)]
  }

  async function refreshAuthState() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      setCurrentUser(null)
      setUsers([])
      return
    }

    await ensureProfile(user)

    const loadedUsers = await loadProfiles(user)
    const current = loadedUsers.find((candidate) => candidate.id === user.id) ?? null

    setUsers(loadedUsers)
    setCurrentUser(current)
  }

  async function loadNews() {
    const { articles } = await fetchNewsArticles(supabase)
    if (!articles) return

    setLocalState((previous) => ({
      ...previous,
      news: articles,
    }))
  }

  useEffect(() => {
    let active = true

    async function hydrate() {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 50)
      })

      if (!active) return

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<LocalState> & {
            news?: NewsArticle[]
            matches?: Match[]
            squadPlayers?: SquadPlayer[]
            triviaQuestions?: TriviaQuestion[]
            dailyTrivias?: DailyTrivia[]
            triviaResults?: TriviaResult[]
          }

          if (!active) return

          setLocalState((previous) => {
            const mergedNews = new Map(previous.news.map((article) => [article.id, article]))
            for (const article of parsed.news ?? []) {
              mergedNews.set(article.id, article)
            }

            return {
              news: Array.from(mergedNews.values()),
              matches: parsed.matches ? mergeStoredMatches(previous.matches, parsed.matches) : previous.matches,
              squadPlayers: parsed.squadPlayers ?? previous.squadPlayers,
              triviaQuestions: parsed.triviaQuestions ?? previous.triviaQuestions,
              dailyTrivias: parsed.dailyTrivias ?? previous.dailyTrivias,
              triviaResults: parsed.triviaResults ?? previous.triviaResults,
            }
          })
        }
      } catch {
        if (!active) return
        setLocalState(createInitialLocalState())
      }

      if (active) {
        setIsHydrated(true)
      }

      void Promise.all([refreshAuthState(), loadNews()]).catch((error) => {
        console.error("No se pudieron sincronizar los datos remotos.", error)
      })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshAuthState().catch((error) => {
        console.error("No se pudo actualizar la sesión.", error)
      })
    })

    void hydrate()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localState))
  }, [isHydrated, localState])

  const ranking = useMemo(() => {
    return users
      .map((user) => {
        const results = localState.triviaResults.filter((result) => result.userId === user.id)
        const totalScore = results.reduce((total, result) => total + result.score, 0)
        return {
          user,
          totalScore,
          gamesPlayed: results.length,
        }
      })
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
        if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed
        return a.user.name.localeCompare(b.user.name)
      })
  }, [localState.triviaResults, users])

  const value = useMemo<AppStateContextValue>(() => ({
    isHydrated,
    currentUser,
    users,
    news: localState.news.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    matches: localState.matches,
    squadPlayers: localState.squadPlayers,
    triviaQuestions: localState.triviaQuestions,
    dailyTrivias: localState.dailyTrivias,
    triviaResults: localState.triviaResults,
    async login(email, password, captchaToken) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: {
          captchaToken,
        },
      })

      if (error) {
        return {
          ok: false,
          error: error.message || "No se pudo iniciar sesión.",
        }
      }

      await refreshAuthState()
      return { ok: true, redirectTo: "/perfil" }
    },
    async register(input) {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/perfil"),
          data: {
            name: input.name.trim(),
          },
          captchaToken: input.captchaToken,
        },
      })

      if (error) {
        return {
          ok: false,
          error: error.message || "No se pudo registrar el usuario.",
        }
      }

      await refreshAuthState()

      return {
        ok: true,
        redirectTo: data.session ? "/perfil" : "/iniciar-sesion",
      }
    },
    async loginWithProvider(provider) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getAuthCallbackUrl("/perfil"),
        },
      })

      if (error) {
        return {
          ok: false,
          error: error.message || `No se pudo iniciar sesión con ${provider}.`,
        }
      }

      return { ok: true }
    },
    async logout() {
      await supabase.auth.signOut()
      setCurrentUser(null)
      setUsers([])
    },
    async updateProfile(input) {
      if (!currentUser) {
        return { ok: false, error: "No hay una sesión activa." }
      }

      const displayName = input.name.trim()
      const avatarUrl = input.avatar?.trim() || null

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq("id", currentUser.id)

      if (profileError) {
        return {
          ok: false,
          error: profileError.message || "No se pudo actualizar el perfil.",
        }
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: displayName,
          avatar_url: avatarUrl,
        },
      })

      if (authError) {
        return {
          ok: false,
          error: authError.message || "No se pudo actualizar el perfil.",
        }
      }

      await refreshAuthState()
      return { ok: true }
    },
    async saveNews(input) {
      const existingArticle = input.id ? localState.news.find((item) => item.id === input.id) : undefined
      const title = input.title.trim()
      const intro = input.intro.trim()
      const contentInput = input.content.trim()
      const content = hasHtmlContent(contentInput)
        ? [contentInput]
        : contentInput
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
      const article: NewsArticle = {
        id: input.id ?? createNewsArticleId(),
        slug: createSlug(title),
        title,
        excerpt: intro,
        intro,
        content,
        image: input.image?.trim() || undefined,
        author: existingArticle?.author ?? currentUser?.name ?? "Redacción Medio River",
        date: existingArticle?.date ?? new Date().toISOString(),
        category: input.category,
        competition: input.competition,
        tag: input.category === "Opinión" ? "Opinión" : "Información",
        featured: existingArticle?.featured ?? true,
      }

      const payload = {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        intro: article.intro,
        content: article.content,
        image: article.image ?? null,
        author: article.author,
        author_id: currentUser?.id ?? null,
        published_at: article.date,
        category: article.category,
        competition: article.competition ?? null,
        tag: article.tag,
        featured: article.featured ?? false,
      }

      const { data, error } = await supabase
        .from("news_articles")
        .upsert(payload, { onConflict: "id" })
        .select(NEWS_SELECT)
        .single()

      if (error) {
        return {
          ok: false,
          error: getNewsSaveErrorMessage(error.message),
        }
      }

      const savedArticle = data ? mapNewsRowToArticle(data) : article
      setLocalState((previous) => ({
        ...previous,
        news: previous.news.some((item) => item.id === savedArticle.id)
          ? previous.news.map((item) => (item.id === savedArticle.id ? savedArticle : item))
          : [savedArticle, ...previous.news],
      }))

      return { ok: true }
    },
    async deleteNews(id) {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", id)

      if (error) {
        return {
          ok: false,
          error: error.message || "No se pudo eliminar la noticia.",
        }
      }

      setLocalState((previous) => ({
        ...previous,
        news: previous.news.filter((article) => article.id !== id),
      }))

      return { ok: true }
    },
    updateMatch(match) {
      setLocalState((previous) => ({
        ...previous,
        matches: previous.matches.map((item) => (item.id === match.id ? match : item)),
      }))
    },
    updateSquadPlayer(player) {
      setLocalState((previous) => ({
        ...previous,
        squadPlayers: previous.squadPlayers.map((item) => (item.id === player.id ? player : item)),
      }))
    },
    saveTriviaQuestion(question) {
      const normalizedQuestion: TriviaQuestion = {
        ...question,
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        explanation: question.explanation?.trim() || undefined,
      }

      setLocalState((previous) => ({
        ...previous,
        triviaQuestions: previous.triviaQuestions.some((item) => item.id === normalizedQuestion.id)
          ? previous.triviaQuestions.map((item) => (item.id === normalizedQuestion.id ? normalizedQuestion : item))
          : [normalizedQuestion, ...previous.triviaQuestions],
      }))
    },
    createTriviaQuestion(question) {
      const normalizedQuestion: TriviaQuestion = {
        id: createTriviaQuestionId(),
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        correctIndex: question.correctIndex,
        explanation: question.explanation?.trim() || undefined,
      }

      setLocalState((previous) => ({
        ...previous,
        triviaQuestions: [normalizedQuestion, ...previous.triviaQuestions],
      }))
    },
    deleteTriviaQuestion(id) {
      setLocalState((previous) => ({
        ...previous,
        triviaQuestions: previous.triviaQuestions.filter((question) => question.id !== id),
        dailyTrivias: previous.dailyTrivias.map((dailyTrivia) => ({
          ...dailyTrivia,
          questionIds: dailyTrivia.questionIds.filter((questionId) => questionId !== id),
        })),
      }))
    },
    saveDailyTrivia(dailyTrivia) {
      const normalizedDailyTrivia: DailyTrivia = {
        dailyKey: dailyTrivia.dailyKey,
        questionIds: Array.from(new Set(dailyTrivia.questionIds)).slice(0, 5),
      }

      setLocalState((previous) => ({
        ...previous,
        dailyTrivias: previous.dailyTrivias.some((item) => item.dailyKey === normalizedDailyTrivia.dailyKey)
          ? previous.dailyTrivias.map((item) => (item.dailyKey === normalizedDailyTrivia.dailyKey ? normalizedDailyTrivia : item))
          : [...previous.dailyTrivias, normalizedDailyTrivia],
      }))
    },
    async updateUserRole(userId, role) {
      if (currentUser && currentUser.id === userId && currentUser.role !== role) {
        return {
          ok: false,
          error: "No podés cambiar tu propio rol desde el panel.",
        }
      }
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)

      if (error) {
        return {
          ok: false,
          error: error.message || "No se pudo actualizar el rol.",
        }
      }

      await refreshAuthState()
      return { ok: true }
    },
    addTriviaResult(score, totalQuestions, dailyKey) {
      if (!currentUser) return
      if (dailyKey && localState.triviaResults.some((result) => result.userId === currentUser.id && result.dailyKey === dailyKey)) return
      const result: TriviaResult = {
        id: createTriviaResultId(),
        userId: currentUser.id,
        score,
        totalQuestions,
        playedAt: new Date().toISOString(),
        dailyKey,
      }
      setLocalState((previous) => ({
        ...previous,
        triviaResults: [result, ...previous.triviaResults],
      }))
    },
    getUserResults(userId) {
      return localState.triviaResults
        .filter((result) => result.userId === userId)
        .sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt))
    },
    getUserTotalScore(userId) {
      return localState.triviaResults
        .filter((result) => result.userId === userId)
        .reduce((total, result) => total + result.score, 0)
    },
    getDailyRanking(dailyKey) {
      return localState.triviaResults
        .filter((result) => result.dailyKey === dailyKey)
        .map((result) => {
          const user = users.find((candidate) => candidate.id === result.userId)
          if (!user) return null
          return {
            user,
            score: result.score,
            totalQuestions: result.totalQuestions,
            playedAt: result.playedAt,
          }
        })
        .filter((entry): entry is { user: AppUser; score: number; totalQuestions: number; playedAt: string } => Boolean(entry))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return +new Date(a.playedAt) - +new Date(b.playedAt)
        })
    },
    hasPlayedDailyTrivia(userId, dailyKey) {
      return localState.triviaResults.some((result) => result.userId === userId && result.dailyKey === dailyKey)
    },
    ranking,
  }), [currentUser, isHydrated, localState, ranking, supabase, users])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider")
  }
  return context
}

function hasHtmlContent(value: string) {
  return /<\/?(p|br|strong|b|em|i|u|a|h2|h3)\b/i.test(value)
}

function getNewsSaveErrorMessage(message?: string) {
  if (message?.toLowerCase().includes("check constraint")) {
    return "Supabase todavía tiene una restricción vieja para categorías/competencias. Aplicá la migración 20260429_allow_custom_news_taxonomy.sql y volvé a guardar."
  }

  return message || "No se pudo guardar la noticia."
}
