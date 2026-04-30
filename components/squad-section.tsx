import type { SquadPlayer } from "@/lib/data/types"
import { PlayerCard } from "@/components/player-card"

export function SquadSection({ title, players }: { title: string; players: SquadPlayer[] }) {
  return (
    <section className="space-y-4 md:space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-primary md:h-8" aria-hidden="true" />
          <div>
            <h2 className="font-display text-[1.45rem] font-extrabold uppercase text-foreground md:text-3xl">
              {title}
            </h2>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {players.length} jugadores
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  )
}
