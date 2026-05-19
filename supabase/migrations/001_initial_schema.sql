-- =============================================================================
-- Planka ↔ Supabase mirror — initial schema
-- =============================================================================
-- Quando algo é criado/alterado no Planka (cards, formulários, movimentos),
-- escrevemos também aqui. O Planka segue sendo a aplicação primária; este
-- banco existe pra consumo por n8n, Streamlit e quaisquer outras integrações.
--
-- Como aplicar: cole este arquivo no Supabase Dashboard → SQL Editor → Run.
-- (ou rode via Supabase CLI:  supabase db push)
-- =============================================================================

-- --- Form submissions (snapshot do payload que veio do form público) -----------
create table if not exists public.form_submissions (
  id              uuid primary key default gen_random_uuid(),
  form_type       text not null check (form_type in ('design', 'chamado')),
  payload         jsonb not null,
  planka_card_id  text,        -- id do card criado no Planka (string p/ caber bigint)
  os_number       text,        -- número de OS gerado (só p/ chamado)
  status          text not null default 'created',
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists form_submissions_form_type_idx
  on public.form_submissions (form_type);
create index if not exists form_submissions_created_at_idx
  on public.form_submissions (created_at desc);
create index if not exists form_submissions_planka_card_id_idx
  on public.form_submissions (planka_card_id);

-- --- Cards (espelho do estado atual de cada card no Planka) -------------------
create table if not exists public.cards (
  planka_id        text primary key,
  board_id         text,
  list_id          text,
  project_name     text,
  board_name       text,
  list_name        text,
  list_type        text,
  name             text,
  description      text,
  position         double precision,
  is_closed        boolean default false,
  finalized_at     timestamptz,
  prev_list_id     text,
  labels           jsonb not null default '[]'::jsonb,
  custom_fields    jsonb not null default '{}'::jsonb,
  creator_user_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index if not exists cards_board_id_idx     on public.cards (board_id);
create index if not exists cards_list_id_idx      on public.cards (list_id);
create index if not exists cards_updated_at_idx   on public.cards (updated_at desc);
create index if not exists cards_finalized_at_idx on public.cards (finalized_at desc);

-- --- Card events (timeline: create, move, update, label add/remove, ...) ------
create table if not exists public.card_events (
  id              uuid primary key default gen_random_uuid(),
  planka_card_id  text not null,
  event_type      text not null,
  data            jsonb not null default '{}'::jsonb,
  user_email      text,
  user_id         text,
  created_at      timestamptz not null default now()
);

create index if not exists card_events_card_idx
  on public.card_events (planka_card_id, created_at desc);
create index if not exists card_events_type_idx
  on public.card_events (event_type, created_at desc);

-- --- Auto-bump de updated_at ---------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- --- RLS desligado por enquanto (acesso só via service_role) -----------------
-- O Planka e o ticket-form escrevem usando a chave secret, que bypassa RLS.
-- Quando expor pra streamlit/n8n com chaves diferentes, criar políticas.
alter table public.form_submissions disable row level security;
alter table public.cards disable row level security;
alter table public.card_events disable row level security;
