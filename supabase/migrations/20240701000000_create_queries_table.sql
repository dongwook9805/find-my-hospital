create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  symptom text not null,
  departments jsonb not null
);

create index if not exists queries_created_at_idx on public.queries (created_at desc);
-- store symptom trigram index for fuzzy analytics; requires pg_trgm
create index if not exists queries_symptom_idx on public.queries using gin (symptom gin_trgm_ops);
