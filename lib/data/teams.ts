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
  Blooming: espnCrest(6047),
  "Racing Club": espnCrest(15),
  Carabobo: espnCrest(6037),
  "Argentinos Juniors": espnCrest(3),
  Banfield: espnCrest(235),
  "Defensa y Justicia": espnCrest(8950),
  Estudiantes: espnCrest(8),
  "Estudiantes de Río Cuarto": espnCrest(19685),
  "Estudiantes BA": "/crests/estudiantes-ba.jpg",
  Gimnasia: espnCrest(9),
  "Gimnasia y Esgrima La Plata": espnCrest(9),
  Huracán: espnCrest(10),
  Independiente: espnCrest(11),
  "Independiente Rivadavia": espnCrest(9744),
  Lanús: espnCrest(12),
  "LDU Quito": espnCrest(4816),
  "Newell's": espnCrest(14),
  Palmeiras: espnCrest(2029),
  "Rosario Central": espnCrest(17),
  Sarmiento: espnCrest(10158),
  "San Lorenzo": espnCrest(18),
  Talleres: espnCrest(19),
  Tigre: espnCrest(7767),
  Vélez: espnCrest(21),
  "Vélez Sarsfield": espnCrest(21),
  "Ciudad de Bolívar": "https://lahistoriariver.com/escudos/ciudad_bolivar.png",
  "Red Bull Bragantino": espnCrest(6079),
}

export function getTeamCrest(team: string) {
  return TEAM_CRESTS[team] ?? "/placeholder-logo.svg"
}
