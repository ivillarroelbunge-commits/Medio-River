const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://amftkabquesgzsurkols.supabase.co"
const TEAM_CREST_STORAGE_BASE = `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/team-crests`

type TeamDefinition = {
  name: string
  promiedosId: string
  crestSlug: string
  aliases?: string[]
}

/**
 * Single source of truth for team identities and crests.
 *
 * Every crest in this registry was imported from Promiedos and is stored in
 * our own Supabase Storage bucket. Every alias resolves to the same canonical
 * team, Promiedos id and stored image everywhere on the site.
 */
const TEAM_DEFINITIONS: TeamDefinition[] = [
  { name: "Aldosivi", promiedosId: "hccd", crestSlug: "aldosivi" },
  {
    name: "Argentinos Juniors",
    promiedosId: "ihb",
    crestSlug: "argentinos-juniors",
    aliases: ["Argentinos Jrs.", "Argentinos Jrs", "Argentinos"],
  },
  { name: "Atlético Tucumán", promiedosId: "gbfc", crestSlug: "atletico-tucuman" },
  { name: "Banfield", promiedosId: "ihi", crestSlug: "banfield" },
  { name: "Barracas Central", promiedosId: "jafb", crestSlug: "barracas-central" },
  { name: "Belgrano", promiedosId: "fhid", crestSlug: "belgrano", aliases: ["Belgrano (Córdoba)"] },
  { name: "Blooming", promiedosId: "hdac", crestSlug: "blooming" },
  { name: "Boca Juniors", promiedosId: "igg", crestSlug: "boca-juniors", aliases: ["Boca"] },
  { name: "Carabobo", promiedosId: "igie", crestSlug: "carabobo", aliases: ["Carabobo FC"] },
  {
    name: "Central Córdoba (Santiago del Estero)",
    promiedosId: "beafh",
    crestSlug: "central-cordoba-sde",
    aliases: ["Central Córdoba", "Central Córdoba SdE", "Central Cordoba SdE"],
  },
  { name: "Ciudad de Bolívar", promiedosId: "ghjha", crestSlug: "ciudad-de-bolivar", aliases: ["Ciudad De Bolivar"] },
  { name: "Defensa y Justicia", promiedosId: "hcbh", crestSlug: "defensa-y-justicia", aliases: ["Defensa"] },
  { name: "Deportivo Riestra", promiedosId: "bbjea", crestSlug: "deportivo-riestra", aliases: ["Riestra"] },
  {
    name: "Estudiantes de La Plata",
    promiedosId: "igh",
    crestSlug: "estudiantes-la-plata",
    aliases: ["Estudiantes", "Estudiantes LP", "Estudiantes (LP)"],
  },
  {
    name: "Estudiantes de Río Cuarto",
    promiedosId: "bheaf",
    crestSlug: "estudiantes-rio-cuarto",
    aliases: ["Estudiantes RC", "Estudiantes (RC)"],
  },
  {
    name: "Estudiantes BA",
    promiedosId: "hbbg",
    crestSlug: "estudiantes-ba",
    aliases: ["Estudiantes de Buenos Aires", "Estudiantes (BA)"],
  },
  { name: "Flamengo", promiedosId: "bcbf", crestSlug: "flamengo" },
  {
    name: "Gimnasia La Plata",
    promiedosId: "iia",
    crestSlug: "gimnasia-la-plata",
    aliases: ["Gimnasia", "Gimnasia (LP)", "Gimnasia y Esgrima La Plata", "Gimnasia y Esgrima (LP)"],
  },
  {
    name: "Gimnasia (Mendoza)",
    promiedosId: "bbjbf",
    crestSlug: "gimnasia-mendoza",
    aliases: ["Gimnasia de Mendoza", "Gimnasia Mendoza", "Gimnasia M.", "Gimnasia (M)"],
  },
  { name: "Huracán", promiedosId: "iie", crestSlug: "huracan" },
  { name: "Independiente", promiedosId: "ihe", crestSlug: "independiente" },
  { name: "Independiente Rivadavia", promiedosId: "hcch", crestSlug: "independiente-rivadavia", aliases: ["Independiente Riv."] },
  { name: "Independiente Santa Fe", promiedosId: "hgee", crestSlug: "independiente-santa-fe", aliases: ["Santa Fe"] },
  {
    name: "Instituto (Córdoba)",
    promiedosId: "hchc",
    crestSlug: "instituto",
    aliases: ["Instituto", "Instituto de Córdoba", "Instituto AC Córdoba"],
  },
  { name: "Junior", promiedosId: "hcae", crestSlug: "junior", aliases: ["Junior FC", "Junior de Barranquilla"] },
  { name: "Lanús", promiedosId: "igj", crestSlug: "lanus" },
  { name: "LDU Quito", promiedosId: "bcic", crestSlug: "ldu-quito", aliases: ["LDU", "Liga de Quito"] },
  { name: "Newell's Old Boys", promiedosId: "ihh", crestSlug: "newells-old-boys", aliases: ["Newell's", "Newells"] },
  { name: "Palmeiras", promiedosId: "bccc", crestSlug: "palmeiras" },
  { name: "Platense", promiedosId: "hcah", crestSlug: "platense" },
  { name: "Racing Club", promiedosId: "ihg", crestSlug: "racing-club", aliases: ["Racing"] },
  {
    name: "Red Bull Bragantino",
    promiedosId: "bchd",
    crestSlug: "red-bull-bragantino",
    aliases: ["Bragantino", "RB Bragantino"],
  },
  { name: "River Plate", promiedosId: "igi", crestSlug: "river-plate", aliases: ["CA River Plate", "River"] },
  { name: "Rosario Central", promiedosId: "ihf", crestSlug: "rosario-central", aliases: ["Central"] },
  { name: "San Lorenzo", promiedosId: "igf", crestSlug: "san-lorenzo", aliases: ["San Lorenzo de Almagro"] },
  {
    name: "Sarmiento (Junín)",
    promiedosId: "hbbh",
    crestSlug: "sarmiento-junin",
    aliases: ["Sarmiento", "Sarmiento Junín"],
  },
  {
    name: "Talleres (Córdoba)",
    promiedosId: "jche",
    crestSlug: "talleres-cordoba",
    aliases: ["Talleres", "Talleres de Córdoba"],
  },
  { name: "Tigre", promiedosId: "iid", crestSlug: "tigre" },
  { name: "Unión (Santa Fe)", promiedosId: "hcag", crestSlug: "union-santa-fe", aliases: ["Unión", "Unión de Santa Fe"] },
  {
    name: "Vélez Sarsfield",
    promiedosId: "ihc",
    crestSlug: "velez-sarsfield",
    aliases: ["Vélez", "Velez", "Velez Sarsfield"],
  },
]

function normalizeTeamKey(team: string) {
  return team
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

const TEAM_BY_KEY = new Map<string, TeamDefinition>()

for (const definition of TEAM_DEFINITIONS) {
  for (const value of [definition.name, ...(definition.aliases ?? [])]) {
    TEAM_BY_KEY.set(normalizeTeamKey(value), definition)
  }
}

function getStoredCrestUrl(definition: TeamDefinition) {
  return `${TEAM_CREST_STORAGE_BASE}/${definition.crestSlug}.png`
}

export function getCanonicalTeamName(team: string) {
  const trimmed = team.trim()
  return TEAM_BY_KEY.get(normalizeTeamKey(trimmed))?.name ?? trimmed
}

export function getTeamCrest(team: string) {
  const definition = TEAM_BY_KEY.get(normalizeTeamKey(team))
  return definition ? getStoredCrestUrl(definition) : "/crests/fallback.svg"
}

export function getPromiedosTeamId(team: string) {
  return TEAM_BY_KEY.get(normalizeTeamKey(team))?.promiedosId
}

export function hasTeamCrest(team: string) {
  return TEAM_BY_KEY.has(normalizeTeamKey(team))
}
