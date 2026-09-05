update public.squad_players set fotmob_id = case id
  when 'player-francisco-ortega' then 902969
  when 'player-otamendi' then 174321
  when 'player-mauro-arambarri' then 625340
  when 'player-thiago-almada' then 955271
  when 'player-tobias-andrada' then 1761527
  when 'player-angel-correa' then 432950
  when 'player-lucas-beltran' then 974755
  when 'player-rafael-borre' then 533775
  else fotmob_id end
where id in (
  'player-francisco-ortega',
  'player-otamendi',
  'player-mauro-arambarri',
  'player-thiago-almada',
  'player-tobias-andrada',
  'player-angel-correa',
  'player-lucas-beltran',
  'player-rafael-borre'
);
