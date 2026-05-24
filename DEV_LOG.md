# Development Log

## Step 3: Projects CRUD

### What Was Implemented

- Implemented live Supabase CRUD for `projects`.
- Added a project data access layer with `getProjects`, `getProjectById`, `createProject`, `updateProject`, and `deleteProject`.
- Updated the project register to load projects from Supabase with loading, empty, error, and missing-configuration states.
- Added a project creation workflow using a shadcn-style sheet form.
- Updated the project detail page to load a project from Supabase.
- Added project edit and delete workflows with confirmation for delete.
- Kept action items, risks, documents, contacts, AI features, authentication, and RLS out of scope.

### Files Created

- `src/lib/data/projects.ts`
- `src/components/projects/projects-client.tsx`
- `src/components/projects/project-detail-client.tsx`
- `src/components/projects/project-form.tsx`
- `src/components/projects/project-form-sheet.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/textarea.tsx`

### Files Modified

- `src/app/projects/page.tsx`
- `src/app/projects/[id]/page.tsx`
- `src/lib/supabase/client.ts`
- `README.md`

### Verification Results

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed for the project register, create form drawer, and project detail fallback state.

### Known Issues Fixed

- Confirmed `src/lib/supabase/client.ts` uses a single missing-configuration error path:
  `throw new Error(getSupabaseConfigMessage())`.
- Confirmed `getSupabaseConfigMessage()` remains the single source for the missing Supabase configuration message.
- Confirmed the old top-level `tasks`, `team`, and `timeline` route files are no longer present.

### Next Recommended Task

- Implement Action Items CRUD connected to projects, then implement Risks CRUD connected to projects and documents.

## Step 4A: Action Items CRUD - 2026-05-23

### Objective

Implement live Supabase CRUD for project-linked action items while keeping the scope limited to the `action_items` table.

### Summary of Implementation

- Added a typed data access layer for action items.
- Replaced the global `/actions` placeholder with a live action item register.
- Added create, edit, complete, and delete workflows for action items.
- Added simple status and priority filters on the global action items page.
- Added project-scoped action items to the project detail page.
- Added a locked project action item form flow on project detail pages.
- Kept risks, documents, contacts, AI features, authentication, and RLS out of scope.
- No database schema changes were required.

### Files Created

- `src/lib/data/action-items.ts`
- `src/components/action-items/action-item-card.tsx`
- `src/components/action-items/action-item-form.tsx`
- `src/components/action-items/action-item-form-sheet.tsx`
- `src/components/action-items/action-item-options.ts`
- `src/components/action-items/action-items-client.tsx`
- `src/components/action-items/project-action-items.tsx`
- `src/components/ui/select.tsx`

### Files Modified

- `src/app/actions/page.tsx`
- `src/components/projects/project-detail-client.tsx`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/actions`
- `/projects/[id]`

### Database Tables Affected

- `action_items`
- `projects` is read to display related project names and to populate project selectors.

### Components Added Or Changed

- Added reusable action item form and sheet components.
- Added reusable action item card component.
- Added global `ActionItemsClient`.
- Added project-scoped `ProjectActionItems`.
- Updated project detail to show live action items instead of an Action Items placeholder card.

### Data Access Functions Added Or Changed

- `getActionItems()`
- `getActionItemsByProjectId(projectId: string)`
- `getActionItemById(id: string)`
- `createActionItem(input)`
- `updateActionItem(id, input)`
- `deleteActionItem(id)`
- `completeActionItem(id)`

### Validation Performed

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed for `/actions`, including the page title, New Action Item entry point, status filter, priority filter, and action item CRUD labels or empty/error states.
- Project detail scoped action item UI was covered by build verification; browser verification requires at least one live project row in Supabase.

### Known Issues Or Limitations

- Action items rely on the existing public Supabase anon client; authentication and RLS are still not implemented.
- Global action item project names are resolved with a separate projects query instead of a generated typed Supabase join.
- Creating action items requires at least one project row because action items are project-centered.
- No overdue indicators or dashboard rollups were added in this step.

### Recommended Next Task

- Implement Risks CRUD connected to projects and documents.

## Step 4B: Risks CRUD - 2026-05-23

### Objective

Implement live Supabase CRUD for project-linked risks while keeping the scope limited to the `risks` table.

### Summary of Implementation

- Added a typed data access layer for risks.
- Replaced the global `/risks` placeholder with a live risk register.
- Added create, edit, close, and delete workflows for risks.
- Added severity and status filters on the global risks page.
- Added project-scoped risks to the project detail page.
- Added a locked project risk form flow on project detail pages.
- Kept documents, contacts, AI features, authentication, and RLS out of scope.
- No database schema changes were required.

### Files Created

- `src/lib/data/risks.ts`
- `src/components/risks/risk-card.tsx`
- `src/components/risks/risk-form.tsx`
- `src/components/risks/risk-form-sheet.tsx`
- `src/components/risks/risk-options.ts`
- `src/components/risks/risks-client.tsx`
- `src/components/risks/project-risks.tsx`
- `src/components/ui/checkbox.tsx`

### Files Modified

- `src/app/risks/page.tsx`
- `src/components/projects/project-detail-client.tsx`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/risks`
- `/projects/[id]`

