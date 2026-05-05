export const defaultNewsCategories = ["Partidos", "Mercado de pases", "Juveniles", "Análisis"]

export function normalizeNewsCategory(category?: string) {
  if (!category?.trim()) return ""
  return category.trim() === "Opinión" ? "Análisis" : category.trim()
}
