import { cn } from "@/lib/utils"
import { TeamCrest } from "@/components/team-crest"

interface Scorer {
  player: string
  team: string
  goals: number
  isRiver?: boolean
}

interface TopScorersTableProps {
  title: string
  rows: Scorer[]
}

export function TopScorersTable({ title, rows }: TopScorersTableProps) {
  if (rows.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-foreground">
            {title}
          </h3>
        </header>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Todavía no hay goleadores para mostrar.
        </div>
      </section>
    )
  }

  const max = rows[0]?.goals ?? 1

  return (
    <section
      aria-label={`Goleadores — ${title}`}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Goleadores
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="w-10 px-3 py-2 text-left">#</th>
              <th scope="col" className="px-2 py-2 text-left">Jugador</th>
              <th scope="col" className="px-2 py-2 text-left">Equipo</th>
              <th scope="col" className="px-3 py-2 text-center font-bold text-foreground">
                Goles
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pct = Math.round((row.goals / max) * 100)
              return (
                <tr
                  key={`${row.player}-${row.team}`}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors",
                    row.isRiver ? "bg-primary/5 font-semibold" : "hover:bg-muted/40",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold",
                        row.isRiver
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={cn(row.isRiver && "text-primary")}>
                      {row.player}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <TeamCrest team={row.team} size="xs" />
                      <span className="truncate">{row.team}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block"
                        aria-hidden="true"
                      >
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.isRiver ? "bg-primary" : "bg-muted-foreground/50",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-bold tabular-nums text-foreground">
                        {row.goals}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
