const CREST_VERSION = "20260428"

function espnCrest(id: number) {
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${id}.png&v=${CREST_VERSION}`
}

const TEAM_CRESTS: Record<string, string> = {
  Aldosivi: espnCrest(9739),
  "River Plate": espnCrest(16),
  "Atlético Tucumán": espnCrest(9785),
  "Boca Juniors": espnCrest(5),
  "Barracas Central": espnCrest(10060),
  Belgrano: espnCrest(4),
  "Belgrano (Córdoba)": espnCrest(4),
  Blooming: espnCrest(6047),
  "Central Córdoba": espnCrest(11989),
  "Central Córdoba (Santiago del Estero)": espnCrest(11989),
  "Racing Club": espnCrest(15),
  Carabobo: espnCrest(6037),
  "Argentinos Juniors": espnCrest(3),
  Banfield: espnCrest(235),
  "Defensa y Justicia": espnCrest(8950),
  "Deportivo Riestra": espnCrest(17702),
  Estudiantes: espnCrest(8),
  "Estudiantes LP": espnCrest(8),
  "Estudiantes de La Plata": espnCrest(8),
  "Estudiantes de Río Cuarto": espnCrest(19685),
  "Estudiantes BA": "/crests/estudiantes-ba.jpg",
  Flamengo: espnCrest(819),
  Gimnasia: espnCrest(9),
  "Gimnasia (Mendoza)": espnCrest(11972),
  "Gimnasia La Plata": espnCrest(9),
  "Gimnasia y Esgrima La Plata": espnCrest(9),
  Huracán: espnCrest(10),
  Independiente: espnCrest(11),
  "Independiente Rivadavia": espnCrest(9744),
  Instituto: espnCrest(2975),
  "Instituto (Córdoba)": espnCrest(2975),
  Lanús: espnCrest(12),
  "LDU Quito": espnCrest(4816),
  "Newell's": espnCrest(14),
  "Newell's Old Boys": espnCrest(14),
  Palmeiras: espnCrest(2029),
  Platense: espnCrest(7764),
  "Rosario Central": espnCrest(17),
  Sarmiento: espnCrest(10158),
  "Sarmiento (Junín)": espnCrest(10158),
  "San Lorenzo": espnCrest(18),
  Talleres: espnCrest(19),
  "Talleres (Córdoba)": espnCrest(19),
  Tigre: espnCrest(7767),
  Unión: espnCrest(20),
  "Unión (Santa Fe)": espnCrest(20),
  Vélez: espnCrest(21),
  "Vélez Sarsfield": espnCrest(21),
  "Ciudad de Bolívar": "https://lahistoriariver.com/escudos/ciudad_bolivar.png",
  "Red Bull Bragantino": espnCrest(6079),
}

export function getTeamCrest(team: string) {
  return TEAM_CRESTS[team] ?? "/placeholder-logo.svg"
}
