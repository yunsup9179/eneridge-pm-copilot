-- Step 5 Documents Storage setup.
-- Additive-only migration for the MVP document upload workflow.

insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

drop policy if exists "Allow anon CRUD on project-documents objects" on storage.objects;
create policy "Allow anon CRUD on project-documents objects"
  on storage.objects
  for all
  to anon
  using (bucket_id = 'project-documents')
  with check (bucket_id = 'project-documents');
