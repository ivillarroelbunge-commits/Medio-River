import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/data/types"
import { createClient } from "@/lib/supabase/server"
import { mapProfileToAppUser, type ProfileRow } from "@/lib/supabase/profiles"

const PROFILE_SELECT = "id, email, display_name, avatar_url, role, created_at"

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

async function ensureProfile(user: User) {
  const supabase = await createClient()
  await supabase.from("profiles").upsert(getProfilePayload(user), {
    onConflict: "id",
    ignoreDuplicates: false,
  })
}

async function getCurrentProfileRow(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single<ProfileRow>()

  return data ?? null
}

export async function getServerCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  await ensureProfile(user)

  const profile = await getCurrentProfileRow(user.id)
  if (!profile) return null

  return mapProfileToAppUser(profile, user)
}

export async function requireAuth() {
  const user = await getServerCurrentUser()
  if (!user) redirect("/iniciar-sesion")
  return user
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) redirect("/")
  return user
}

export async function redirectIfAuthenticated() {
  const user = await getServerCurrentUser()
  if (user) redirect("/perfil")
}
