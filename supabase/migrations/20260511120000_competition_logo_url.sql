-- Brand mark for printed results etc. (uploaded to competition-posters bucket alongside poster).
alter table public.competitions
  add column if not exists logo_url text;

comment on column public.competitions.logo_url is 'Optional logo URL (storage); used on printed public results. Poster remains for marketing / TV idle.';
