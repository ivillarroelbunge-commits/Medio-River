export type UserRole = "admin" | "editor" | "user"

export type NewsCategory = string

export type Competition =
  | "Torneo Apertura"
  | "Copa Sudamericana"
  | "Copa Argentina"

export type NewsTag = "Información" | "Opinión"

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  intro: string
  content: string[]
  image?: string
  imageQuery?: string
  imageFocusX?: number
  imageFocusY?: number
  imageZoom?: number
  author: string
  date: string
  category: NewsCategory
  competition?: string
  tag: NewsTag
  featured?: boolean
}

export interface Match {
  id: string
  date: string
  opponent: string
  competition: Competition
  status: "upcoming" | "played"
  isHome: boolean
  stadium: string
  tvChannel?: string
  riverScore?: number
  opponentScore?: number
  referee?: string
  detail?: MatchDetail
}

export type MatchTeamSide = "river" | "opponent"

export interface MatchGoal {
  team: MatchTeamSide
  player: string
  minute: string
  assist?: string
  detail?: string
}

export interface MatchCardEvent {
  team: MatchTeamSide
  player: string
  minute: string
  card: "yellow" | "red"
  detail?: string
}

export interface MatchSubstitution {
  team: MatchTeamSide
  minute: string
  playerIn: string
  playerOut: string
  detail?: string
}

export interface MatchLineup {
  coach: string
  starters: string[]
  substitutes: string[]
}

export interface MatchDetail {
  sourceLabel?: string
  sourceUrl?: string
  referee?: string
  goals: MatchGoal[]
  cards: MatchCardEvent[]
  substitutions: MatchSubstitution[]
  lineups: {
    river: MatchLineup
    opponent: MatchLineup
  }
}

export interface StandingRow {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalDifference: number
  points: number
}

export interface TopScorerRow {
  player: string
  team: string
  goals: number
}

export interface CompetitionPanelData {
  key: "apertura" | "sudamericana" | "copa-argentina"
  label: Competition
  title: string
  subtitle: string
  standings: StandingRow[]
  scorers?: TopScorerRow[]
  note?: string
}

export interface TriviaQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface DailyTrivia {
  dailyKey: string
  questionIds: string[]
}

export interface TriviaResult {
  id: string
  userId: string
  score: number
  totalQuestions: number
  playedAt: string
  dailyKey?: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  password?: string
  avatar?: string
  role: UserRole
  registeredAt: string
}

export interface SquadPlayer {
  id: string
  name: string
  number: number
  line: "Arqueros" | "Defensores" | "Mediocampistas" | "Delanteros"
  position: string
  age: number
  nationality: string
  foot: string
  fromAcademy: boolean
  image?: string
}

export type PlayerStatsCompetitionKey = "apertura" | "sudamericana" | "copaArgentina"

export interface PlayerStatLine {
  matches: number
  minutes: number
  goals: number
  assists: number
  rating: number | null
  yellowCards: number
  redCards: number
  cleanSheets: number
}

export interface PlayerSeasonStats {
  sourceId: number
  updatedAt: string
  competitions: Partial<Record<PlayerStatsCompetitionKey, Partial<PlayerStatLine>>>
}

export interface Tweet {
  id: string
  text: string
  publishedAt: string
  image?: string
  url: string
}

export interface SocialLink {
  label: string
  href: string
}

export interface TeamBuilderSlot {
  id: string
  code: string
  role: "Arquero" | "Defensor" | "Medio" | "Delantero"
  x: number
  y: number
}

export type FormationCode =
  | "4-3-3"
  | "4-4-2"
  | "4-1-3-2"
  | "4-2-3-1"
  | "5-3-2"
  | "5-2-3"
