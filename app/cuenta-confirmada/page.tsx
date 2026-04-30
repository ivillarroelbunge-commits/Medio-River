import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Cuenta confirmada",
  description: "Tu cuenta de Medio River fue confirmada correctamente.",
}

export default function CuentaConfirmadaPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center">
        <section className="container-prose py-10">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
            <div className="bg-gradient-to-br from-primary via-red-700 to-zinc-950 px-6 py-10 text-center text-white md:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Cuenta activada</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-5xl">
                Tu cuenta ha sido confirmada
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base">
                Ya podés iniciar sesión, completar tu perfil, jugar la trivia diaria y participar del ranking de Medio River.
              </p>
            </div>

            <div className="space-y-5 p-5 text-center md:p-8">
              <p className="text-sm leading-6 text-muted-foreground">
                Si el sitio no inició sesión automáticamente, entrá con el email y contraseña que usaste al registrarte.
              </p>
              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Button asChild className="rounded-full">
                  <Link href="/iniciar-sesion">Iniciar sesión</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/perfil">Ir a mi perfil</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
