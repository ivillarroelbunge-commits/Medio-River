import { withSupabase } from "npm:@supabase/server@1.5.3"

const BA_TIME_ZONE = "America/Argentina/Buenos_Aires"
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS })
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function getAuthenticatedUserId(req: Request, admin: any) {
  const header = req.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) return null

  const token = header.slice(7).trim()
  if (!token) return null

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user?.id) return null
  return String(data.user.id)
}

async function claimAnonymousRatings(admin: any, userId: string, deviceId: string) {
  const { data: anonymousRows, error } = await admin
    .from("player_ratings")
    .select("id, match_player_id")
    .eq("device_id", deviceId)
    .is("user_id", null)

  if (error) throw error
  if (!anonymousRows?.length) return 0

  const matchPlayerIds = anonymousRows.map((row: any) => String(row.match_player_id))
  const { data: existingUserRows, error: existingError } = await admin
    .from("player_ratings")
    .select("id, match_player_id")
    .eq("user_id", userId)
    .in("match_player_id", matchPlayerIds)

  if (existingError) throw existingError

  const alreadyRated = new Set((existingUserRows ?? []).map((row: any) => String(row.match_player_id)))
  const duplicateIds = anonymousRows
    .filter((row: any) => alreadyRated.has(String(row.match_player_id)))
    .map((row: any) => String(row.id))
  const claimIds = anonymousRows
    .filter((row: any) => !alreadyRated.has(String(row.match_player_id)))
    .map((row: any) => String(row.id))

  if (duplicateIds.length) {
    const { error: deleteError } = await admin.from("player_ratings").delete().in("id", duplicateIds)
    if (deleteError) throw deleteError
  }

  if (claimIds.length) {
    const { error: updateError } = await admin
      .from("player_ratings")
      .update({ user_id: userId, voter_key: `user:${userId}` })
      .in("id", claimIds)
    if (updateError) throw updateError
  }

  return claimIds.length
}

async function getBallot(admin: any, matchId: string, deviceId: string, userId: string | null) {
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("id, date, opponent, competition, status, river_score, opponent_score")
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) throw matchError
  if (!match || match.status !== "played") return null

  const { data: players, error: playersError } = await admin
    .from("match_rating_players")
    .select("id, squad_player_id, player_name, starter, entered_minute, display_order")
    .eq("match_id", matchId)
    .order("display_order", { ascending: true })

  if (playersError) throw playersError
  if (!players?.length) return { match, players: [] }

  const playerIds = players.map((player: any) => String(player.id))
  const squadIds = players.map((player: any) => player.squad_player_id).filter(Boolean)

  const { data: stats, error: statsError } = await admin
    .from("match_player_rating_stats")
    .select("match_player_id, rating_sum, rating_count")
    .in("match_player_id", playerIds)
  if (statsError) throw statsError

  let squad: any[] = []
  if (squadIds.length) {
    const result = await admin
      .from("squad_players")
      .select("id, name, shirt_number, position, image_url, fotmob_id")
      .in("id", [...new Set(squadIds)])
    if (result.error) throw result.error
    squad = result.data ?? []
  }

  let myQuery = admin
    .from("player_ratings")
    .select("match_player_id, rating")
    .in("match_player_id", playerIds)

  if (userId) myQuery = myQuery.eq("user_id", userId)
  else myQuery = myQuery.eq("device_id", deviceId).is("user_id", null)

  const myResult = await myQuery
  if (myResult.error) throw myResult.error
  const myRatings = myResult.data ?? []

  const statsByPlayer = new Map((stats ?? []).map((row: any) => [String(row.match_player_id), row]))
  const squadById = new Map(squad.map((row: any) => [String(row.id), row]))
  const mineByPlayer = new Map(myRatings.map((row: any) => [String(row.match_player_id), Number(row.rating)]))

  return {
    match: {
      id: String(match.id),
      date: String(match.date),
      opponent: String(match.opponent),
      competition: String(match.competition),
      riverScore: Number(match.river_score ?? 0),
      opponentScore: Number(match.opponent_score ?? 0),
    },
    players: players.map((player: any) => {
      const stat = statsByPlayer.get(String(player.id)) as any
      const ratingCount = Number(stat?.rating_count ?? 0)
      const ratingSum = Number(stat?.rating_sum ?? 0)
      const squadPlayer = player.squad_player_id ? squadById.get(String(player.squad_player_id)) as any : null
      const image = squadPlayer?.image_url || (squadPlayer?.fotmob_id
        ? `https://images.fotmob.com/image_resources/playerimages/${squadPlayer.fotmob_id}.png`
        : null)

      return {
        id: String(player.id),
        squadPlayerId: player.squad_player_id ? String(player.squad_player_id) : null,
        name: squadPlayer?.name || String(player.player_name),
        shirtNumber: squadPlayer?.shirt_number == null ? null : Number(squadPlayer.shirt_number),
        position: squadPlayer?.position || null,
        image,
        starter: Boolean(player.starter),
        enteredMinute: player.entered_minute ? String(player.entered_minute) : null,
        displayOrder: Number(player.display_order),
        averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null,
        ratingCount,
        myRating: mineByPlayer.get(String(player.id)) ?? null,
      }
    }),
  }
}

