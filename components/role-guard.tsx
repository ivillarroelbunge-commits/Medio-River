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
    return <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground md:p-6">Cargando...</div>
  }

  if (!currentUser) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:p-8">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-xl font-bold md:text-2xl">Necesitás iniciar sesión</h2>
        <p className="mt-2 text-muted-foreground">{title}</p>
        <Button asChild className="mt-5 w-full rounded-full sm:w-auto">
          <Link href="/iniciar-sesion">Ir a iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  if (!allow.includes(currentUser.role)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:p-8">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-xl font-bold md:text-2xl">Sin permisos</h2>
        <p className="mt-2 text-muted-foreground">Esta sección está disponible solo para {allow.join(" / ")}.</p>
      </div>
    )
  }

  return <>{children}</>
}
