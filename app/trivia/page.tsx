import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { DeviceTriviaGame } from "@/components/device-trivia-game"

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
              <h1 className="mx-auto max-w-3xl font-display text-[2rem] font-extrabold leading-none tracking-tight md:text-5xl">Trivia Millonaria</h1>
            </div>
          </header>

          <div id="trivia-game-compact">
            <DeviceTriviaGame />
          </div>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        @media (min-width: 768px) {
          #trivia-game-compact > div.overflow-hidden {
            border-radius: 1.5rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:first-child {
            padding: 0.75rem 1.5rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:first-child h2 {
            font-size: 1.5rem;
            line-height: 1.15;
          }

          #trivia-game-compact > div.overflow-hidden > div:first-child > div > div:last-child {
            border-radius: 0.85rem;
            padding: 0.45rem 0.75rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:first-child > div > div:last-child p:last-child {
            font-size: 1.5rem;
            line-height: 1;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) {
            padding: 0.9rem 1.5rem 1rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div:first-child {
            height: 0.5rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div:nth-child(2) {
            margin-top: 0.75rem;
            border-radius: 1rem;
            padding: 0.9rem 1rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div:nth-child(2) > div:first-child {
            margin-bottom: 0.45rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div:nth-child(2) h2 {
            font-size: 1.5rem;
            line-height: 1.18;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > ul {
            margin-top: 0.7rem;
            gap: 0.5rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > ul button {
            min-height: 3.5rem;
            border-radius: 0.9rem;
            padding: 0.55rem 0.75rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > p {
            margin-top: 0.7rem;
            padding: 0.7rem 0.8rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div.flex.justify-end {
            margin-top: 0.75rem;
          }

          #trivia-game-compact > div.overflow-hidden > div:nth-child(2) > div.flex.justify-end button {
            height: 2.5rem;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
