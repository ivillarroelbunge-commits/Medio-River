import type { TriviaQuestion } from "@/lib/data/types"

export const WEEKLY_TRIVIA_SIZE = 5
export const WEEKLY_TRIVIA_START_AT = "2026-05-18T00:00:00-03:00"

export function getTriviaDailyKey(date = new Date()) {
  return getTriviaWeeklyKey(date)
}

export function getDailyTriviaQuestions(questions: TriviaQuestion[], dailyKey = getTriviaDailyKey()) {
  return getWeeklyTriviaQuestions(questions, dailyKey)
}

export function getTriviaWeeklyKey(date = new Date()) {
  const argentinaDate = getArgentinaDate(date)
  const day = argentinaDate.getUTCDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  argentinaDate.setUTCDate(argentinaDate.getUTCDate() - daysSinceMonday)

  return argentinaDate.toISOString().slice(0, 10)
}

export function isWeeklyTriviaAvailable(date = new Date()) {
  return date.getTime() >= new Date(WEEKLY_TRIVIA_START_AT).getTime()
}

export function getWeeklyTriviaStartDate() {
  return new Date(WEEKLY_TRIVIA_START_AT)
}

export function getWeeklyTriviaQuestions(questions: TriviaQuestion[], weeklyKey = getTriviaWeeklyKey()) {
  if (questions.length <= WEEKLY_TRIVIA_SIZE) return questions

  const seed = weeklyKey.split("").reduce((total, character) => total + character.charCodeAt(0), 0)
  const shuffled = questions
    .map((question, index) => ({
      question,
      weight: seededWeight(seed, index),
    }))
    .sort((a, b) => a.weight - b.weight)
    .map((item) => item.question)

  return shuffled.slice(0, WEEKLY_TRIVIA_SIZE)
}

function getArgentinaDate(date: Date) {
  const dateKey = date.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
  return new Date(`${dateKey}T12:00:00.000Z`)
}

function seededWeight(seed: number, index: number) {
  const value = Math.sin(seed * 9301 + index * 49297) * 233280
  return value - Math.floor(value)
}
