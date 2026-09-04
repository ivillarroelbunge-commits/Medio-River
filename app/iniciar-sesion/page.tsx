import { LoginForm } from "@/components/auth-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { redirectIfAuthenticated } from "@/lib/supabase/guards"

export default async function IniciarSesionPage() {
  await redirectIfAuthenticated()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose grid gap-5 py-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-8 md:py-14">
          <header className="space-y-3 md:space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Equipo Medio River</p>
            <h1 className="font-display text-[2.2rem] font-extrabold tracking-tight leading-none md:text-5xl">Acceso interno</h1>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">
              Ingreso reservado para administradores y editores de Medio River.
            </p>
          </header>
          <div className="mx-auto w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
