import { EditorPageClient } from "@/components/editor-page-client"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { requireRole } from "@/lib/supabase/guards"

export default async function CrearNoticiaPage() {
  await requireRole(["editor"])

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-5 md:py-10">
          <EditorPageClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
