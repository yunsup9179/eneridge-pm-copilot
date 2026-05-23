create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  customer text,
  city text,
  utility text,
  program text,
  charger_type text,
  port_count integer,
  phase text,
  status text,
  priority text,
  target_construction_start date,
  target_cod date,
  internal_owner text,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  notes text,
  communication_style text,
  last_contacted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  file_name text not null,
  file_type text,
  document_type text,
  version text,
  storage_path text,
  storage_url text,
  status text,
  ai_summary text,
  key_terms jsonb,
  action_items_extracted jsonb,
  risks_extracted jsonb,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  assigned_to text,
  external_party text,
  due_date date,
  follow_up_date date,
  priority text,
  status text,
  source_type text,
  source_reference text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  category text,
  description text not null,
  impact text,
  likelihood text,
  severity text,
  mitigation_plan text,
  owner text,
  status text,
  related_document_id uuid references public.documents(id) on delete set null,
  ai_detected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_analysis_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  agent_type text,
  input_type text,
  input_content text,
  output jsonb,
  confidence numeric,
  user_approved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.project_contacts (
  project_id uuid references public.projects(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  relationship_type text,
  primary key (project_id, contact_id)
);

create index if not exists action_items_project_id_idx
  on public.action_items(project_id);

create index if not exists risks_project_id_idx
  on public.risks(project_id);

create index if not exists risks_related_document_id_idx
  on public.risks(related_document_id);

create index if not exists documents_project_id_idx
  on public.documents(project_id);

create index if not exists ai_analysis_logs_project_id_idx
  on public.ai_analysis_logs(project_id);

create index if not exists ai_analysis_logs_document_id_idx
  on public.ai_analysis_logs(document_id);

create index if not exists project_contacts_contact_id_idx
  on public.project_contacts(contact_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_action_items_updated_at on public.action_items;
create trigger set_action_items_updated_at
  before update on public.action_items
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_risks_updated_at on public.risks;
create trigger set_risks_updated_at
  before update on public.risks
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
  before update on public.contacts
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row
  execute function public.set_updated_at();
