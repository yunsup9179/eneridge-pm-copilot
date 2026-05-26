-- Step 7 Project Financials.
-- Additive-only migration for MVP project financial tracking.

create table if not exists public.project_financials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  estimated_total_cost numeric,
  actual_total_cost numeric,
  equipment_cost numeric,
  installation_cost numeric,
  utility_cost numeric,
  soft_cost numeric,
  rebate_applicable boolean default false,
  rebate_program text,
  rebate_amount numeric,
  grant_amount numeric,
  match_share_amount numeric,
  customer_contribution numeric,
  eneridge_out_of_pocket numeric,
  reimbursement_status text,
  reimbursement_received numeric,
  retention_amount numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists project_financials_project_id_idx
  on public.project_financials(project_id);

drop trigger if exists set_project_financials_updated_at on public.project_financials;
create trigger set_project_financials_updated_at
  before update on public.project_financials
  for each row
  execute function public.set_updated_at();

alter table public.project_financials enable row level security;

drop policy if exists "Allow anon CRUD on project_financials" on public.project_financials;
create policy "Allow anon CRUD on project_financials"
  on public.project_financials
  for all
  to anon
  using (true)
  with check (true);
