import type { TriviaQuestion } from "@/lib/data/types"

const DAILY_TRIVIA_SIZE = 5

export function getTriviaDailyKey(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

export function getDailyTriviaQuestions(questions: TriviaQuestion[], dailyKey = getTriviaDailyKey()) {
  if (questions.length <= DAILY_TRIVIA_SIZE) return questions

  const seed = dailyKey.split("").reduce((total, character) => total + character.charCodeAt(0), 0)
  const shuffled = questions
    .map((question, index) => ({
      question,
      weight: seededWeight(seed, index),
    }))
    .sort((a, b) => a.weight - b.weight)
    .map((item) => item.question)

  return shuffled.slice(0, DAILY_TRIVIA_SIZE)
}

function seededWeight(seed: number, index: number) {
  const value = Math.sin(seed * 9301 + index * 49297) * 233280
  return value - Math.floor(value)
}
