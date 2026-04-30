import type { SupabaseClient } from "@supabase/supabase-js"
import type { DailyTrivia, TriviaQuestion, TriviaResult } from "@/lib/data/types"

export const TRIVIA_QUESTIONS_SELECT = "id, question, options, correct_index, explanation"
export const DAILY_TRIVIAS_SELECT = "daily_key, question_ids"
export const TRIVIA_RESULTS_SELECT = "id, user_id, daily_key, score, total_questions, played_at"

export interface TriviaQuestionRow {
  id: string
  question: string
  options: unknown
  correct_index: number
  explanation: string | null
}

export interface DailyTriviaRow {
  daily_key: string
  question_ids: string[]
}

export interface TriviaResultRow {
  id: string
  user_id: string
  daily_key: string
  score: number
  total_questions: number
  played_at: string
}

export function mapTriviaQuestionRow(row: TriviaQuestionRow): TriviaQuestion | null {
  if (!Array.isArray(row.options)) return null

  const options = row.options.filter((option): option is string => typeof option === "string")
  if (options.length < 2) return null

  return {
    id: row.id,
    question: row.question,
    options,
    correctIndex: row.correct_index,
    explanation: row.explanation ?? undefined,
  }
}

export function mapDailyTriviaRow(row: DailyTriviaRow): DailyTrivia {
  return {
    dailyKey: row.daily_key,
    questionIds: row.question_ids,
  }
}

export function mapTriviaResultRow(row: TriviaResultRow): TriviaResult {
  return {
    id: row.id,
    userId: row.user_id,
    dailyKey: row.daily_key,
    score: row.score,
    totalQuestions: row.total_questions,
    playedAt: row.played_at,
  }
}

export async function fetchTriviaState(supabase: SupabaseClient) {
  const [questionsResponse, dailyResponse, resultsResponse] = await Promise.all([
    supabase
      .from("trivia_questions")
      .select(TRIVIA_QUESTIONS_SELECT)
      .order("created_at", { ascending: true }),
    supabase
      .from("daily_trivias")
      .select(DAILY_TRIVIAS_SELECT)
      .order("daily_key", { ascending: true }),
    supabase
      .from("trivia_results")
      .select(TRIVIA_RESULTS_SELECT)
      .order("played_at", { ascending: false }),
  ])

  return {
    questions: questionsResponse.data
      ?.map((row) => mapTriviaQuestionRow(row as TriviaQuestionRow))
      .filter((question): question is TriviaQuestion => Boolean(question)),
    dailyTrivias: dailyResponse.data?.map((row) => mapDailyTriviaRow(row as DailyTriviaRow)),
    results: resultsResponse.data?.map((row) => mapTriviaResultRow(row as TriviaResultRow)),
    errors: {
      questions: questionsResponse.error,
      dailyTrivias: dailyResponse.error,
      results: resultsResponse.error,
    },
  }
}

export function getTriviaTableMissingMessage(message?: string) {
  if (message?.toLowerCase().includes("relation") && message?.toLowerCase().includes("does not exist")) {
    return "Falta aplicar la migración de tablas de trivia en Supabase."
  }

  return message
}
