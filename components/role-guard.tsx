"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import type { UserRole } from "@/lib/data/types"
import { Button } from "@/components/ui/button"

export function RoleGuard({
  allow,
  title,
  children,
}: {
  allow: UserRole[]
  title: string
  children: React.ReactNode
}) {
  const { currentUser, isHydrated } = useAppState()

  if (!isHydrated) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Cargando...</div>
  }

  if (!currentUser) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-2xl font-bold">Necesitás iniciar sesión</h2>
        <p className="mt-2 text-muted-foreground">{title}</p>
        <Button asChild className="mt-5 rounded-full">
          <Link href="/iniciar-sesion">Ir a iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  if (!allow.includes(currentUser.role)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-2xl font-bold">Sin permisos</h2>
        <p className="mt-2 text-muted-foreground">Esta sección está disponible solo para {allow.join(" / ")}.</p>
      </div>
    )
  }

  return <>{children}</>
}
