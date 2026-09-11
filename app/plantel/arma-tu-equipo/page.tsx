import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TeamBuilderPageClientV2 } from "@/components/team-builder-page-client-v2"

export default function ArmaTuEquipoPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-5 md:py-10">
          <TeamBuilderPageClientV2 />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
