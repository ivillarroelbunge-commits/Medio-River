"use client"

import { useRef, useState, type ReactNode } from "react"
import { Bold, Heading2, Heading3, Italic, LinkIcon, Underline } from "lucide-react"
import type { NewsArticle } from "@/lib/data/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const defaultCategories = ["Partidos", "Mercado de pases", "Opinión", "Juveniles"]
const defaultCompetitions = ["Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]

export function EditorNewsForm({
  initialArticle,
  categoryOptions = defaultCategories,
  competitionOptions = defaultCompetitions,
  onSubmit,
  submitLabel,
}: {
  initialArticle?: NewsArticle
  categoryOptions?: string[]
  competitionOptions?: string[]
  onSubmit: (input: {
    id?: string
    title: string
    intro: string
    content: string
    category: NewsArticle["category"]
    competition?: NewsArticle["competition"]
    image?: string
  }) => void
  submitLabel: string
}) {
  const [image, setImage] = useState(initialArticle?.image ?? "")
  const baseCategories = mergeOptions(categoryOptions, defaultCategories)
  const baseCompetitions = mergeOptions(competitionOptions, defaultCompetitions)
  const initialCategoryIsCustom = Boolean(initialArticle?.category && !baseCategories.includes(initialArticle.category))
  const initialCompetitionIsCustom = Boolean(initialArticle?.competition && !baseCompetitions.includes(initialArticle.competition))
  const categories = mergeOptions(categoryOptions, defaultCategories, initialArticle?.category)
  const competitions = mergeOptions(competitionOptions, defaultCompetitions, initialArticle?.competition)
  const [categoryMode, setCategoryMode] = useState<"existing" | "custom">(initialCategoryIsCustom ? "custom" : "existing")
  const [competitionMode, setCompetitionMode] = useState<"existing" | "custom">(initialCompetitionIsCustom ? "custom" : "existing")
  const [contentHtml, setContentHtml] = useState(() => articleContentToEditorHtml(initialArticle))

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const category =
          categoryMode === "custom"
            ? String(formData.get("categoryCustom") || "").trim()
            : String(formData.get("category") || "Partidos").trim()
        const competition =
          competitionMode === "custom"
            ? String(formData.get("competitionCustom") || "").trim()
            : String(formData.get("competition") || "").trim()

        onSubmit({
          id: initialArticle?.id,
          title: String(formData.get("title") || ""),
          intro: String(formData.get("intro") || ""),
          content: sanitizeNewsContentHtml(contentHtml),
          category: category || "Partidos",
          competition: competition || undefined,
          image: image || undefined,
        })
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="news-title">Título</Label>
        <Input id="news-title" name="title" defaultValue={initialArticle?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-intro">Introducción</Label>
        <Textarea id="news-intro" name="intro" defaultValue={initialArticle?.intro} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-content">Contenido</Label>
        <RichTextEditor value={contentHtml} onChange={setContentHtml} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="news-category">Categoría</Label>
          <div className="grid gap-2">
            <select
              id="news-category"
              value={categoryMode}
              onChange={(event) => setCategoryMode(event.target.value as "existing" | "custom")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="existing">Usar categoría existente</option>
              <option value="custom">Crear nueva categoría</option>
            </select>
            {categoryMode === "existing" ? (
              <select name="category" defaultValue={initialArticle?.category ?? "Partidos"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            ) : (
              <Input name="categoryCustom" defaultValue={initialArticle?.category ?? ""} placeholder="Ej: Mercado interno, Inferiores, Opinión táctica" required />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-competition">Competencia</Label>
          <div className="grid gap-2">
            <select
              id="news-competition"
              name="competitionMode"
              value={competitionMode}
              onChange={(event) => setCompetitionMode(event.target.value as "existing" | "custom")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="existing">Usar competencia existente</option>
              <option value="custom">Crear nueva competencia</option>
            </select>
            {competitionMode === "existing" ? (
              <select name="competition" defaultValue={initialArticle?.competition ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Sin competencia</option>
                {competitions.map((competition) => <option key={competition}>{competition}</option>)}
              </select>
            ) : (
              <Input name="competitionCustom" defaultValue={initialArticle?.competition ?? ""} placeholder="Ej: Superclásico, Pretemporada, Mundial de Clubes" />
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-image">Imagen URL</Label>
        <Input id="news-image" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-image-file">O subir archivo</Label>
        <Input
          id="news-image-file"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === "string") setImage(reader.result)
            }
            reader.readAsDataURL(file)
          }}
        />
      </div>
      {image && <img src={image} alt="Preview" className="h-40 w-full rounded-2xl object-cover" />}
      <Button type="submit" className="w-full rounded-full sm:w-auto">{submitLabel}</Button>
    </form>
  )
}

function mergeOptions(options: string[], defaults: string[], current?: string) {
  const normalized = [...defaults, ...options, current]
    .filter((option): option is string => Boolean(option?.trim()))
    .map((option) => option.trim())
  return Array.from(new Set(normalized))
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)

  const runCommand = (command: string, argument?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, argument)
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const applyLink = () => {
    const url = window.prompt("Pegá el link para el texto seleccionado")
    if (!url) return
    const normalizedUrl = normalizeEditorUrl(url)
    if (!normalizedUrl) return
    runCommand("createLink", normalizedUrl)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-input bg-background shadow-xs">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/35 p-2">
        <EditorToolbarButton label="Título" onClick={() => runCommand("formatBlock", "h2")}>
          <Heading2 className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton label="Subtítulo" onClick={() => runCommand("formatBlock", "h3")}>
          <Heading3 className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton label="Párrafo" onClick={() => runCommand("formatBlock", "p")}>
          P
        </EditorToolbarButton>
        <span className="mx-1 h-8 w-px bg-border" />
        <EditorToolbarButton label="Negrita" onClick={() => runCommand("bold")}>
          <Bold className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton label="Cursiva" onClick={() => runCommand("italic")}>
          <Italic className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton label="Subrayado" onClick={() => runCommand("underline")}>
          <Underline className="h-4 w-4" />
        </EditorToolbarButton>
        <EditorToolbarButton label="Link" onClick={applyLink}>
          <LinkIcon className="h-4 w-4" />
        </EditorToolbarButton>
      </div>
      <div
        ref={editorRef}
        id="news-content"
        contentEditable
        className="min-h-56 px-3 py-3 text-sm leading-7 outline-none empty:before:text-muted-foreground empty:before:content-['Escribí_la_noticia...'] md:min-h-72 md:px-4 md:text-base md:leading-8 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-extrabold md:[&_h2]:text-2xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold md:[&_h3]:text-xl [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onBlur={(event) => onChange(sanitizeNewsContentHtml(event.currentTarget.innerHTML))}
      />
    </div>
  )
}

function EditorToolbarButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold text-muted-foreground transition hover:bg-background hover:text-foreground"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function articleContentToEditorHtml(article?: NewsArticle) {
  if (!article?.content.length) return ""
  if (article.content.some(hasHtmlTags)) return sanitizeNewsContentHtml(article.content.join(""))
  return article.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
}

function sanitizeNewsContentHtml(input: string) {
  if (typeof window === "undefined") return input

  const allowedTags = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "A", "H2", "H3"])
  const template = document.createElement("template")
  template.innerHTML = input.trim()

  const sanitizeNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) continue
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove()
        continue
      }

      const element = child as HTMLElement
      if (!allowedTags.has(element.tagName)) {
        const fragment = document.createDocumentFragment()
        while (element.firstChild) fragment.appendChild(element.firstChild)
        element.replaceWith(fragment)
        sanitizeNode(fragment)
        continue
      }

      for (const attribute of Array.from(element.attributes)) {
        const keepHref = element.tagName === "A" && attribute.name === "href"
        if (!keepHref) element.removeAttribute(attribute.name)
      }

      if (element.tagName === "A") {
        const href = normalizeEditorUrl(element.getAttribute("href") ?? "")
        if (!href) {
          element.replaceWith(...Array.from(element.childNodes))
          continue
        }
        element.setAttribute("href", href)
        element.setAttribute("target", "_blank")
        element.setAttribute("rel", "noopener noreferrer")
      }

      if (element.tagName === "B") {
        const strong = document.createElement("strong")
        strong.innerHTML = element.innerHTML
        sanitizeNode(strong)
        element.replaceWith(strong)
        continue
      }

      if (element.tagName === "I") {
        const em = document.createElement("em")
        em.innerHTML = element.innerHTML
        sanitizeNode(em)
        element.replaceWith(em)
        continue
      }

      sanitizeNode(child)
    }
  }

  sanitizeNode(template.content)

  const html = template.innerHTML.trim()
  return html || ""
}

function normalizeEditorUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`
  return ""
}

function hasHtmlTags(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
