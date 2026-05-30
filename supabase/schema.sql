-- Scramble Cook — Supabase schema
-- Run this once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists households (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  created_at timestamptz default now()
);

create table if not exists recipes (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,  -- null = global/built-in
  recipe_id    text not null,
  data         jsonb not null,
  created_at   timestamptz default now(),
  unique (household_id, recipe_id)
);

create table if not exists week_state (
  household_id          uuid primary key references households(id) on delete cascade,
  current_week          jsonb,
  week_history          jsonb,
  favourites            jsonb,
  shopping_list_checked jsonb,
  last_writer           text,
  updated_at            timestamptz default now()
);

-- Row Level Security.
-- Note: with the shared-code model there is no per-user auth, so these policies
-- are permissive for the anon role. The security boundary is the unguessable
-- household id/code known only to the two partners. Acceptable for a 2-person app.
alter table households enable row level security;
alter table recipes    enable row level security;
alter table week_state enable row level security;

create policy "households anon all" on households
  for all to anon using (true) with check (true);

create policy "recipes anon all" on recipes
  for all to anon using (true) with check (true);

create policy "week_state anon all" on week_state
  for all to anon using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table week_state;
alter publication supabase_realtime add table recipes;
