const ESPN_CREST_VERSION = "20260428"

function espnCrest(id: number) {
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${id}.png&v=${ESPN_CREST_VERSION}`
}

type TeamDefinition = {
  name: string
  crest: string
  aliases?: string[]
}

/**
 * Single source of truth for team identities and crests.
 *
 * Every alias resolves to the same canonical team and therefore to the exact
 * same crest everywhere in the site (home, fixture, match detail, tables, etc.).
 */
const TEAM_DEFINITIONS: TeamDefinition[] = [
  { name: "Aldosivi", crest: "/crests/aldosivi.png" },
  {
    name: "Argentinos Juniors",
    crest: "/crests/argentinos.jpg",
    aliases: ["Argentinos Jrs.", "Argentinos Jrs", "Argentinos"],
  },
  { name: "Atlético Tucumán", crest: "/crests/atletico-tucuman.png" },
  { name: "Banfield", crest: "/crests/banfield.jpg" },
  { name: "Barracas Central", crest: "/crests/barracas-central.png" },
  { name: "Belgrano", crest: "/crests/belgrano.png", aliases: ["Belgrano (Córdoba)"] },
  { name: "Blooming", crest: "/crests/blooming.png" },
  { name: "Boca Juniors", crest: "/crests/boca-juniors.jpg", aliases: ["Boca"] },
  { name: "Carabobo", crest: "/crests/carabobo.png", aliases: ["Carabobo FC"] },
  {
    name: "Central Córdoba (Santiago del Estero)",
    crest: espnCrest(11989),
    aliases: ["Central Córdoba", "Central Córdoba SdE", "Central Cordoba SdE"],
  },
  { name: "Ciudad de Bolívar", crest: espnCrest(21799) },
  { name: "Defensa y Justicia", crest: "/crests/defensa-y-justicia.jpg" },
  { name: "Deportivo Riestra", crest: espnCrest(17702), aliases: ["Riestra"] },
  {
    name: "Estudiantes de La Plata",
    crest: "/crests/estudiantes.jpg",
    aliases: ["Estudiantes", "Estudiantes LP", "Estudiantes (LP)"],
  },
  {
    name: "Estudiantes de Río Cuarto",
    crest: "/crests/estudiantes-de-rio-cuarto.png",
    aliases: ["Estudiantes RC", "Estudiantes (RC)"],
  },
  { name: "Estudiantes BA", crest: "/crests/estudiantes-ba.jpg", aliases: ["Estudiantes de Buenos Aires"] },
  { name: "Flamengo", crest: espnCrest(819) },
  {
    name: "Gimnasia La Plata",
    crest: "/crests/gimnasia.png",
    aliases: ["Gimnasia", "Gimnasia (LP)", "Gimnasia y Esgrima La Plata", "Gimnasia y Esgrima (LP)"],
  },
  {
    name: "Gimnasia (Mendoza)",
    crest: espnCrest(11972),
    aliases: ["Gimnasia de Mendoza", "Gimnasia Mendoza", "Gimnasia M."],
  },
  { name: "Huracán", crest: "/crests/huracan.jpg" },
  { name: "Independiente", crest: "/crests/independiente.jpg" },
  { name: "Independiente Rivadavia", crest: "/crests/independiente-rivadavia.png" },
  { name: "Independiente Santa Fe", crest: espnCrest(5488), aliases: ["Santa Fe"] },
  {
    name: "Instituto (Córdoba)",
    crest: espnCrest(2975),
    aliases: ["Instituto", "Instituto de Córdoba"],
  },
  { name: "Junior", crest: "/crests/junior.jpg", aliases: ["Junior de Barranquilla"] },
  { name: "Lanús", crest: "/crests/lanus.jpg" },
  { name: "LDU Quito", crest: "/crests/ldu-quito.jpg", aliases: ["LDU"] },
  { name: "Newell's Old Boys", crest: "/crests/newells.jpg", aliases: ["Newell's", "Newells"] },
  { name: "Palmeiras", crest: "/crests/palmeiras.jpg" },
  { name: "Platense", crest: espnCrest(7764) },
  { name: "Racing Club", crest: "/crests/racing.jpg", aliases: ["Racing"] },
  {
    name: "Red Bull Bragantino",
    crest: "/crests/red-bull-bragantino.png",
    aliases: ["Bragantino", "RB Bragantino"],
  },
  { name: "River Plate", crest: "/crests/river-plate.jpg", aliases: ["CA River Plate", "River"] },
  { name: "Rosario Central", crest: "/crests/rosario-central.png" },
  { name: "San Lorenzo", crest: "/crests/san-lorenzo.jpg", aliases: ["San Lorenzo de Almagro"] },
  {
    name: "Sarmiento (Junín)",
    crest: "/crests/sarmiento.jpg",
    aliases: ["Sarmiento", "Sarmiento Junín"],
  },
  {
    name: "Talleres (Córdoba)",
    crest: "/crests/talleres.jpg",
    aliases: ["Talleres", "Talleres de Córdoba"],
  },
  { name: "Tigre", crest: "/crests/tigre.jpg" },
  { name: "Unión (Santa Fe)", crest: espnCrest(20), aliases: ["Unión", "Unión de Santa Fe"] },
  {
    name: "Vélez Sarsfield",
    crest: "/crests/velez.jpg",
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

export function getCanonicalTeamName(team: string) {
  const trimmed = team.trim()
  return TEAM_BY_KEY.get(normalizeTeamKey(trimmed))?.name ?? trimmed
}

export function getTeamCrest(team: string) {
  return TEAM_BY_KEY.get(normalizeTeamKey(team))?.crest ?? "/crests/fallback.svg"
}

export function hasTeamCrest(team: string) {
  return TEAM_BY_KEY.has(normalizeTeamKey(team))
}
