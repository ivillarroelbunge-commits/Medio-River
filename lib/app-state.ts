import { demoUsers, matches, newsArticles, squadPlayers, triviaQuestions } from "@/lib/data"
import type { AppUser, DailyTrivia, Match, NewsArticle, SquadPlayer, TriviaQuestion, TriviaResult, UserRole } from "@/lib/data/types"

export interface StoredAppState {
  users: AppUser[]
  currentUserId: string | null
  news: NewsArticle[]
  matches: Match[]
  squadPlayers: SquadPlayer[]
  triviaQuestions: TriviaQuestion[]
  dailyTrivias: DailyTrivia[]
  triviaResults: TriviaResult[]
}

export const STORAGE_KEY = "medio-river-state-v1"

export function createInitialState(): StoredAppState {
  return {
    users: demoUsers,
    currentUserId: null,
    news: newsArticles,
    matches,
    squadPlayers,
    triviaQuestions,
    dailyTrivias: [],
    triviaResults: [],
  }
}

export function getCurrentUser(state: StoredAppState) {
  return state.users.find((user) => user.id === state.currentUserId) ?? null
}

export function getUserTriviaResults(state: StoredAppState, userId: string) {
  return state.triviaResults
    .filter((result) => result.userId === userId)
    .sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt))
}

export function getUserTotalTriviaScore(state: StoredAppState, userId: string) {
  return getUserTriviaResults(state, userId).reduce((total, result) => total + result.score, 0)
}

export function getGlobalRanking(state: StoredAppState) {
  return state.users
    .map((user) => ({
      user,
      totalScore: getUserTotalTriviaScore(state, user.id),
      gamesPlayed: getUserTriviaResults(state, user.id).length,
    }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed
      return a.user.name.localeCompare(b.user.name)
    })
}

export function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createNewsArticleId() {
  return `news-${Math.random().toString(36).slice(2, 10)}`
}

export function createTriviaResultId() {
  return `trivia-${Math.random().toString(36).slice(2, 10)}`
}

export function createTriviaQuestionId() {
  return `question-${Math.random().toString(36).slice(2, 10)}`
}

export function createUserId() {
  return `user-${Math.random().toString(36).slice(2, 10)}`
}

export function updateUserRoleInState(state: StoredAppState, userId: string, role: UserRole) {
  return {
    ...state,
    users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
  }
}
