import Link from "next/link"
import { ArrowRight, Calendar, Clock, Gamepad2, Trophy } from "lucide-react"
import type { Match } from "@/lib/data/types"
import { formatTime, formatWeekdayDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { TeamCrest } from "@/components/team-crest"

const PANEL_BASE = "relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 shadow-sm md:min-h-[210px]"

export function HomeNextMatchPanel({ match }: { match: Match }) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <section aria-label="Próximo partido" className={`${PANEL_BASE} border-black bg-[#08080a] text-white shadow-black/20`}>
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(115deg,transparent_0%,transparent_44%,white_45%,white_48%,transparent_49%,transparent_100%)]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
          <Trophy className="h-3.5 w-3.5" />
          Próximo partido
        </div>
        <Link href="/fixture" className="group inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15">
          Ver fixture
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col justify-center gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white p-2 shadow-md">
            <TeamCrest team={homeTeam} size="lg" />
          </span>
          <span className="font-display text-xl font-extrabold text-white/45">VS</span>
          <span className="rounded-2xl bg-white p-2 shadow-md">
            <TeamCrest team={awayTeam} size="lg" />
          </span>
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">{homeTeam} vs. {awayTeam}</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-white/55">{match.competition} · {match.isHome ? "Local" : "Visitante"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/86">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> <span className="font-semibold">{formatWeekdayDate(match.date)}</span></span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> <span className="font-semibold">{formatTime(match.date)} hs</span></span>
        </div>
      </div>
    </section>
  )
}

export function HomeTriviaPanel() {
  return (
    <section aria-label="Trivia" className={`${PANEL_BASE} border-primary bg-primary text-primary-foreground shadow-primary/20`}>
      <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-black/25 blur-3xl" />
      <div className="absolute -bottom-24 right-4 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_20%,white_0,white_2px,transparent_2px)] [background-size:22px_22px]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75">
          <Gamepad2 className="h-3.5 w-3.5" />
          Trivia
        </div>
        <Button asChild size="sm" className="rounded-full bg-white px-5 text-primary hover:bg-white/90">
          <Link href="/trivia">Jugar</Link>
        </Button>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-md">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">¿Cuánto sabés de River?</h2>
          <p className="mt-1 text-sm leading-6 text-white/78">Trivia diaria de 5 preguntas, un intento por usuario y ranking actualizado.</p>
        </div>
      </div>
    </section>
  )
}
