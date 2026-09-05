update public.squad_players
set from_academy = false,
    verified_at = now()
where id = 'player-otamendi';
