import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TriviaGame } from "@/components/trivia-game"

export default function TriviaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.12),transparent_32%),linear-gradient(180deg,#fff,#f7f7f8)]">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose max-w-5xl space-y-8 py-8 md:py-12">
          <header className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-10 text-center text-secondary-foreground shadow-xl md:px-10 md:py-14">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,transparent_44%,white_45%,white_48%,transparent_49%,transparent_100%)]" />
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Juego diario</p>
              <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-6xl">Trivia Millonaria</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">Cinco preguntas nuevas cada día, un solo intento y dos rankings para picantear la tabla: diario y general acumulado.</p>
            </div>
          </header>
          <TriviaGame />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
