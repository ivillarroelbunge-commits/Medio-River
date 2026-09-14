import type { MatchRatingBallot } from "@/lib/supabase/player-ratings"

export interface ShareableRating {
  id: string
  name: string
  displayOrder: number
  myRating: number
}

const SHORT_NAME_OVERRIDES: Record<string, string> = {
  "lucas martinez quarta": "M. Quarta",
  "lucas martínez quarta": "M. Quarta",
  "juan cruz meza": "Meza",
  "rafael borre": "Borré",
  "rafael borré": "Borré",
  "thiago almada": "Almada",
  "mauro arambarri": "Arambarri",
  "francisco ortega": "Ortega",
  "juan portillo": "Portillo",
  "fausto vera": "Vera",
  "agustin ruberto": "Ruberto",
  "agustín ruberto": "Ruberto",
  "lautaro pereyra": "Pereyra",
  "lucas silva": "Silva",
  "ezequiel centurion": "Centurión",
  "ezequiel centurión": "Centurión",
  "jeremias martinet": "Martinet",
  "jeremías martinet": "Martinet",
  "tobias ramirez": "Ramírez",
  "tobías ramírez": "Ramírez",
}

const COMPACT_NAME_OVERRIDES: Record<string, string> = {
  ...SHORT_NAME_OVERRIDES,
  "independiente santa fe": "Ind. Santa Fe",
}

export function getShareableRatings(ballot: MatchRatingBallot): ShareableRating[] | null {
  if (!ballot.players.length) return null

  const sorted = [...ballot.players].sort((a, b) => a.displayOrder - b.displayOrder)
  if (sorted.some((player) => player.myRating === null)) return null

  return sorted.map((player) => ({
    id: player.id,
    name: player.name,
    displayOrder: player.displayOrder,
    myRating: Number(player.myRating),
  }))
}

export function buildXRatingsText(ballot: MatchRatingBallot) {
  const ratings = getShareableRatings(ballot)
  if (!ratings) throw new Error("Faltan puntuaciones para compartir.")

  const fullNames = ratings.map((rating) => rating.name)
  const candidateGroups = ratings.map((rating) => getXNameCandidates(rating.name, fullNames))

  for (let level = 0; level < 5; level += 1) {
    const text = buildRatingsListText(
      "Mis puntuaciones:",
      ratings,
      candidateGroups.map((group) => group[Math.min(level, group.length - 1)]),
    )
    if (text.length <= 280) return text
  }

  throw new Error("No se pudo generar un texto de X de menos de 280 caracteres.")
}

export function buildFullRatingsText(ballot: MatchRatingBallot, articleUrl: string) {
  const ratings = getShareableRatings(ballot)
  if (!ratings) throw new Error("Faltan puntuaciones para compartir.")

  const names = ratings.map((rating) => getReadableShareName(rating.name, ratings.map((row) => row.name)))
  const header = `Mis puntuaciones de ${getMatchTitle(ballot)}`
  const lines = ratings.map((rating, index) => `${names[index]} - ${rating.myRating}`)

  return `${header}\n\n${lines.join("\n")}\n\nHacé tus puntuaciones en Medio River 👇\n${articleUrl}`
}

export function getArticleShareUrl() {
  if (typeof window === "undefined") return ""

  const url = new URL(window.location.href)
  url.search = ""
  url.hash = ""
  return url.toString()
}

export function getMatchTitle(ballot: MatchRatingBallot) {
  return ballot.match.isHome ? `River vs. ${ballot.match.opponent}` : `River vs. ${ballot.match.opponent}`
}

export function getMatchScoreline(ballot: MatchRatingBallot) {
  const riverScore = ballot.match.riverScore
  const opponentScore = ballot.match.opponentScore
  const opponent = ballot.match.opponent

  if (ballot.match.isHome) return `River ${riverScore}-${opponentScore} ${opponent}`
  return `${opponent} ${opponentScore}-${riverScore} River`
}

