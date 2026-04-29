import type { User } from "@supabase/supabase-js"
import type { AppUser, UserRole } from "@/lib/data/types"

export interface ProfileRow {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export function mapProfileToAppUser(profile: ProfileRow, fallbackUser?: User): AppUser {
  return {
    id: profile.id,
    name:
      profile.display_name ||
      (fallbackUser?.user_metadata?.name as string | undefined) ||
      fallbackUser?.email?.split("@")[0] ||
      profile.email?.split("@")[0] ||
      "Usuario",
    email: profile.email || fallbackUser?.email || "",
    avatar:
      profile.avatar_url ||
      (fallbackUser?.user_metadata?.avatar_url as string | undefined) ||
      undefined,
    password: "",
    role: profile.role,
    registeredAt: profile.created_at,
  }
}
