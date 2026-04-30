insert into public.trivia_questions (id, question, options, correct_index, explanation)
values
  (
    'trivia-bank-001',
    $$¿En qué año se fundó oficialmente el Club Atlético River Plate?$$,
    jsonb_build_array($$1899$$, $$1901$$, $$1905$$, $$1908$$),
    1,
    $$River Plate fue fundado el 25 de mayo de 1901.$$
  ),
  (
    'trivia-bank-002',
    $$¿En qué barrio nació River Plate antes de mudarse al norte de la Ciudad?$$,
    jsonb_build_array($$La Boca$$, $$Núñez$$, $$Palermo$$, $$Retiro$$),
    0,
    $$River nació en La Boca y recién décadas después se instaló definitivamente en Núñez.$$
  ),
  (
    'trivia-bank-003',
    $$¿Qué compra histórica ayudó a instalar el apodo “Millonario”?$$,
    jsonb_build_array($$Ángel Labruna$$, $$Bernabé Ferreyra$$, $$Amadeo Carrizo$$, $$Enzo Francescoli$$),
    1,
    $$La llegada de Bernabé Ferreyra en 1932 fue una transferencia récord para la época.$$
  ),
  (
    'trivia-bank-004',
    $$¿Cuál fue el primer campeonato profesional ganado por River?$$,
    jsonb_build_array($$1932$$, $$1936$$, $$1941$$, $$1945$$),
    0,
    $$River ganó el campeonato de Primera División de 1932.$$
  ),
  (
    'trivia-bank-005',
    $$¿Qué entrenador cortó la sequía local de River en 1975?$$,
    jsonb_build_array($$Ángel Labruna$$, $$Héctor Veira$$, $$Alfredo Di Stéfano$$, $$Américo Gallego$$),
    0,
    $$Ángel Labruna fue el técnico del River campeón del Metropolitano 1975.$$
  ),
  (
    'trivia-bank-006',
    $$¿Cuál de estos jugadores no integraba el quinteto clásico de La Máquina?$$,
    jsonb_build_array($$Juan Carlos Muñoz$$, $$José Manuel Moreno$$, $$Adolfo Pedernera$$, $$Norberto Alonso$$),
    3,
    $$El quinteto histórico fue Muñoz, Moreno, Pedernera, Labruna y Loustau.$$
  ),
  (
    'trivia-bank-007',
    $$¿Quién es el máximo goleador histórico de River?$$,
    jsonb_build_array($$Bernabé Ferreyra$$, $$Ángel Labruna$$, $$Oscar Más$$, $$Enzo Francescoli$$),
    1,
    $$Ángel Labruna es el máximo goleador histórico del club.$$
  ),
  (
    'trivia-bank-008',
    $$¿Qué arquero es considerado pionero por salir jugando y transformar el puesto en River?$$,
    jsonb_build_array($$Ubaldo Fillol$$, $$Amadeo Carrizo$$, $$Nery Pumpido$$, $$Germán Burgos$$),
    1,
    $$Amadeo Carrizo cambió la manera de interpretar el puesto de arquero.$$
  ),
  (
    'trivia-bank-009',
    $$¿Quién fue capitán de Argentina campeona del mundo en 1978 y símbolo de River?$$,
    jsonb_build_array($$Norberto Alonso$$, $$Daniel Passarella$$, $$Ubaldo Fillol$$, $$Leopoldo Luque$$),
    1,
    $$Daniel Passarella fue capitán de la Selección Argentina campeona del mundo en 1978.$$
  ),
  (
    'trivia-bank-010',
    $$¿Contra qué rival ganó River la Copa Libertadores 1986?$$,
    jsonb_build_array($$Peñarol$$, $$América de Cali$$, $$Olimpia$$, $$Nacional de Medellín$$),
    1,
    $$River venció a América de Cali en la final de 1986.$$
  ),
  (
    'trivia-bank-011',
    $$¿Quién dirigía a River en la Copa Libertadores 1986?$$,
    jsonb_build_array($$Héctor Veira$$, $$Ángel Labruna$$, $$Carlos Timoteo Griguol$$, $$Alfredo Di Stéfano$$),
    0,
    $$El Bambino Veira era el entrenador de aquel equipo.$$
  ),
  (
    'trivia-bank-012',
    $$¿Quién marcó el gol de River en la Intercontinental 1986 ante Steaua Bucarest?$$,
    jsonb_build_array($$Antonio Alzamendi$$, $$Norberto Alonso$$, $$Juan Gilberto Funes$$, $$Roque Alfaro$$),
    0,
    $$Alzamendi convirtió el gol de la victoria en Tokio.$$
  ),
  (
    'trivia-bank-013',
    $$¿Quién hizo los dos goles de River en la vuelta de la final de Libertadores 1996?$$,
    jsonb_build_array($$Ariel Ortega$$, $$Marcelo Salas$$, $$Hernán Crespo$$, $$Enzo Francescoli$$),
    2,
    $$Hernán Crespo marcó los dos goles ante América de Cali.$$
  ),
  (
    'trivia-bank-014',
    $$¿Quién era el técnico del River campeón de la Libertadores 1996?$$,
    jsonb_build_array($$Ramón Díaz$$, $$Daniel Passarella$$, $$Américo Gallego$$, $$Héctor Veira$$),
    0,
    $$Ramón Díaz condujo a River al título continental de 1996.$$
  ),
  (
    'trivia-bank-015',
    $$¿Qué club fue rival de River en la final de la Libertadores 2015?$$,
    jsonb_build_array($$Tigres$$, $$Cruz Azul$$, $$América$$, $$Monterrey$$),
    0,
    $$River venció a Tigres en la final de 2015.$$
  ),
  (
    'trivia-bank-016',
    $$¿Quién abrió el marcador en la final de vuelta de la Libertadores 2015?$$,
    jsonb_build_array($$Lucas Alario$$, $$Carlos Sánchez$$, $$Ramiro Funes Mori$$, $$Rodrigo Mora$$),
    0,
    $$Lucas Alario hizo el primer gol en el Monumental.$$
  ),
  (
    'trivia-bank-017',
    $$¿Quién convirtió de penal en la final de vuelta de la Libertadores 2015?$$,
    jsonb_build_array($$Leonardo Ponzio$$, $$Carlos Sánchez$$, $$Ariel Rojas$$, $$Matías Kranevitter$$),
    1,
    $$Carlos Sánchez marcó el segundo gol de River desde el punto penal.$$
  ),
  (
    'trivia-bank-018',
    $$¿Qué defensor marcó el 3-0 ante Tigres en la final de Libertadores 2015?$$,
    jsonb_build_array($$Jonatan Maidana$$, $$Ramiro Funes Mori$$, $$Gabriel Mercado$$, $$Éder Álvarez Balanta$$),
    1,
    $$Ramiro Funes Mori hizo el tercer gol de cabeza.$$
  ),
  (
    'trivia-bank-019',
    $$¿Qué rival eliminó River en semifinales de la Copa Sudamericana 2014?$$,
    jsonb_build_array($$Boca Juniors$$, $$Estudiantes$$, $$Atlético Nacional$$, $$Libertad$$),
    0,
    $$River eliminó a Boca y luego fue campeón ante Atlético Nacional.$$
  ),
  (
    'trivia-bank-020',
    $$¿Quién atajó el penal de Gigliotti en la semifinal de la Sudamericana 2014?$$,
    jsonb_build_array($$Franco Armani$$, $$Marcelo Barovero$$, $$Germán Lux$$, $$Juan Pablo Carrizo$$),
    1,
    $$Marcelo Barovero atajó ese penal en el inicio del partido.$$
  ),
  (
    'trivia-bank-021',
    $$¿Quién hizo el gol de River en la ida de la semifinal de Libertadores 2015 ante Guaraní?$$,
    jsonb_build_array($$Gabriel Mercado$$, $$Lucas Alario$$, $$Rodrigo Mora$$, $$Leonardo Pisculichi$$),
    0,
    $$Gabriel Mercado marcó en el 2-0 de ida en el Monumental.$$
  ),
  (
    'trivia-bank-022',
    $$¿Qué equipo eliminó River con un 3-0 en Brasil en la Libertadores 2015?$$,
    jsonb_build_array($$Cruzeiro$$, $$São Paulo$$, $$Internacional$$, $$Corinthians$$),
    0,
    $$River goleó 3-0 a Cruzeiro en Belo Horizonte.$$
  ),
  (
    'trivia-bank-023',
    $$¿Cuál fue el resultado de la ida de la final Libertadores 2018 en La Bombonera?$$,
    jsonb_build_array($$1-1$$, $$2-2$$, $$0-0$$, $$2-1 para Boca$$),
    1,
    $$La ida terminó 2-2.$$
  ),
  (
    'trivia-bank-024',
    $$¿Quién hizo el gol del 2-1 para River en la final de Madrid 2018?$$,
    jsonb_build_array($$Lucas Pratto$$, $$Juan Fernando Quintero$$, $$Gonzalo Martínez$$, $$Nacho Fernández$$),
    1,
    $$Juanfer Quintero marcó el 2-1 en el alargue.$$
  ),
  (
    'trivia-bank-025',
    $$¿Quién convirtió el tercer gol de River en Madrid 2018?$$,
    jsonb_build_array($$Gonzalo Martínez$$, $$Rafael Santos Borré$$, $$Lucas Pratto$$, $$Exequiel Palacios$$),
    0,
    $$El Pity Martínez selló el 3-1 con el arco vacío.$$
  ),
  (
    'trivia-bank-026',
    $$¿Qué estadio fue sede de la final de vuelta de la Libertadores 2018?$$,
    jsonb_build_array($$Santiago Bernabéu$$, $$Camp Nou$$, $$Wembley$$, $$Metropolitano de Madrid$$),
    0,
    $$La final se jugó en el Santiago Bernabéu.$$
  ),
  (
    'trivia-bank-027',
    $$¿Quién dirigía a River en la final de Madrid 2018?$$,
    jsonb_build_array($$Marcelo Gallardo$$, $$Ramón Díaz$$, $$Matías Almeyda$$, $$Leonardo Astrada$$),
    0,
    $$Marcelo Gallardo fue el entrenador del ciclo más ganador internacionalmente.$$
  ),
  (
    'trivia-bank-028',
    $$¿Qué jugador de River hizo un gol a Boca en la ida de la final Libertadores 2018?$$,
    jsonb_build_array($$Lucas Pratto$$, $$Ignacio Fernández$$, $$Rafael Santos Borré$$, $$Gonzalo Martínez$$),
    0,
    $$Lucas Pratto convirtió el 1-1 parcial en La Bombonera.$$
  ),
  (
    'trivia-bank-029',
    $$¿Quién convirtió el gol de River en la final de la Recopa Sudamericana 2016 ante Santa Fe en el Monumental?$$,
    jsonb_build_array($$Sebastián Driussi$$, $$Lucas Alario$$, $$Rodrigo Mora$$, $$Gonzalo Martínez$$),
    0,
    $$Sebastián Driussi marcó el gol del triunfo en la vuelta.$$
  ),
  (
    'trivia-bank-030',
    $$¿Qué competición ganó River en 2014 ante Atlético Nacional?$$,
    jsonb_build_array($$Copa Sudamericana$$, $$Recopa Sudamericana$$, $$Copa Suruga Bank$$, $$Supercopa Argentina$$),
    0,
    $$River ganó la Copa Sudamericana 2014.$$
  ),
  (
    'trivia-bank-031',
    $$¿Qué dupla marcó los goles de River en la final de vuelta de la Sudamericana 2014?$$,
    jsonb_build_array($$Mercado y Pezzella$$, $$Pisculichi y Mora$$, $$Sánchez y Teo Gutiérrez$$, $$Vangioni y Funes Mori$$),
    0,
    $$Gabriel Mercado y Germán Pezzella convirtieron en el Monumental.$$
  ),
  (
    'trivia-bank-032',
    $$¿Qué futbolista uruguayo fue figura e ídolo de River en los años 80 y 90?$$,
    jsonb_build_array($$Rubén Sosa$$, $$Enzo Francescoli$$, $$Antonio Alzamendi$$, $$Pablo Bengoechea$$),
    1,
    $$Enzo Francescoli es uno de los grandes ídolos modernos de River.$$
  ),
  (
    'trivia-bank-033',
    $$¿Qué delantero chileno fue campeón con River y conocido como “El Matador”?$$,
    jsonb_build_array($$Iván Zamorano$$, $$Marcelo Salas$$, $$Alexis Sánchez$$, $$Humberto Suazo$$),
    1,
    $$Marcelo Salas fue una de las figuras del River de fines de los 90.$$
  ),
  (
    'trivia-bank-034',
    $$¿Qué entrenador condujo a River en el regreso a Primera en 2012?$$,
    jsonb_build_array($$Ramón Díaz$$, $$Matías Almeyda$$, $$Marcelo Gallardo$$, $$Leonardo Astrada$$),
    1,
    $$Matías Almeyda fue el técnico del ascenso en 2012.$$
  ),
  (
    'trivia-bank-035',
    $$¿Cuál de estos jugadores surgidos de River fue campeón del mundo con Argentina en 2022?$$,
    jsonb_build_array($$Julián Álvarez$$, $$Lucas Beltrán$$, $$Facundo Colidio$$, $$Enzo Pérez$$),
    0,
    $$Julián Álvarez se formó en River y fue campeón mundial en Qatar 2022.$$
  ),
  (
    'trivia-bank-036',
    $$¿Quién era el arquero titular de River en la final de Madrid 2018?$$,
    jsonb_build_array($$Franco Armani$$, $$Marcelo Barovero$$, $$Germán Lux$$, $$Enrique Bologna$$),
    0,
    $$Franco Armani fue titular en la final del Bernabéu.$$
  ),
  (
    'trivia-bank-037',
    $$¿Qué defensor de River participó en la jugada que terminó en el segundo gol millonario de la ida de la final Libertadores 2018?$$,
    jsonb_build_array($$Lucas Martínez Quarta$$, $$Javier Pinola$$, $$Jonatan Maidana$$, $$Milton Casco$$),
    1,
    $$Javier Pinola forzó el empate 2-2 con una jugada que terminó en gol en contra de Izquierdoz.$$
  ),
  (
    'trivia-bank-038',
    $$¿Qué jugador colombiano fue clave en River y convirtió en la final de Madrid 2018?$$,
    jsonb_build_array($$Juan Fernando Quintero$$, $$Rafael Santos Borré$$, $$Teófilo Gutiérrez$$, $$Radamel Falcao$$),
    0,
    $$Juan Fernando Quintero hizo el gol del 2-1.$$
  ),
  (
    'trivia-bank-039',
    $$¿Qué delantero colombiano hizo el primer gol de River en la vuelta de Madrid 2018?$$,
    jsonb_build_array($$Rafael Santos Borré$$, $$Teófilo Gutiérrez$$, $$Miguel Borja$$, $$Radamel Falcao$$),
    0,
    $$Borré marcó el 1-1 tras asistencia de Pratto.$$
  ),
  (
    'trivia-bank-040',
    $$¿Qué mediocampista fue expulsado en Boca durante la final de Madrid 2018?$$,
    jsonb_build_array($$Wilmar Barrios$$, $$Pablo Pérez$$, $$Nahitan Nández$$, $$Fernando Gago$$),
    0,
    $$Wilmar Barrios fue expulsado en el alargue.$$
  ),
  (
    'trivia-bank-041',
    $$¿Qué camiseta usó históricamente Enzo Francescoli en River?$$,
    jsonb_build_array($$7$$, $$9$$, $$10$$, $$11$$),
    2,
    $$El Enzo quedó asociado al número 10.$$
  ),
  (
    'trivia-bank-042',
    $$¿Qué delantero surgido de River brilló en Mónaco y la Selección Colombia?$$,
    jsonb_build_array($$Radamel Falcao$$, $$Teófilo Gutiérrez$$, $$Juan Pablo Ángel$$, $$Rafael Santos Borré$$),
    0,
    $$Radamel Falcao García surgió de River.$$
  ),
  (
    'trivia-bank-043',
    $$¿Qué lateral izquierdo fue titular en el River campeón de Libertadores 2015?$$,
    jsonb_build_array($$Leonel Vangioni$$, $$Milton Casco$$, $$Ariel Rojas$$, $$Camilo Mayada$$),
    0,
    $$Leonel Vangioni fue una pieza importante en ese equipo.$$
  ),
  (
    'trivia-bank-044',
    $$¿Quién fue el capitán de River en buena parte del ciclo Gallardo campeón internacional?$$,
    jsonb_build_array($$Leonardo Ponzio$$, $$Enzo Pérez$$, $$Jonatan Maidana$$, $$Marcelo Barovero$$),
    0,
    $$Leonardo Ponzio fue uno de los líderes del ciclo.$$
  ),
  (
    'trivia-bank-045',
    $$¿Qué equipo venció River en la final de la Copa Argentina 2016?$$,
    jsonb_build_array($$Rosario Central$$, $$Atlético Tucumán$$, $$Central Córdoba$$, $$Racing$$),
    0,
    $$River le ganó a Rosario Central en una final histórica.$$
  ),
  (
    'trivia-bank-046',
    $$¿Quién marcó tres goles para River en la final de Copa Argentina 2016?$$,
    jsonb_build_array($$Lucas Alario$$, $$Sebastián Driussi$$, $$Rodrigo Mora$$, $$Gonzalo Martínez$$),
    0,
    $$Lucas Alario hizo tres goles ante Rosario Central.$$
  ),
  (
    'trivia-bank-047',
    $$¿Qué rival enfrentó River en la final de Copa Argentina 2017?$$,
    jsonb_build_array($$Atlético Tucumán$$, $$Rosario Central$$, $$Central Córdoba$$, $$Gimnasia La Plata$$),
    0,
    $$River venció a Atlético Tucumán en Mendoza.$$
  ),
  (
    'trivia-bank-048',
    $$¿Contra qué rival ganó River la final de Copa Argentina 2019?$$,
    jsonb_build_array($$Central Córdoba$$, $$Atlético Tucumán$$, $$Rosario Central$$, $$Talleres$$),
    0,
    $$River venció 3-0 a Central Córdoba de Santiago del Estero.$$
  ),
  (
    'trivia-bank-049',
    $$¿Qué técnico de River fue apodado “El Pelado” y ganó múltiples títulos locales?$$,
    jsonb_build_array($$Ramón Díaz$$, $$Américo Gallego$$, $$Daniel Passarella$$, $$Matías Almeyda$$),
    0,
    $$Ramón Díaz es uno de los entrenadores más ganadores de la historia del club.$$
  ),
  (
    'trivia-bank-050',
    $$¿Qué jugador marcó el gol de tiro libre ante Boca en la ida de la semifinal Sudamericana 2014?$$,
    jsonb_build_array($$Leonardo Pisculichi$$, $$Gonzalo Martínez$$, $$Carlos Sánchez$$, $$Rodrigo Mora$$),
    0,
    $$Pisculichi convirtió el gol decisivo de la serie en el Monumental.$$
  ),
  (
    'trivia-bank-051',
    $$¿Qué jugador convirtió el gol de River en el triunfo 1-0 ante Boca por la Supercopa Argentina 2018?$$,
    jsonb_build_array($$Gonzalo Martínez$$, $$Nacho Scocco$$, $$Lucas Pratto$$, $$Juan Fernando Quintero$$),
    0,
    $$El Pity Martínez abrió el marcador de penal en Mendoza.$$
  ),
  (
    'trivia-bank-052',
    $$¿Quién hizo el segundo gol de River en la Supercopa Argentina 2018 ante Boca?$$,
    jsonb_build_array($$Ignacio Scocco$$, $$Lucas Pratto$$, $$Rafael Santos Borré$$, $$Juan Fernando Quintero$$),
    0,
    $$Nacho Scocco marcó el 2-0 definitivo.$$
  ),
  (
    'trivia-bank-053',
    $$¿Qué arquero fue titular en River en la final de la Supercopa Argentina 2019 ante Racing?$$,
    jsonb_build_array($$Franco Armani$$, $$Germán Lux$$, $$Enrique Bologna$$, $$Augusto Batalla$$),
    0,
    $$Franco Armani fue titular en el 5-0 ante Racing.$$
  ),
  (
    'trivia-bank-054',
    $$¿Qué defensor central volvió a River en 2024 tras jugar en Europa y ser campeón del mundo?$$,
    jsonb_build_array($$Germán Pezzella$$, $$Ramiro Funes Mori$$, $$Lucas Martínez Quarta$$, $$Nicolás Otamendi$$),
    0,
    $$Germán Pezzella regresó a River después de su etapa europea.$$
  ),
  (
    'trivia-bank-055',
    $$¿Qué lateral campeón del mundo con Argentina llegó a River en 2024?$$,
    jsonb_build_array($$Marcos Acuña$$, $$Nicolás Tagliafico$$, $$Gonzalo Montiel$$, $$Nahuel Molina$$),
    0,
    $$Marcos Acuña se incorporó a River en 2024.$$
  ),
  (
    'trivia-bank-056',
    $$¿Qué defensor surgido de River volvió al club en 2025 tras ganar el Mundial con Argentina?$$,
    jsonb_build_array($$Gonzalo Montiel$$, $$Lucas Martínez Quarta$$, $$Germán Pezzella$$, $$Facundo Medina$$),
    0,
    $$Gonzalo Montiel regresó a River luego de su etapa en Europa.$$
  ),
  (
    'trivia-bank-057',
    $$¿Qué delantero colombiano llegó a River desde Junior de Barranquilla?$$,
    jsonb_build_array($$Miguel Borja$$, $$Rafael Santos Borré$$, $$Teófilo Gutiérrez$$, $$Radamel Falcao$$),
    0,
    $$Miguel Borja llegó a River desde Junior.$$
  ),
  (
    'trivia-bank-058',
    $$¿Qué mediocampista surgido de River fue campeón del mundo con Argentina en 2022 y jugó en Bayer Leverkusen?$$,
    jsonb_build_array($$Exequiel Palacios$$, $$Enzo Pérez$$, $$Guido Rodríguez$$, $$Rodrigo De Paul$$),
    0,
    $$Exequiel Palacios se formó en River y fue parte de la Selección campeona en Qatar 2022.$$
  ),
  (
    'trivia-bank-059',
    $$¿Qué futbolista surgido de River fue vendido al Manchester City?$$,
    jsonb_build_array($$Julián Álvarez$$, $$Enzo Fernández$$, $$Exequiel Palacios$$, $$Lucas Beltrán$$),
    0,
    $$Julián Álvarez pasó de River al Manchester City.$$
  ),
  (
    'trivia-bank-060',
    $$¿Qué mediocampista surgido de River fue campeón del mundo en Qatar 2022 y jugó en Benfica?$$,
    jsonb_build_array($$Enzo Fernández$$, $$Exequiel Palacios$$, $$Guido Rodríguez$$, $$Nicolás Domínguez$$),
    0,
    $$Enzo Fernández se formó en River y luego jugó en Benfica antes de Chelsea.$$
  )
on conflict (id) do update set
  question = excluded.question,
  options = excluded.options,
  correct_index = excluded.correct_index,
  explanation = excluded.explanation;