async function submitRatings(
  admin: any,
  matchId: string,
  deviceId: string,
  userId: string | null,
  ratings: Record<string, unknown>,
) {
  const entries = Object.entries(ratings)
  if (!entries.length || entries.length > 30) throw new Error("Seleccioná al menos un jugador para puntuar.")

  for (const [matchPlayerId, rating] of entries) {
    if (!isUuid(matchPlayerId) || !Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 10) {
      throw new Error("Hay una puntuación inválida.")
    }
  }

  const matchPlayerIds = entries.map(([id]) => id)
  const { data: players, error } = await admin
    .from("match_rating_players")
    .select("id, match_id, squad_player_id, player_name")
    .eq("match_id", matchId)
    .in("id", matchPlayerIds)

  if (error) throw error
  if ((players ?? []).length !== entries.length) throw new Error("Uno de los jugadores no pertenece a este partido.")

  const playerById = new Map((players ?? []).map((player: any) => [String(player.id), player]))
  const voterKey = userId ? `user:${userId}` : `device:${deviceId}`

  const rows = entries.map(([matchPlayerId, value]) => {
    const player = playerById.get(matchPlayerId) as any
    return {
      match_player_id: matchPlayerId,
      match_id: matchId,
      squad_player_id: player.squad_player_id ?? null,
      player_name: String(player.player_name),
      user_id: userId,
      device_id: deviceId,
      voter_key: voterKey,
      rating: Number(value),
    }
  })

  const { error: upsertError } = await admin
    .from("player_ratings")
    .upsert(rows, { onConflict: "match_player_id,voter_key" })
  if (upsertError) throw upsertError
}

function yearInBuenosAires(date: string) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: BA_TIME_ZONE, year: "numeric" }).format(new Date(date)))
}

function getPlayerImage(player: any) {
  return player?.image_url || (player?.fotmob_id
    ? `https://images.fotmob.com/image_resources/playerimages/${player.fotmob_id}.png`
    : null)
}

