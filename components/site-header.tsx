"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FilePenLine, Menu, ShieldCheck, X } from "lucide-react"
import { HeaderUserMenu } from "@/components/header-user-menu"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { useAppState } from "@/components/app-state-provider"
import { getRoleLabel } from "@/lib/roles"

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Noticias", href: "/noticias" },
  { label: "Fixture", href: "/fixture" },
  { label: "Plantel", href: "/plantel" },
  { label: "Trivia", href: "/trivia" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentUser, isHydrated, logout } = useAppState()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-prose flex h-14 items-center justify-between gap-3 md:h-16 md:gap-4">
        <Logo />

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {isActive(item.href) && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>

        <HeaderUserMenu />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-prose flex max-h-[calc(100dvh-3.5rem)] flex-col gap-1 overflow-y-auto py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-accent text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
            {!mounted || !isHydrated || !currentUser ? (
              <>
                <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Iniciar sesión</Link>
                <Link href="/registrarse" onClick={() => setOpen(false)} className="rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">Registrarse</Link>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-card px-3 py-3">
                  <p className="font-semibold text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{getRoleLabel(currentUser.role)}</p>
                </div>
                <Link href="/perfil" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Mi perfil</Link>
                {currentUser.role === "editor" && (
                  <Link href="/editor/crear-noticia" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                    <FilePenLine className="h-4 w-4 text-primary" />
                    Panel editor
                  </Link>
                )}
                {currentUser.role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Panel admin
                  </Link>
                )}
                <button type="button" onClick={async () => { await logout(); setOpen(false) }} className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted">Cerrar sesión</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
