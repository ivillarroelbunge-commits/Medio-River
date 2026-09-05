import type { SquadPlayer } from "@/lib/data/types"

export const squadVerifiedAt = "4 de septiembre de 2026"

function fotmobPlayerImage(id: number) {
  return `https://images.fotmob.com/image_resources/playerimages/${id}.png`
}

export const squadPlayers: SquadPlayer[] = [
  { id: "player-centurion", name: "Ezequiel Centurión", number: 33, line: "Arqueros", position: "Arquero", age: 29, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(971901) },
  { id: "player-beltran", name: "Santiago Beltrán", number: 41, line: "Arqueros", position: "Arquero", age: 21, nationality: "Argentina", foot: "Zurdo", fromAcademy: true, image: fotmobPlayerImage(1652014) },
  { id: "player-jeremias-martinet", name: "Jeremías Martinet", number: 57, line: "Arqueros", position: "Arquero", age: 21, nationality: "Argentina", foot: "—", fromAcademy: true },

  { id: "player-tobias-ramirez", name: "Tobías Ramírez", number: 2, line: "Defensores", position: "Defensor central", age: 19, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(1607568) },
  { id: "player-francisco-ortega", name: "Francisco Ortega", number: 3, line: "Defensores", position: "Lateral izquierdo", age: 27, nationality: "Argentina", foot: "Zurdo", fromAcademy: false, image: fotmobPlayerImage(902969) },
  { id: "player-rivero", name: "Lautaro Rivero", number: 13, line: "Defensores", position: "Defensor central", age: 22, nationality: "Argentina", foot: "Zurdo", fromAcademy: true, image: fotmobPlayerImage(1649321) },
  { id: "player-giovanni-gonzalez", name: "Giovanni González", number: 20, line: "Defensores", position: "Lateral derecho", age: 31, nationality: "Uruguay", foot: "Diestro", fromAcademy: false },
  { id: "player-acuna", name: "Marcos Acuña", number: 21, line: "Defensores", position: "Lateral izquierdo", age: 34, nationality: "Argentina", foot: "Zurdo", fromAcademy: false, image: fotmobPlayerImage(561187) },
  { id: "player-martinez-quarta", name: "Lucas Martínez Quarta", number: 28, line: "Defensores", position: "Defensor central", age: 30, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(638771) },
  { id: "player-montiel", name: "Gonzalo Montiel", number: 29, line: "Defensores", position: "Lateral derecho", age: 29, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(687008) },
  { id: "player-otamendi", name: "Nicolás Otamendi", number: 30, line: "Defensores", position: "Defensor central", age: 38, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(174321) },
  { id: "player-facundo-gonzalez", name: "Facundo González", number: 31, line: "Defensores", position: "Defensor central", age: 20, nationality: "Argentina", foot: "Zurdo", fromAcademy: true, image: fotmobPlayerImage(1610373) },

  { id: "player-portillo", name: "Juan Portillo", number: 5, line: "Mediocampistas", position: "Volante central", age: 26, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(1201814) },
  { id: "player-moreno", name: "Aníbal Moreno", number: 6, line: "Mediocampistas", position: "Volante central", age: 27, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(1025557) },
  { id: "player-mauro-arambarri", name: "Mauro Arambarri", number: 8, line: "Mediocampistas", position: "Volante central", age: 30, nationality: "Uruguay", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(625340) },
  { id: "player-vera", name: "Fausto Vera", number: 15, line: "Mediocampistas", position: "Volante central", age: 26, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(981070) },
  { id: "player-thiago-almada", name: "Thiago Almada", number: 23, line: "Mediocampistas", position: "Volante ofensivo", age: 25, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(955271) },
  { id: "player-juan-cruz-meza", name: "Juan Cruz Meza", number: 24, line: "Mediocampistas", position: "Volante ofensivo", age: 18, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(1783664) },
  { id: "player-galvan", name: "Tomás Galván", number: 26, line: "Mediocampistas", position: "Volante ofensivo", age: 26, nationality: "Argentina", foot: "Zurdo", fromAcademy: true, image: fotmobPlayerImage(1256242) },
  { id: "player-lucas-silva", name: "Lucas Silva", number: 44, line: "Mediocampistas", position: "Volante central", age: 19, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(1958447) },
  { id: "player-tobias-andrada", name: "Tobías Andrada", number: 50, line: "Mediocampistas", position: "Mediocampista", age: 19, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(1761527) },

  { id: "player-driussi", name: "Sebastián Driussi", number: 9, line: "Delanteros", position: "Delantero", age: 30, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(510698) },
  { id: "player-angel-correa", name: "Ángel Correa", number: 10, line: "Delanteros", position: "Delantero", age: 31, nationality: "Argentina", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(432950) },
  { id: "player-lucas-beltran", name: "Lucas Beltrán", number: 18, line: "Delanteros", position: "Centrodelantero", age: 25, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(974755) },
  { id: "player-rafael-borre", name: "Rafael Borré", number: 19, line: "Delanteros", position: "Centrodelantero", age: 30, nationality: "Colombia", foot: "Diestro", fromAcademy: false, image: fotmobPlayerImage(533775) },
  { id: "player-lautaro-pereyra", name: "Lautaro Pereyra", number: 25, line: "Delanteros", position: "Delantero", age: 18, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(1946519) },
  { id: "player-ruberto", name: "Agustín Ruberto", number: 32, line: "Delanteros", position: "Centrodelantero", age: 20, nationality: "Argentina", foot: "Diestro", fromAcademy: true, image: fotmobPlayerImage(1580546) },
]
