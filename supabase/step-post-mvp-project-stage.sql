alter table public.projects
  add column if not exists project_stage text;