### Database Tables Affected

- `risks`
- `projects` is read to display related project names and to populate project selectors.

### Components Added Or Changed

- Added reusable risk form and sheet components.
- Added reusable risk card component.
- Added global `RisksClient`.
- Added project-scoped `ProjectRisks`.
- Updated project detail to show live risks instead of a Risks placeholder card.

### Data Access Functions Added Or Changed

- `getRisks()`
- `getRisksByProjectId(projectId: string)`
- `getRiskById(id: string)`
- `createRisk(input)`
- `updateRisk(id, input)`
- `deleteRisk(id)`
- `closeRisk(id)`

### Validation Performed

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification passed for `/risks`, including the page title, New Risk entry point, severity filter, status filter, and empty state.
- Project detail scoped risk UI was covered by build verification; browser verification requires at least one live project row in Supabase.

### Known Issues Or Limitations

- Risks rely on the existing public Supabase anon client; authentication and RLS are still not implemented.
- Global risk project names are resolved with a separate projects query instead of a generated typed Supabase join.
- Creating risks requires at least one project row because risks are project-centered.
- `related_document_id` is intentionally omitted from the form until Documents CRUD exists.
- No dashboard rollups for active or critical risks were added in this step.

### Recommended Next Task

- Implement Documents CRUD and file upload support, then connect risk records to related documents.

## Step 4C: Project Charger Groups and Connector Details - 2026-05-23

### Objective

Add project-level charger group management and connector detail management while preserving projects as the parent entity and keeping existing project charger summary fields as legacy/general fields.

### Summary of Implementation

- Added two additive Supabase tables for charger configurations and connector rows.
- Added typed Supabase table stubs for `project_charger_groups` and `project_charger_connectors`.
- Added a charger data access layer with CRUD functions for charger groups and connector rows.
- Added project detail UI for charger groups, including create, edit, and delete workflows.
- Added connector row create, edit, and delete workflows inside each charger group card.
- Added manual decimal kW input support for ratings such as 7.2, 11.5, 19.2, and larger DCFC ratings.
- Kept `/projects` list summary unchanged for this step to avoid adding separate rollup complexity.
- Preserved all existing tables and columns. No existing project fields were removed, renamed, or recreated.

### Files Created

- `src/lib/data/project-chargers.ts`
- `src/components/project-chargers/project-charger-group-card.tsx`
- `src/components/project-chargers/project-charger-group-form.tsx`
- `src/components/project-chargers/project-charger-group-form-sheet.tsx`
- `src/components/project-chargers/project-chargers.tsx`
- `src/components/project-chargers/project-charger-options.ts`
- `src/components/project-chargers/project-charger-connectors-form.tsx`
- `supabase/step-4c-charger-groups.sql`

### Files Modified