export async function generateRatingsShareImage(ballot: MatchRatingBallot, articleUrl: string) {
  const ratings = getShareableRatings(ballot)
  if (!ratings) throw new Error("Faltan puntuaciones para compartir.")

  const width = 1080
  const padding = 72
  const lineHeight = 58
  const headerHeight = 280
  const footerHeight = 150
  const height = Math.max(1350, headerHeight + ratings.length * lineHeight + footerHeight + 16)
  const canvas = document.createElement("canvas")
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No se pudo generar la imagen.")
  ctx.scale(dpr, dpr)

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#d71920"
  ctx.fillRect(0, 0, width, 24)

  ctx.fillStyle = "#111111"
  ctx.font = "800 42px Arial, sans-serif"
  ctx.fillText("MIS PUNTUACIONES", padding, 92)

  ctx.fillStyle = "#d71920"
  ctx.font = "900 74px Arial, sans-serif"
  ctx.fillText("Medio River", padding, 172)

  ctx.fillStyle = "#111111"
  ctx.font = "700 36px Arial, sans-serif"
  ctx.fillText(getMatchTitle(ballot), padding, 236)

  ctx.fillStyle = "#666666"
  ctx.font = "600 32px Arial, sans-serif"
  ctx.fillText(getMatchScoreline(ballot), padding, 284)

  let y = 370
  const fullNames = ratings.map((rating) => rating.name)
  ctx.font = "700 38px Arial, sans-serif"

  for (const rating of ratings) {
    const name = getReadableShareName(rating.name, fullNames)
    ctx.fillStyle = "#f4f4f5"
    roundRect(ctx, padding, y - 40, width - padding * 2, 48, 18)
    ctx.fill()

    ctx.fillStyle = "#111111"
    ctx.fillText(name, padding + 28, y - 5)
    ctx.fillStyle = "#d71920"
    ctx.textAlign = "right"
    ctx.fillText(String(rating.myRating), width - padding - 28, y - 5)
    ctx.textAlign = "left"
    y += lineHeight
  }

  const footerY = height - 104
  ctx.fillStyle = "#111111"
  ctx.font = "900 34px Arial, sans-serif"
  ctx.fillText("Medio River", padding, footerY)
  ctx.fillStyle = "#666666"
  ctx.font = "500 24px Arial, sans-serif"
  ctx.fillText("medioriver.com.ar", padding, footerY + 42)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.96))
  if (!blob) throw new Error("No se pudo generar la imagen.")

  const fileName = `mis-puntuaciones-river-${slugify(ballot.match.opponent)}.png`
  const file = new File([blob], fileName, { type: "image/png" })
  return { blob, file, fileName }
}

function buildRatingsListText(title: string, ratings: ShareableRating[], names: string[]) {
  const lines = ratings.map((rating, index) => `${names[index]} - ${rating.myRating}`)
  return `${title}\n\n${lines.join("\n")}`
}

function getXNameCandidates(name: string, allNames: string[]) {
  const natural = getShortPlayerName(name, allNames)
  const lastName = getLastName(name)
  const surnameInitial = lastName ? `${lastName.charAt(0)}.` : getInitials(name)
  const initials = getInitials(name)

  return uniqueValues([
    natural,
    lastName,
    surnameInitial,
    initials,
    name.charAt(0).toUpperCase(),
  ]).filter(Boolean)
}

export function getShortPlayerName(name: string, allNames: string[]) {
  const override = SHORT_NAME_OVERRIDES[normalizeKey(name)]
  if (override) return override

  const lastName = getLastName(name)
  if (!lastName) return name

  if (hasDuplicateLastName(name, allNames)) {
    const firstName = splitName(name)[0] ?? ""
    return firstName ? `${firstName.charAt(0).toUpperCase()}. ${lastName}` : lastName
  }

  return lastName
}

function getReadableShareName(name: string, allNames: string[]) {
  const override = COMPACT_NAME_OVERRIDES[normalizeKey(name)]
  if (override) return override.replace(/^M\. Quarta$/, "Martínez Quarta")
  if (hasDuplicateLastName(name, allNames)) return name
  return getLastName(name) || name
}

function hasDuplicateLastName(name: string, allNames: string[]) {
  const lastName = normalizeKey(getLastName(name))
  if (!lastName) return false

  return allNames.filter((candidate) => normalizeKey(getLastName(candidate)) === lastName).length > 1
}

function getLastName(name: string) {
  const words = splitName(name)
  return words[words.length - 1] ?? ""
}

function splitName(name: string) {
  return name.trim().split(/\s+/).filter(Boolean)
}

function getInitials(name: string) {
  return splitName(name).map((word) => word.charAt(0).toUpperCase()).join("")
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function uniqueValues(values: string[]) {
  return values.filter((value, index) => value && values.indexOf(value) === index)
}

function slugify(value: string) {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getHostFromUrl(value: string) {
  try {
    return new URL(value).host.replace(/^www\./, "")
  } catch {
    return "medioriver.com.ar"
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
