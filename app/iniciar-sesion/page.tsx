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
        <div className="container-prose grid gap-8 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-14">
          <header className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Usuarios</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Volvé a Medio River</h1>
            <p className="max-w-md text-muted-foreground">
              Entrá para guardar tu perfil, jugar la trivia y acceder a herramientas según tu rol.
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
