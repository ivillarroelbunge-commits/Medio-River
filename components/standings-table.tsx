import { cn } from "@/lib/utils"
import { TeamCrest } from "@/components/team-crest"

interface StandingRow {
  team: string
  position: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  pts: number
  isRiver?: boolean
}

interface StandingsTableProps {
  title: string
  rows: StandingRow[]
  variant?: "compact" | "full"
}

export function StandingsTable({
  title,
  rows,
  variant = "full",
}: StandingsTableProps) {
  const compact = variant === "compact"

  return (
    <section
      aria-label={`Tabla de posiciones — ${title}`}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Tabla
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="w-10 px-3 py-2 text-left">Pos</th>
              <th scope="col" className="px-2 py-2 text-left">Equipo</th>
              {!compact && (
                <>
                  <th scope="col" className="px-2 py-2 text-center">PG</th>
                  <th scope="col" className="px-2 py-2 text-center">PE</th>
                  <th scope="col" className="px-2 py-2 text-center">PP</th>
                  <th scope="col" className="px-2 py-2 text-center">GF</th>
                  <th scope="col" className="px-2 py-2 text-center">GC</th>
                </>
              )}
              <th scope="col" className="px-2 py-2 text-center">PJ</th>
              <th scope="col" className="px-3 py-2 text-center font-bold text-foreground">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors",
                  row.isRiver
                    ? "bg-primary/5 font-semibold"
                    : "hover:bg-muted/40",
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
                    {row.position}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <span className="flex items-center gap-2">
                    <TeamCrest team={row.team} size="xs" />
                    <span className={cn(row.isRiver && "text-primary")}>
                      {row.team}
                    </span>
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.pg}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.pe}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.pp}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.gf}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.gc}</td>
                  </>
                )}
                <td className="px-2 py-2.5 text-center text-muted-foreground">{row.pj}</td>
                <td className="px-3 py-2.5 text-center font-bold text-foreground">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
