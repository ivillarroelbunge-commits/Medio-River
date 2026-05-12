update public.matches
set
  status = 'played',
  river_score = 2,
  opponent_score = 2,
  detail = $json${
    "sourceLabel": "Medio River",
    "referee": "Sin dato",
    "resultNote": "",
    "wentToExtraTime": true,
    "penaltyShootout": {
      "river": 4,
      "opponent": 3,
      "winner": "river",
      "kicks": {
        "river": [
          { "player": "Juan Fernando Quintero", "scored": true },
          { "player": "Giuliano Galoppo", "scored": false },
          { "player": "Maximiliano Salas", "scored": true },
          { "player": "Kendry Páez", "scored": false },
          { "player": "Gonzalo Montiel", "scored": true },
          { "player": "Joaquín Freitas", "scored": true }
        ],
        "opponent": [
          { "player": "Insaurralde", "scored": true },
          { "player": "Corujo", "scored": true },
          { "player": "Erazo", "scored": true },
          { "player": "Rodríguez", "scored": false },
          { "player": "Perruzzi", "scored": false },
          { "player": "De Ritis", "scored": false }
        ]
      }
    },
    "goals": [],
    "cards": [],
    "substitutions": [],
    "lineups": {
      "river": {
        "coach": "Marcelo Gallardo",
        "starters": [],
        "substitutes": []
      },
      "opponent": {
        "coach": "Sin dato",
        "starters": [],
        "substitutes": []
      }
    }
  }$json$::jsonb,
  updated_at = timezone('utc', now())
where id = 'match-25';