async function getProfileRatings(admin: any, userId: string) {
  const { data: ratings, error } = await admin
    .from("player_ratings")
    .select("match_id, squad_player_id, player_name, rating")
    .eq("user_id", userId)

  if (error) throw error
  if (!ratings?.length) return { summary: [], history: [] }

  const matchIds = [...new Set(ratings.map((row: any) => String(row.match_id)))]
  const squadIds = [...new Set(ratings.map((row: any) => row.squad_player_id).filter(Boolean).map(String))]

  const { data: matches, error: matchError } = await admin
    .from("matches")
    .select("id, date, opponent, competition, river_score, opponent_score")
    .in("id", matchIds)
  if (matchError) throw matchError

  let squad: any[] = []
  if (squadIds.length) {
    const squadResult = await admin
      .from("squad_players")
      .select("id, name, image_url, fotmob_id")
      .in("id", squadIds)
    if (squadResult.error) throw squadResult.error
    squad = squadResult.data ?? []
  }

  const matchById = new Map((matches ?? []).map((row: any) => [String(row.id), row]))
  const squadById = new Map(squad.map((row: any) => [String(row.id), row]))
  const grouped = new Map<string, any>()
  const history: any[] = []

  for (const row of ratings) {
    const match = matchById.get(String(row.match_id)) as any
    if (!match?.date) continue

    const year = yearInBuenosAires(String(match.date))
    const squadPlayerId = row.squad_player_id ? String(row.squad_player_id) : null
    const player = squadPlayerId ? squadById.get(squadPlayerId) as any : null
    const playerName = player?.name || String(row.player_name)
    const image = getPlayerImage(player)
    const playerKey = squadPlayerId ? `squad:${squadPlayerId}` : `name:${playerName.toLowerCase()}`
    const summaryKey = `${year}|${playerKey}`

    const current = grouped.get(summaryKey) ?? {
      seasonYear: year,
      squadPlayerId,
      playerName,
      image,
      ratingSum: 0,
      matchesRated: 0,
    }
    current.ratingSum += Number(row.rating)
    current.matchesRated += 1
    grouped.set(summaryKey, current)

    history.push({
      seasonYear: year,
      matchId: String(row.match_id),
      matchDate: String(match.date),
      opponent: String(match.opponent),
      competition: String(match.competition),
      riverScore: Number(match.river_score ?? 0),
      opponentScore: Number(match.opponent_score ?? 0),
      squadPlayerId,
      playerName,
      image,
      rating: Number(row.rating),
    })
  }

  const summary = [...grouped.values()]
    .map((row: any) => ({
      seasonYear: row.seasonYear,
      squadPlayerId: row.squadPlayerId,
      playerName: row.playerName,
      image: row.image,
      matchesRated: row.matchesRated,
      averageRating: Number((row.ratingSum / row.matchesRated).toFixed(2)),
    }))
    .sort((a: any, b: any) => b.seasonYear - a.seasonYear || b.averageRating - a.averageRating || a.playerName.localeCompare(b.playerName))

  history.sort((a: any, b: any) => {
    const byDate = new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
    if (byDate !== 0) return byDate
    return b.rating - a.rating || a.playerName.localeCompare(b.playerName)
  })

  return { summary, history }
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405)

    try {
      const body = await req.json().catch(() => null) as Record<string, any> | null
      if (!body || typeof body.action !== "string") return json({ ok: false, error: "Invalid request" }, 400)

      const userId = await getAuthenticatedUserId(req, ctx.supabaseAdmin)
      const deviceId = body.deviceId

      if (body.action === "profile_summary") {
        if (!userId) return json({ ok: false, error: "Iniciá sesión para ver tus puntuaciones guardadas." }, 401)
        if (isUuid(deviceId)) await claimAnonymousRatings(ctx.supabaseAdmin, userId, deviceId)
        const profile = await getProfileRatings(ctx.supabaseAdmin, userId)
        return json({ ok: true, ...profile })
      }

      if (typeof body.matchId !== "string" || !body.matchId.trim()) {
        return json({ ok: false, error: "Falta el partido." }, 400)
      }
      if (!isUuid(deviceId)) return json({ ok: false, error: "No pudimos identificar este dispositivo." }, 400)

      if (userId) await claimAnonymousRatings(ctx.supabaseAdmin, userId, deviceId)

      if (body.action === "ballot") {
        const ballot = await getBallot(ctx.supabaseAdmin, body.matchId, deviceId, userId)
        if (!ballot) return json({ ok: false, error: "Las puntuaciones no están disponibles para este partido." }, 404)
        return json({ ok: true, ballot })
      }

      if (body.action === "submit") {
        if (!body.ratings || typeof body.ratings !== "object" || Array.isArray(body.ratings)) {
          return json({ ok: false, error: "Las puntuaciones no son válidas." }, 400)
        }
        await submitRatings(ctx.supabaseAdmin, body.matchId, deviceId, userId, body.ratings)
        const ballot = await getBallot(ctx.supabaseAdmin, body.matchId, deviceId, userId)
        return json({ ok: true, ballot })
      }

      return json({ ok: false, error: "Invalid action" }, 400)
    } catch (error) {
      console.error("player-ratings failed", error)
      return json({ ok: false, error: error instanceof Error ? error.message : "No se pudo procesar la solicitud." }, 500)
    }
  }),
}
