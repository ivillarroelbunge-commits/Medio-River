"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CalendarDays, Camera, FilePenLine, Mail, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRoleBadgeClass, getRoleDescription, getRoleLabel } from "@/lib/roles"

export function ProfilePageClient() {
  const { currentUser, ranking, getUserResults, getUserTotalScore, updateProfile } = useAppState()
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(currentUser?.name ?? "")
    setAvatar(currentUser?.avatar ?? "")
  }, [currentUser])

  if (!currentUser) return null

  const results = getUserResults(currentUser.id)
  const totalScore = getUserTotalScore(currentUser.id)
  const position = ranking.findIndex((entry) => entry.user.id === currentUser.id) + 1
  const bestResult = results.reduce((best, result) => Math.max(best, result.score), 0)
  const averageScore = results.length > 0
    ? (results.reduce((total, result) => total + result.score, 0) / results.length).toLocaleString("es-AR", {
        maximumFractionDigits: 1,
      })
    : "-"
  const memberSince = new Date(currentUser.registeredAt).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
        <div className="relative min-h-36 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.38),transparent_32%),linear-gradient(135deg,#0b0b0d,#1b1b20_55%,#991b1b)] px-5 py-6 text-white md:min-h-40 md:px-8 md:py-7">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0%,transparent_46%,white_47%,white_50%,transparent_51%,transparent_100%)]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Mi cuenta</p>
              <h1 className="mt-2 break-words font-display text-[2rem] font-extrabold tracking-tight leading-none md:text-5xl">{currentUser.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/76">{getRoleDescription(currentUser.role)}</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-white/20 bg-white/10 px-4 py-1.5 text-white">
              {getRoleLabel(currentUser.role)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-5 p-4 md:gap-6 md:p-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center md:gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.35rem] bg-primary/10 text-primary ring-1 ring-border md:h-32 md:w-32 md:rounded-[1.75rem]">
                {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-5xl font-extrabold">{name.charAt(0)}</div>}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Perfil</p>
                <h2 className="mt-1 break-words font-display text-2xl font-extrabold md:truncate md:text-3xl">{currentUser.name}</h2>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <InfoLine icon={<Mail className="h-4 w-4" />} text={currentUser.email} />
                  <InfoLine icon={<CalendarDays className="h-4 w-4" />} text={`Miembro desde ${memberSince}`} />
                  <InfoLine icon={<UserRound className="h-4 w-4" />} text={`ID de usuario ${currentUser.id.slice(0, 8)}`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <Metric label="Puntaje total" value={String(totalScore)} />
              <Metric label="Ranking global" value={`#${position || "-"}`} />
              <Metric label="Partidas" value={String(results.length)} />
              <Metric label="Promedio" value={String(averageScore)} />
            </div>
          </div>

          <div className="space-y-5">
            <form
              className="space-y-4 rounded-2xl border border-border bg-muted/30 p-3 md:p-4"
              onSubmit={async (event) => {
                event.preventDefault()
                setError(null)
                setIsSaving(true)
                const result = await updateProfile({ name, avatar })
                setIsSaving(false)
                if (!result.ok) {
                  setError(result.error ?? "No se pudo actualizar el perfil.")
                }
              }}
            >
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">Editar datos públicos</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nombre</Label>
                <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-avatar">Foto de perfil URL</Label>
                <Input id="profile-avatar" value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-avatar-file">O subir foto desde tu computadora</Label>
                <Input
                  id="profile-avatar-file"
                  type="file"
                  accept="image/*"
                  className="h-11 rounded-xl"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result === "string") setAvatar(reader.result)
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
              {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{error}</p>}
              <Button type="submit" className="h-10 w-full rounded-full sm:w-auto" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar perfil"}
              </Button>
            </form>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-semibold">Resumen millonario</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Tu mejor trivia fue de <span className="font-semibold text-foreground">{bestResult}</span> respuestas correctas.
                {results.length > 0 ? " Seguí jugando para subir en el ranking global." : " Jugá tu primera trivia para empezar a sumar puntos."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {(currentUser.role === "editor" || currentUser.role === "admin") && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Herramientas</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentUser.role === "editor" && (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/editor/crear-noticia">
                    <FilePenLine className="h-4 w-4" />
                    Panel editor
                  </Link>
                </Button>
              )}
              {currentUser.role === "admin" && (
                <Button asChild className="rounded-full">
                  <Link href="/admin">
                    <ShieldCheck className="h-4 w-4" />
                    Panel admin
                  </Link>
                </Button>
              )}
            </div>
          </section>
        )}

        <section id="resultados" className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-6 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Trivia</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">Historial y ranking</h2>
        </div>

        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">Todavía no jugaste ninguna trivia.</p>
          ) : (
            results.map((result) => (
              <div key={result.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-3 md:px-4">
                <div>
                  <p className="font-semibold text-foreground">{result.dailyKey ? `Trivia diaria · ${result.dailyKey}` : "Partida jugada"}</p>
                  <p className="text-sm text-muted-foreground">{new Date(result.playedAt).toLocaleString("es-AR")}</p>
                </div>
                <p className="shrink-0 font-display text-xl font-extrabold text-primary md:text-2xl">{result.score}/{result.totalQuestions}</p>
              </div>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <p className="font-semibold">Top 10 general acumulado</p>
          </div>
          <div className="mt-4 space-y-2">
            {ranking.slice(0, 10).map((entry, index) => (
              <div key={entry.user.id} className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm">
                <span>{index + 1}. {entry.user.name}</span>
                <span className="font-semibold text-primary">{entry.totalScore} pts</span>
              </div>
            ))}
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="truncate">{text}</span>
    </p>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3 md:p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-extrabold text-foreground md:text-3xl">{value}</p>
    </div>
  )
}
