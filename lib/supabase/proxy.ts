import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getSupabaseEnv } from "@/lib/supabase/env"
import type { UserRole } from "@/lib/data/types"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, key } = getSupabaseEnv()

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsError ? null : claimsData?.claims ?? null

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/iniciar-sesion") || pathname.startsWith("/registrarse")
  const needsUser = pathname.startsWith("/perfil") || pathname.startsWith("/admin") || pathname.startsWith("/editor")

  if (!claims?.sub && needsUser) {
    const url = request.nextUrl.clone()
    url.pathname = "/iniciar-sesion"
    return NextResponse.redirect(url)
  }

  if (claims?.sub && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/perfil"
    return NextResponse.redirect(url)
  }

  if (claims?.sub && (pathname.startsWith("/admin") || pathname.startsWith("/editor"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.sub)
      .single<{ role: UserRole }>()

    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith("/editor") && profile?.role !== "editor") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return response
}