- `supabase/schema.sql`
- `supabase/rls-policies.sql`
- `src/lib/supabase/types.ts`
- `src/components/projects/project-detail-client.tsx`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/projects/[id]`

### Database Tables Affected

- Added `project_charger_groups`.
- Added `project_charger_connectors`.
- Existing `projects` remains the parent table through foreign keys.
- Existing legacy/general `projects.charger_type` and `projects.port_count` fields were preserved.

### Schema Migration Note

The live Supabase database already exists, so do not rely on re-running the full `supabase/schema.sql` file. Apply the additive migration in Supabase SQL Editor. The migration file is `supabase/step-4c-charger-groups.sql`.

Required additive SQL:

```sql
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
```

For the current browser-based MVP using the public anon client, `supabase/step-4c-charger-groups.sql` also includes development RLS policies for the new tables. Replace those policies with user/team-scoped policies before production use.

### Components Changed

- Added `ProjectChargers` to the project detail page.
- Added charger group cards with summary metrics and nested connector rows.
- Added charger group form sheet with locked project context.
- Added connector row form for nested connector management.

### Data Access Functions Added Or Changed

- `getProjectChargerGroups()`
- `getProjectChargerGroupsByProjectId(projectId: string)`
- `getProjectChargerGroupById(id: string)`
- `createProjectChargerGroup(input)`
- `updateProjectChargerGroup(id, input)`
- `deleteProjectChargerGroup(id)`
- `getConnectorsByChargerGroupId(chargerGroupId: string)`
- `createProjectChargerConnector(input)`
- `updateProjectChargerConnector(id, input)`
- `deleteProjectChargerConnector(id)`
- `getProjectChargerGroupsWithConnectorsByProjectId(projectId: string)`

### Validation Results

- `npm run lint` passed.
- `npm run build` passed.

### Known Issues Or Limitations

- Connector totals are manually entered; no automatic total calculation is enforced yet.
- Charger groups are only surfaced on project detail pages in Step 4C.
- `/projects` charger rollups were intentionally left unchanged to keep this step focused.
- Policies in the migration are development policies for the anon client and should be replaced before production use.
- Generated Supabase types still need to replace the hand-maintained type stub later.

### Recommended Next Task

- Move to Step 5 Documents CRUD and file upload support, then connect documents to risks and future AI extraction workflows.

## Step 4C QA Stabilization - 2026-05-23

### What Was Tested

- Static app validation with lint and production build.
- Supabase environment variable presence for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `supabase/step-4c-charger-groups.sql` existence and additive-only safety scan.
- Live Supabase CRUD for `projects`, `action_items`, `risks`, `project_charger_groups`, and `project_charger_connectors`.
- Decimal charger power ratings for `7.2`, `11.5`, and `19.2` kW.
- Charger group cases for dual-port Level 2, dual-port DCFC with CCS1 plus NACS / J3400, single-port Level 2, and mixed Level 2 configuration.
- Update paths for one project, action item, risk, charger group, and connector row.
- Project detail UI code for project overview, charger groups, connector details, action items, risks, and Documents/Contacts/AI Notes placeholders.

### Lint Result

- `npm run lint` passed.

### Build Result

- `npm run build` passed.

### Live Supabase CRUD QA

- Live QA was run with `npm run qa:step4c`.
- First sandboxed attempt failed with DNS/network sandboxing: `getaddrinfo ENOTFOUND uzwalzblmrwtgfgwkxcy.supabase.co`.
- Rerun with network access passed.
- Result: `QA STEP 4C RESULT: PASS`.

### Migration File Validation

- `supabase/step-4c-charger-groups.sql` exists.
- Additive-only scan passed.
- Confirmed expected SQL patterns:
  - `create table if not exists public.project_charger_groups`
  - `create table if not exists public.project_charger_connectors`
  - `create index if not exists`
  - `drop trigger if exists` / `create trigger`
- Confirmed no destructive patterns in the migration file:
  - no `drop table`
  - no `truncate`
  - no `delete from`

### Live Supabase Table Availability

- `project_charger_groups` is available in live Supabase.
- `project_charger_connectors` is available in live Supabase.
- The live CRUD run confirmed the Step 4C migration has been applied or equivalent tables/policies already exist.

### QA Script

- Added `scripts/qa-step-4c.mjs`.
- Added package command: `npm run qa:step4c`.
- No new dependency was added; the script uses plain Node and the existing `@supabase/supabase-js` dependency.

### Test Records Created

Temporary QA run marker: `QA_STEP_4C_1779602462412`.

- Project: `996dd8a3-b207-4afd-92fd-ffe1baee4fdd`
- Action item: `6a2811ef-cdb7-4403-b2e4-abaab2c93b98`
- Risk: `adbc89e0-9fbc-4659-921a-b930407d65ec`
- Charger groups: 4
- Connector rows: 5

### Test Records Deleted

- The QA script cleanup completed successfully for records created by the run.
- Cleanup only targeted IDs created during the run.
- No existing user-created data was deleted.

### Issues Found

- No application, schema, RLS, or CRUD issues were found during the approved live QA run.
- The only failed attempt was caused by local sandbox DNS/network restrictions, not Supabase or application behavior.

### Fixes Made

- Added a reusable self-cleaning QA script for Step 4C.
- Added `npm run qa:step4c` to `package.json`.
- Added README documentation for the QA command.

### Remaining Known Limitations

- `/projects` charger rollups remain intentionally unchanged from Step 4C.
- Connector totals remain manually entered; no automatic calculation is enforced yet.
- Development anon RLS policies are still suitable only for the MVP and should be replaced before production authentication/authorization.
- Supabase types are still hand-maintained stubs and should later be replaced with generated types.

### Step 5 Readiness

- Step 5 Documents is safe to start from the current QA results.

