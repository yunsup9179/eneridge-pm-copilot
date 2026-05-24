-- Development RLS policies for the browser-based MVP.
-- These allow the public anon key to perform CRUD until authentication is added.
-- Replace these policies with user/team-scoped access rules before production use.

alter table public.projects enable row level security;
alter table public.action_items enable row level security;
alter table public.risks enable row level security;
alter table public.contacts enable row level security;
alter table public.documents enable row level security;
alter table public.ai_analysis_logs enable row level security;
alter table public.project_contacts enable row level security;
alter table public.project_charger_groups enable row level security;
alter table public.project_charger_connectors enable row level security;

drop policy if exists "Allow anon CRUD on projects" on public.projects;
create policy "Allow anon CRUD on projects"
  on public.projects
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on action_items" on public.action_items;
create policy "Allow anon CRUD on action_items"
  on public.action_items
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on risks" on public.risks;
create policy "Allow anon CRUD on risks"
  on public.risks
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on contacts" on public.contacts;
create policy "Allow anon CRUD on contacts"
  on public.contacts
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on documents" on public.documents;
create policy "Allow anon CRUD on documents"
  on public.documents
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on ai_analysis_logs" on public.ai_analysis_logs;
create policy "Allow anon CRUD on ai_analysis_logs"
  on public.ai_analysis_logs
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anon CRUD on project_contacts" on public.project_contacts;
create policy "Allow anon CRUD on project_contacts"
  on public.project_contacts
  for all
  to anon
  using (true)
  with check (true);

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
