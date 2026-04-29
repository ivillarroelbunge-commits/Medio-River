import { RegisterForm } from "@/components/auth-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { redirectIfAuthenticated } from "@/lib/supabase/guards"

export default async function RegistrarsePage() {
  await redirectIfAuthenticated()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose grid gap-8 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-14">
          <header className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Usuarios</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Creá tu cuenta</h1>
            <p className="max-w-md text-muted-foreground">
              Sumate a la comunidad de Medio River y dejá tu historial listo para rankings, trivia y perfil.
            </p>
          </header>
          <div className="mx-auto w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
