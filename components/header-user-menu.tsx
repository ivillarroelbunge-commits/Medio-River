"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, FilePenLine, LogOut, ShieldCheck, Trophy, User2 } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/roles"

export function HeaderUserMenu() {
  const { currentUser, isHydrated, logout } = useAppState()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isHydrated || !currentUser) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href="/iniciar-sesion">Iniciar sesión</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/registrarse">Registrarse</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            currentUser.name.charAt(0)
          )}
        </span>
        <span className="max-w-28 truncate">{currentUser.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <div className="rounded-xl bg-muted/40 px-3 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
            <Badge variant="outline" className={`mt-2 rounded-full ${getRoleBadgeClass(currentUser.role)}`}>
              {getRoleLabel(currentUser.role)}
            </Badge>
          </div>

          <div className="mt-2 space-y-1">
            <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
              <User2 className="h-4 w-4 text-primary" />
              Mi perfil
            </Link>
            <Link href="/perfil#resultados" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
              <Trophy className="h-4 w-4 text-primary" />
              Mis resultados
            </Link>
            {currentUser.role === "editor" && (
              <Link href="/editor/crear-noticia" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
                <FilePenLine className="h-4 w-4 text-primary" />
                Panel editor
              </Link>
            )}
            {currentUser.role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Panel admin
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <LogOut className="h-4 w-4 text-primary" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
