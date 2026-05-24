
create table if not exists public.project_charger_groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  charger_model text,
  charger_category text,
  power_rating_kw numeric,
  charger_count integer,
  port_count integer,
  port_configuration text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists project_charger_groups_project_id_idx
  on public.project_charger_groups(project_id);

drop trigger if exists set_project_charger_groups_updated_at on public.project_charger_groups;
create trigger set_project_charger_groups_updated_at
  before update on public.project_charger_groups
  for each row
  execute function public.set_updated_at();

create table if not exists public.project_charger_connectors (
  id uuid primary key default gen_random_uuid(),
  charger_group_id uuid references public.project_charger_groups(id) on delete cascade,
  connector_type text,
  connector_count_per_charger integer,
  total_connector_count integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists project_charger_connectors_charger_group_id_idx
  on public.project_charger_connectors(charger_group_id);

drop trigger if exists set_project_charger_connectors_updated_at on public.project_charger_connectors;
create trigger set_project_charger_connectors_updated_at
  before update on public.project_charger_connectors
  for each row
  execute function public.set_updated_at();

-- Development RLS policies for the browser-based MVP.
-- Keep or replace these depending on the live project's current RLS posture.
alter table public.project_charger_groups enable row level security;
alter table public.project_charger_connectors enable row level security;

drop policy if exists "Allow anon CRUD on project_charger_groups" on public.project_charger_groups;
create policy "Allow anon CRUD on project_charger_groups"
  on public.project_charger_groups
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on project_charger_connectors" on public.project_charger_connectors;
create policy "Allow anon CRUD on project_charger_connectors"
  on public.project_charger_connectors
  for all
  to anon
  using (true)
  with check (true);
