import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TriviaGame } from "@/components/trivia-game"

export default function TriviaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.12),transparent_32%),linear-gradient(180deg,#fff,#f7f7f8)]">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose max-w-5xl space-y-5 py-4 md:space-y-7 md:py-10">
          <header className="relative overflow-hidden rounded-[1.35rem] bg-secondary px-5 py-5 text-center text-secondary-foreground shadow-xl md:rounded-[1.75rem] md:px-10 md:py-8">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,transparent_44%,white_45%,white_48%,transparent_49%,transparent_100%)]" />
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="relative">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-white/70 md:text-[0.68rem] md:tracking-[0.24em]">Juego semanal</p>
              <h1 className="mx-auto mt-2 max-w-3xl font-display text-[2rem] font-extrabold leading-none tracking-tight md:text-5xl">Trivia Millonaria</h1>
            </div>
          </header>
          <TriviaGame />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
