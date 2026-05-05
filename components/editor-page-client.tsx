"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LayoutList, Pencil, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/components/app-state-provider"
import { EditorNewsForm } from "@/components/editor-news-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { NewsArticle } from "@/lib/data/types"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/roles"

export function EditorPageClient() {
  const router = useRouter()
  const { currentUser, news, saveNews } = useAppState()
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const categoryOptions = useMemo(() => getUniqueNewsOptions(news.map((article) => article.category)), [news])
  const competitionOptions = useMemo(() => getUniqueNewsOptions(news.map((article) => article.competition)), [news])

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel editor</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
            {mode === "create" ? "Crear noticia" : mode === "edit" ? "Editar noticia" : "Panel de noticias"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Publicá nuevas coberturas para la home y el listado principal de noticias.
          </p>
          {currentUser && (
            <Badge variant="outline" className={`mt-3 rounded-full ${getRoleBadgeClass(currentUser.role)}`}>
              {getRoleLabel(currentUser.role)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/noticias">
              <LayoutList className="h-4 w-4" />
              Ver noticias
            </Link>
          </Button>
        </div>
      </div>

      {mode === "create" && (
        <EditorNewsForm
          key="new"
          categoryOptions={categoryOptions}
          competitionOptions={competitionOptions}
          submitLabel={isSaving ? "Guardando..." : "Publicar noticia"}
          onSubmit={async (input) => {
            setError(null)
            setIsSaving(true)
            const result = await saveNews(input)
            setIsSaving(false)
            if (!result.ok) {
              setError(result.error ?? "No se pudo guardar la noticia.")
              return
            }
            setEditing(null)
            setMode("list")
            router.refresh()
          }}
        />
      )}
      {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{error}</p>}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">Noticias editables</h2>
            <p className="text-sm text-muted-foreground">Seleccioná una noticia existente para modificarla.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {mode !== "list" && (
              <Button type="button" variant="outline" className="rounded-full" onClick={() => {
                setEditing(null)
                setMode("list")
              }}>
                Cerrar formulario
              </Button>
            )}
            <Button type="button" className="rounded-full" onClick={() => {
              setEditing(null)
              setMode("create")
            }}>
              <Plus className="h-4 w-4" />
              Crear noticia
            </Button>
          </div>
        </div>

        {news.map((article) => (
          <div key={article.id} className="space-y-3">
            <div className={`flex flex-col gap-3 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${editing?.id === article.id ? "border-primary/40 bg-primary/5" : "border-border"}`}>
              <div>
                <p className="font-semibold text-foreground">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.category} · {article.competition ?? "Sin competencia"}</p>
              </div>
              <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto" onClick={() => {
                const isSameArticle = editing?.id === article.id && mode === "edit"
                setEditing(isSameArticle ? null : article)
                setMode(isSameArticle ? "list" : "edit")
              }}>
                <Pencil className="h-4 w-4" />
                {editing?.id === article.id && mode === "edit" ? "Cerrar edición" : "Editar noticia"}
              </Button>
            </div>
            {editing?.id === article.id && mode === "edit" && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
                <EditorNewsForm
                  key={editing.id}
                  categoryOptions={categoryOptions}
                  competitionOptions={competitionOptions}
                  initialArticle={editing}
                  submitLabel={isSaving ? "Guardando..." : "Guardar cambios"}
                  onSubmit={async (input) => {
                    setError(null)
                    setIsSaving(true)
                    const result = await saveNews(input)
                    setIsSaving(false)
                    if (!result.ok) {
                      setError(result.error ?? "No se pudo guardar la noticia.")
                      return
                    }
                    setEditing(null)
                    setMode("list")
                    router.refresh()
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

function getUniqueNewsOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())))
}
