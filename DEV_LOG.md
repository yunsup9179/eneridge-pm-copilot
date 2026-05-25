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

## Step 4C UX Cleanup - Initial Charger Group on Project Create - 2026-05-23

### Objective

Make Project Charger Groups the primary UI source of truth for charger information by removing legacy `projects.charger_type` and `projects.port_count` from project create/edit, project list, and project overview surfaces.

### Summary of Implementation

- Removed legacy `charger_type` and `port_count` fields from the Project create/edit form.
- Added a Project Information section that keeps project create/edit focused on core project metadata.
- Added an optional Initial Charger Group section to the Project create workflow.
- Added support for multiple optional initial connector rows during project creation.
- Updated project creation to create the project first, then create the initial charger group and connector rows when provided.
- If initial charger creation fails after the project is created, the project is preserved and a clear warning is shown.
- Kept project edit focused on Project Information only; charger groups remain edited from the Charger Groups section on project detail.
- Removed legacy charger fields from the primary Project Overview display.
- Removed legacy charger fields from project list cards.
- No database schema changes were made.

### Files Modified

- `src/components/projects/project-form.tsx`
- `src/components/projects/project-form-sheet.tsx`
- `src/components/projects/projects-client.tsx`
- `src/components/projects/project-detail-client.tsx`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/projects`
- `/projects/[id]`

### Components Changed

- `ProjectForm`
- `ProjectFormSheet`
- `ProjectsClient`
- `ProjectDetailClient`

### Data Access Functions Changed

- No data access functions were changed.
- Existing `createProject`, `createProjectChargerGroup`, and `createProjectChargerConnector` functions are now composed in the project create workflow.

### Validation Results

- `npm run lint` passed.
- `npm run build` passed.
- Sandboxed `npm run qa:step4c` failed due to DNS/network sandboxing before creating records.
- Network-approved `npm run qa:step4c` passed.
- QA run marker: `QA_STEP_4C_1779604084205`.
- Temporary QA project, action item, risk, 4 charger groups, and 5 connector rows were created, verified, updated, and deleted by the QA script.

### Known Issues Or Limitations

- Initial Charger Group creation is not transactional with project creation. If charger group or connector creation fails after the project row is created, the project remains and the UI shows a warning.
- Existing legacy `projects.charger_type` and `projects.port_count` values remain in the database but are hidden from primary UI.
- Project list charger rollups remain intentionally unchanged.
- Connector totals remain manually entered.

### Recommended Next Task

- Start Step 5 Documents CRUD and file upload support.

## Step 4C UX Cleanup - Charger Count Validation - 2026-05-23

### Objective

Improve Project Charger Groups and Connector Details UX with clearer numeric labels, calculated helper values, and warning-only validation for inconsistent charger, port, and connector counts.

### Summary of Implementation

- Added shared charger count helper calculations for expected ports, connector totals, and warning messages.
- Renamed charger group display/form labels to clarify meaning:
  - `Rated Power per Charger (kW)`
  - `Physical Chargers`
  - `Total Ports`
  - `Port Configuration`
- Added suggested total ports in charger group forms for Single Port and Dual Port configurations.
- Added suggested connector totals when physical charger count and connector count per charger are available.
- Added charger group card metrics for Entered Total Ports, Connector Total, and Expected Ports.
- Added warning UI when entered total ports do not match selected Single/Dual Port configuration.
- Added warning UI when connector totals do not match total ports.
- Added Charger Groups summary warning when any group needs count review.
- Kept all validations warning-only to allow real EVSE exceptions.
- No database schema changes were made.

### Files Modified

- `src/components/project-chargers/project-charger-calculations.ts`
- `src/components/project-chargers/project-charger-group-form.tsx`
- `src/components/project-chargers/project-charger-connectors-form.tsx`
- `src/components/project-chargers/project-charger-group-card.tsx`
- `src/components/project-chargers/project-chargers.tsx`
- `src/components/projects/project-form.tsx`
- `DEV_LOG.md`

### Components Changed

- `ProjectChargerGroupForm`
- `ProjectChargerConnectorsForm`
- `ProjectChargerGroupCard`
- `ProjectChargers`
- `ProjectForm` initial charger group section

### Validation Logic Added

- Expected ports:
  - Single Port = `charger_count * 1`
  - Dual Port = `charger_count * 2`
  - Mixed = manual / mixed configuration
  - Other = manual / other configuration
- Connector total = sum of `total_connector_count` across connector rows.
- Warning: `Entered total ports does not match the selected port configuration.`
- Warning: `Connector totals do not match total ports.`
- Summary warning: `Some charger group counts need review.`

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- Network-approved `npm run qa:step4c` passed.
- QA run marker: `QA_STEP_4C_1779604826021`.
- Temporary QA project, action item, risk, 4 charger groups, and 5 connector rows were created, verified, updated, and deleted by the QA script.

### Known Limitations

- Validation remains warning-only and does not block saves.
- Mixed and Other port configurations do not compute an expected port count.
- Suggested totals are helper text only and do not overwrite manually entered values.
- The existing Step 4C QA script validates CRUD and numeric persistence, not browser-rendered warning visibility.

### Recommended Next Task

- Start Step 5 Documents CRUD and file upload support.

## Step 4D: Project Detail UX Readability Improvements - 2026-05-23

### Objective

Improve the Project Detail page readability and information hierarchy before moving to Step 5 Documents, without changing the database schema or CRUD behavior.

### Summary of Improvements

- Added a top Project Snapshot summary bar with status, phase, total chargers, total ports, open action items, open / high risks, and target COD.
- Improved the Charger Groups summary with larger metrics for total chargers, total ports, charger mix, and connector breakdown.
- Added connector breakdown aggregation across charger groups, such as `CCS1: 6` or `NACS / J3400: 6`.
- Improved charger group card spacing, hierarchy, and value typography for charger model, category, rated power, physical chargers, total ports, port configuration, and connector details.
- Kept existing warning-only validation visible for mismatched port totals and connector totals.
- Kept Documents, Contacts, and AI Notes as placeholders.
- No database schema changes were made.

### Files Modified

- `src/components/projects/project-detail-summary.tsx`
- `src/components/projects/project-detail-client.tsx`
- `src/components/project-chargers/project-chargers.tsx`
- `src/components/project-chargers/project-charger-group-card.tsx`
- `DEV_LOG.md`

### Validation Results

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- QA run marker: `QA_STEP_4C_1779605727334`.
- Temporary QA project, action item, risk, 4 charger groups, and 5 connector rows were created, verified, updated, and deleted by the QA script.
- Browser DOM smoke check on `/projects/c34514cb-b5a0-44c9-adf9-88f4bdb76d19` confirmed Project Snapshot, Charger Groups, Connector Breakdown, connector details, Action Items, Risks, and placeholder sections render.

### Known Limitations

- The top Project Snapshot loads rollup values independently from the child sections; edits made inside charger groups, action items, or risks may require a page refresh before the snapshot reflects the latest counts.
- Connector breakdown only includes connector rows with `total_connector_count` set.
- Browser DOM smoke testing was run, but screenshot capture timed out in the in-app browser during this pass.

### Recommended Next Task

- Start Step 5 Documents CRUD and file upload support.

## Step 5: Documents CRUD + Supabase Storage Upload - 2026-05-24

### Objective

Implement project-linked Documents CRUD and Supabase Storage upload support using the `project-documents` bucket, while leaving AI extraction fields unpopulated for now.

### Summary of Implementation

- Added a document data access layer for document CRUD, project-scoped queries, Supabase Storage upload, storage file removal, and signed URL generation.
- Replaced the `/documents` placeholder page with a live document library.
- Added document create, edit, delete, filter, and open-file workflows.
- Added project-scoped documents to the Project Detail page.
- Added graceful partial-failure handling:
  - If document row creation fails after upload, the newly uploaded file is cleaned up where possible.
  - If document deletion succeeds but storage cleanup fails, the UI reports a clear warning.
  - If the `project-documents` bucket is missing, upload/open flows show a helpful message.
- Added additive Supabase Storage setup SQL for the `project-documents` bucket and development anon storage policy.
- Added a Step 5 QA script for temporary project creation, storage upload, document metadata CRUD, signed URL generation, storage cleanup, and project cleanup.
- AI fields remain intentionally unused in this step.

### Files Created

- `src/lib/data/documents.ts`
- `src/components/documents/document-card.tsx`
- `src/components/documents/document-form.tsx`
- `src/components/documents/document-form-sheet.tsx`
- `src/components/documents/documents-client.tsx`
- `src/components/documents/project-documents.tsx`
- `src/components/documents/document-options.ts`
- `scripts/qa-step-5-documents.mjs`
- `supabase/step-5-documents-storage.sql`

### Files Modified

- `src/app/documents/page.tsx`
- `src/components/projects/project-detail-client.tsx`
- `supabase/schema.sql`
- `supabase/rls-policies.sql`
- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/documents`
- `/projects/[id]`

### Database Tables Affected

- `documents`
- `projects` is read for project selectors and used by the QA script for temporary test project creation.
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- `project-documents`
- Added setup SQL to create the bucket if missing and allow development anon CRUD on objects in this bucket.

### Components Added Or Changed

- Added reusable document card, form, sheet, global document client, project document section, and document options components.
- Updated Project Detail to replace the Documents placeholder with live project documents.

### Data Access Functions Added Or Changed

- `getDocuments()`
- `getDocumentsByProjectId(projectId: string)`
- `getDocumentById(id: string)`
- `createDocument(input)`
- `updateDocument(id, input)`
- `deleteDocument(id)`
- `uploadProjectDocumentFile(file, projectId)`
- `removeProjectDocumentFile(storagePath)`
- `getProjectDocumentSignedUrl(storagePath)`

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- `npm run qa:step5` initially failed because the live Supabase Storage bucket was missing or inaccessible.
- After the storage setup was available, `npm run qa:step5` passed.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779680312302`.
- Initial blocked Step 5 QA run marker: `QA_STEP_5_1779680356862`.
- Passing Step 5 QA run marker: `QA_STEP_5_1779681752054`.
- Temporary QA project, document metadata row, and storage object were created, verified, updated, and deleted by the QA script.

### Known Issues Or Limitations

- Document upload uses the public anon Supabase client for the MVP; production should replace this with authenticated, user/team-scoped storage policies.
- Documents can be opened through short-lived signed URLs only when the storage object exists and policy permits access.
- AI summary and extraction fields are intentionally not populated until Step 8.

### Recommended Next Task

- Proceed to Step 6 Contacts CRUD + Project Contacts.

## Step 6: Contacts CRUD + Project Contacts - 2026-05-24

### Objective

Implement live Contacts CRUD and project-contact linking so Eneridge can manage stakeholders globally and attach them to specific project roles.

### Summary of Implementation

- Added a contacts data access layer for global contact CRUD and project-contact linking.
- Replaced the `/contacts` placeholder page with a live contact directory.
- Added global contact create, edit, delete, search, and project-link display workflows.
- Added a Project Detail Contacts section.
- Added project workflows to:
  - link an existing contact to a project with a relationship type
  - create a new contact from project detail and link it immediately
  - edit a linked contact
  - unlink a contact from a project without deleting the contact
- Kept email sending and deeper communication automation out of scope for this step.
- No database schema changes were required.

### Files Created

- `src/lib/data/contacts.ts`
- `src/components/contacts/contact-card.tsx`
- `src/components/contacts/contact-form.tsx`
- `src/components/contacts/contact-form-sheet.tsx`
- `src/components/contacts/contact-options.ts`
- `src/components/contacts/contacts-client.tsx`
- `src/components/contacts/project-contacts.tsx`
- `scripts/qa-step-6-contacts.mjs`

### Files Modified

- `src/app/contacts/page.tsx`
- `src/components/projects/project-detail-client.tsx`
- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/contacts`
- `/projects/[id]`

### Database Tables Affected

- `contacts`
- `project_contacts`
- `projects` is read for project link display and used by the QA script for temporary test project creation.
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None.

### Components Added Or Changed

- Added reusable contact card, form, sheet, global contacts client, project contacts section, and contact relationship options.
- Updated Project Detail to replace the Contacts placeholder with live project contacts.

### Data Access Functions Added Or Changed

- `getContacts()`
- `getContactById(id)`
- `createContact(input)`
- `updateContact(id, input)`
- `deleteContact(id)`
- `getContactsByProjectId(projectId)`
- `linkContactToProject(projectId, contactId, relationshipType)`
- `unlinkContactFromProject(projectId, contactId)`

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779681741639`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779681752054`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779681754752`.
- The Step 6 QA script created a temporary project, contact, project-contact link, verified contact update, verified relationship update, unlinked the contact, and deleted only records it created.

### Known Issues Or Limitations

- Contact relationship editing is handled by relinking/upserting through the project contact workflow; there is no dedicated inline relationship edit button yet.
- Contact deletion from the global directory removes project-contact links by cascade.
- Email sending and AI-assisted communication are intentionally deferred to Step 9.
- The public anon Supabase client is still used for MVP CRUD and should be replaced with authenticated, scoped access before production.

### Recommended Next Task

- Proceed to Step 7 Project Financials.

## Step 7: Project Financials - 2026-05-24

### Objective

Implement project-level financial tracking with additive schema changes, a project detail financials section, and CRUD helpers for a single active financial record per project.

### Summary of Implementation

- Added an additive `project_financials` table migration.
- Added `project_financials` to the main schema and development RLS policy files.
- Added TypeScript table stubs for `project_financials`.
- Added a project financials data access layer.
- Added a Project Detail Project Financials section with:
  - estimated total cost
  - actual total cost
  - equipment cost
  - installation cost
  - utility cost
  - soft cost
  - rebate applicable
  - rebate program
  - rebate amount
  - grant amount
  - match share
  - customer contribution
  - Eneridge out of pocket
  - reimbursement status
  - reimbursement received
  - retention amount
  - notes
- Added a simple edit workflow using an upsert-by-project helper.
- Added currency formatting for read views.
- No complex ROI calculations were added.
- No existing table or column was dropped, removed, renamed, or recreated.

### Files Created

- `supabase/step-7-project-financials.sql`
- `src/lib/data/project-financials.ts`
- `src/components/project-financials/project-financial-form.tsx`
- `src/components/project-financials/project-financial-form-sheet.tsx`
- `src/components/project-financials/project-financials.tsx`
- `scripts/qa-step-7-financials.mjs`

### Files Modified

- `src/lib/supabase/types.ts`
- `src/components/projects/project-detail-client.tsx`
- `supabase/schema.sql`
- `supabase/rls-policies.sql`
- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/projects/[id]`

### Database Tables Affected

- `project_financials` was added in migration and type stubs.
- `projects` is referenced by `project_financials.project_id` and used by the QA script for temporary test project creation.
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None.

### Components Added Or Changed

- Added reusable project financial form, sheet, and Project Detail financials section.
- Updated Project Detail to render Project Financials.

### Data Access Functions Added Or Changed

- `getProjectFinancialByProjectId(projectId)`
- `createProjectFinancial(input)`
- `updateProjectFinancial(id, input)`
- `upsertProjectFinancialByProjectId(projectId, input)`
- `deleteProjectFinancial(id)`

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` failed because the live Supabase database does not yet have `project_financials`.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779682520598`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779682577131`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779682574771`.
- Step 7 QA run marker: `QA_STEP_7_1779682576031`.
- Step 7 QA failed with the expected migration message:
  `project_financials is missing in live Supabase. Apply supabase/step-7-project-financials.sql before running Step 7 QA.`

### Known Issues Or Limitations

- Live Step 7 financial CRUD QA cannot pass until `supabase/step-7-project-financials.sql` is applied in Supabase SQL Editor.
- The UI treats the latest financial row for a project as the active record; no unique database constraint was added because the requested schema did not include one.
- Financials are manually entered; no ROI, margin, or automatic reconciliation logic is implemented yet.
- The public anon Supabase client is still used for MVP CRUD and should be replaced with authenticated, scoped access before production.

### Recommended Next Task

- Apply `supabase/step-7-project-financials.sql`, rerun `npm run qa:step7`, then proceed to Step 8 AI Document Analysis.

## Step 8: AI Document Analysis - 2026-05-24

### Objective

Implement the AI document analysis foundation for uploaded project documents, keeping the OpenAI API key server-side only and storing review-ready AI output without automatically creating action items or risks.

### Summary of Implementation

- Added a server-side document analysis API route at `/api/ai/analyze-document`.
- Used the OpenAI Responses API with structured JSON output for consistent analysis payloads.
- Added missing `OPENAI_API_KEY` handling that returns a helpful 503 response instead of crashing.
- Added document-card Analyze workflow:
  - user can paste optional document text or notes
  - metadata-only analysis is supported when no text is provided
  - analysis results render inline on the document card
  - suggestions can be copied for review
- Stored successful AI output in `ai_analysis_logs`.
- Updated analyzed document rows with:
  - `ai_summary`
  - `key_terms`
  - `action_items_extracted`
  - `risks_extracted`
  - `Needs Review` status when the document was previously `Uploaded`
- Did not implement OCR, PDF parsing, automatic action creation, or automatic risk creation.
- No database schema changes were required.

### Files Created

- `src/app/api/ai/analyze-document/route.ts`
- `scripts/qa-step-8-ai.mjs`

### Files Modified

- `src/components/documents/document-card.tsx`
- `src/components/documents/documents-client.tsx`
- `src/components/documents/project-documents.tsx`
- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/api/ai/analyze-document`
- `/documents`
- `/projects/[id]`

### Database Tables Affected

- `documents`
- `ai_analysis_logs`
- `projects` is read for document analysis context and used by the QA script for temporary test project creation.
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None.

### Components Added Or Changed

- Updated `DocumentCard` with Analyze Document, inline AI analysis display, and copyable review output.
- Updated global and project document lists to refresh after analysis.

### Data Access Functions Added Or Changed

- No client-side data access functions were changed.
- The server route uses the Supabase client directly to read projects/documents, insert AI logs, and update document AI fields.

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` failed because the live Supabase database does not yet have `project_financials`.
- Network-approved `npm run qa:step8` passed.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779683089572`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779683089571`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779683089571`.
- Step 7 QA remains blocked by the unapplied financials migration.
- Step 7 QA run marker: `QA_STEP_7_1779683089572`.
- Step 8 QA passed.
- Step 8 QA run marker: `QA_STEP_8_1779683098415`.
- Step 8 QA statically verified the missing-key guard and AI log route path, then created a temporary project, document, and mock AI analysis log, updated document AI fields, verified readback, and deleted only records it created.

### Known Issues Or Limitations

- `OPENAI_API_KEY` is not currently present in `.env.local`; live AI calls will show the missing-key message until it is added and the dev server is restarted.
- Full PDF parsing and OCR are not implemented; users can paste document text or notes, otherwise metadata-only analysis is used.
- Suggested action items and risks are review-only and are not automatically inserted into `action_items` or `risks`.
- Step 7 live QA still needs `supabase/step-7-project-financials.sql` applied before it can pass.

### Recommended Next Task

- Add `OPENAI_API_KEY` to `.env.local` when live AI calls are desired, apply the Step 7 financials migration, then proceed to Step 9 Email Draft Generator.

## Step 9: Email Draft Generator - 2026-05-24

### Objective

Implement a project-context email draft generator that uses Eneridge PM Copilot project data, keeps the OpenAI key server-side only, and stores generated drafts for review without sending email.

### Summary of Implementation

- Added a server-side email draft API route at `/api/ai/draft-email`.
- Used the OpenAI Responses API with structured JSON output for draft subject, body, and confidence.
- Added missing `OPENAI_API_KEY` handling that returns a helpful 503 response instead of crashing.
- Built an AI Workspace email draft generator with:
  - project selector
  - recipient type selector
  - purpose selector
  - optional user notes
  - optional project document selection
  - draft preview
  - copy-to-clipboard support
- Included project context in the server prompt:
  - project basic info
  - open action items
  - open/high risks
  - charger groups
  - connector details
  - documents
  - project contacts
  - contacts
- Stored successful email drafts in `ai_analysis_logs` with `agent_type = email_draft`.
- Did not implement email sending.
- No database schema changes were required.

### Files Created

- `src/app/api/ai/draft-email/route.ts`
- `src/components/ai/email-draft-generator.tsx`
- `scripts/qa-step-9-email.mjs`

### Files Modified

- `src/app/ai-workspace/page.tsx`
- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/ai-workspace`
- `/api/ai/draft-email`

### Database Tables Affected

- `ai_analysis_logs`
- `projects`
- `action_items`
- `risks`
- `project_charger_groups`
- `project_charger_connectors`
- `documents`
- `project_contacts`
- `contacts`
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None.

### Components Added Or Changed

- Added `EmailDraftGenerator`.
- Updated AI Workspace to render the email draft generator instead of the prior placeholder.

### Data Access Functions Added Or Changed

- No client-side data access functions were changed.
- The server route uses the Supabase client directly to read project context and insert AI draft logs.

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` failed because the live Supabase database does not yet have `project_financials`.
- Network-approved `npm run qa:step8` passed.
- `npm run qa:step9` initially failed inside the sandbox due DNS/network restriction.
- Network-approved `npm run qa:step9` passed.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779683658527`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779683664241`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779683669324`.
- Step 7 QA remains blocked by the unapplied financials migration.
- Step 7 QA run marker: `QA_STEP_7_1779683672532`.
- Step 8 QA passed.
- Step 8 QA run marker: `QA_STEP_8_1779683676839`.
- Step 9 QA passed.
- Step 9 QA run marker: `QA_STEP_9_1779683700472`.
- Step 9 QA statically verified the missing-key guard, API route, AI Workspace wiring, recipient/purpose options, and copy workflow. It then created temporary project context records, inserted a mock `email_draft` log, verified readback, and deleted only records it created.

### Known Issues Or Limitations

- `OPENAI_API_KEY` is not currently present in `.env.local`; live email draft generation will show the missing-key message until it is added and the dev server is restarted.
- The draft generator produces review-only text and does not send email.
- Generated email drafts are stored in `ai_analysis_logs`, not a dedicated email table.
- Step 7 live QA still needs `supabase/step-7-project-financials.sql` applied before it can pass.

### Recommended Next Task

- Apply the Step 7 financials migration when possible, then proceed to Step 10 Dashboard Rollups and Weekly Report Generator.

## Step 10: Dashboard Rollups + Weekly Report Generator - 2026-05-24

### Objective

Add MVP portfolio intelligence to the dashboard and provide a copyable weekly report generator without changing the database schema.

### Summary of Implementation

- Expanded the dashboard to load live projects, action items, risks, documents, and charger groups.
- Added dashboard rollups for:
  - active projects
  - open actions
  - overdue actions
  - high / critical risks
  - documents needing review
  - total chargers
  - total ports
  - projects by phase
  - projects by status
- Updated the project register cards to show per-project rollups:
  - open action count
  - high / critical risk count
  - document count
  - charger / port summary
- Replaced the Reports placeholder with a deterministic weekly report generator.
- Weekly report output includes:
  - Executive Summary
  - Active Projects
  - Watchlist / Risk Projects
  - Overdue Action Items
  - Key Risks
  - Documents Needing Review
  - Upcoming Milestones
  - Suggested Follow-ups
- Added copy-to-clipboard support for the generated markdown report.
- No database schema changes were required.

### Files Created

- None.

### Files Modified

- `src/app/page.tsx`
- `src/app/reports/page.tsx`
- `src/components/projects/projects-client.tsx`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- `/`
- `/projects`
- `/reports`

### Database Tables Affected

- `projects`
- `action_items`
- `risks`
- `documents`
- `project_charger_groups`
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None.

### Components Added Or Changed

- Updated dashboard cards, breakdown cards, priority project summaries, action list, and risk watchlist.
- Updated project list cards with compact MVP rollups.
- Replaced Reports placeholder with a live report generator.

### Data Access Functions Added Or Changed

- No data access functions were changed.
- Existing data helpers are now used by the dashboard, project list, and report page.

### Commands Run

- `npm run lint` passed.
- Initial `npm run build` failed on a TypeScript inference issue for charger totals.
- Fixed the numeric helper return type.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` failed because the live Supabase database does not yet have `project_financials`.
- Network-approved `npm run qa:step8` passed.
- Network-approved `npm run qa:step9` passed.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779684121149`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779684127176`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779684139360`.
- Step 7 QA remains blocked by the unapplied financials migration.
- Step 7 QA run marker: `QA_STEP_7_1779684145850`.
- Step 8 QA passed.
- Step 8 QA run marker: `QA_STEP_8_1779684151762`.
- Step 9 QA passed.
- Step 9 QA run marker: `QA_STEP_9_1779684154857`.

### Known Issues Or Limitations

- Weekly reports are deterministic markdown only; no PDF export is implemented yet.
- AI-enhanced weekly summary generation is not implemented in this step.
- Dashboard rollups are client-side calculations for the MVP; they can later move into Supabase views or RPCs if portfolio size grows.
- Step 7 live QA still needs `supabase/step-7-project-financials.sql` applied before it can pass.

### Recommended Next Task

- Proceed to Step 11 Overall QA + MVP Stabilization.

## Step 11: Overall QA + MVP Stabilization - 2026-05-24

### Objective

Run final MVP stabilization checks across the implemented project, action, risk, charger, document, contact, financial, AI, dashboard, and reporting workflows.

### Summary of Implementation

- Added a full MVP QA script that creates clearly marked temporary records, verifies CRUD/readback, and deletes only records it created.
- MVP QA covers:
  - project create/read/update/delete
  - action item CRUD
  - risk CRUD
  - charger group CRUD
  - connector CRUD
  - document metadata CRUD
  - contact CRUD
  - project-contact link cleanup
  - project financials CRUD
  - AI log creation/readback
- The MVP QA script stops with a clear message when `project_financials` is missing from live Supabase.
- Updated README with MVP QA command, known limitations, and next major roadmap.
- No database schema changes were made in this step.

### Files Created

- `scripts/qa-mvp.mjs`

### Files Modified

- `package.json`
- `README.md`
- `DEV_LOG.md`

### Routes Affected

- No route files were changed in Step 11.
- UI smoke checklist routes confirmed by build output:
  - `/`
  - `/projects`
  - `/projects/[id]`
  - `/actions`
  - `/risks`
  - `/documents`
  - `/contacts`
  - `/ai-workspace`
  - `/reports`
  - `/settings`

### Database Tables Affected

- `projects`
- `action_items`
- `risks`
- `project_charger_groups`
- `project_charger_connectors`
- `documents`
- `contacts`
- `project_contacts`
- `project_financials`
- `ai_analysis_logs`
- No existing table or column was dropped, removed, renamed, or recreated.

### Storage Buckets Affected

- None in the MVP QA script. Step 5 storage QA still covers the `project-documents` bucket.

### Components Added Or Changed

- None in Step 11.

### Data Access Functions Added Or Changed

- None in Step 11.

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` failed because the live Supabase database does not yet have `project_financials`.
- Network-approved `npm run qa:step8` passed.
- Network-approved `npm run qa:step9` passed.
- `npm run qa:mvp` initially failed inside the sandbox due DNS/network restriction.
- Network-approved `npm run qa:mvp` failed because the live Supabase database does not yet have `project_financials`.

### QA Results

- Step 4C regression QA passed.
- Step 4C QA run marker: `QA_STEP_4C_1779684439775`.
- Step 5 QA passed.
- Step 5 QA run marker: `QA_STEP_5_1779684445180`.
- Step 6 QA passed.
- Step 6 QA run marker: `QA_STEP_6_1779684450949`.
- Step 7 QA remains blocked by the unapplied financials migration.
- Step 7 QA run marker: `QA_STEP_7_1779684455285`.
- Step 8 QA passed.
- Step 8 QA run marker: `QA_STEP_8_1779684458039`.
- Step 9 QA passed.
- Step 9 QA run marker: `QA_STEP_9_1779684461033`.
- MVP QA reached live Supabase after network approval, cleaned up temporary records, and failed at the known missing financials migration.
- MVP QA run marker: `QA_MVP_1779684476761`.

### Known Issues Or Limitations

- Full MVP QA cannot pass until `supabase/step-7-project-financials.sql` is applied in Supabase SQL Editor.
- Live AI features require `OPENAI_API_KEY`; current QA scripts avoid live OpenAI calls and verify storage/logging paths with mocks.
- Weekly report generation is text/markdown only and does not export PDF.
- The app still uses development anon Supabase policies for MVP validation.

### Recommended Next Task

- Apply `supabase/step-7-project-financials.sql` in Supabase SQL Editor, then rerun `npm run qa:step7` and `npm run qa:mvp`.

## MVP QA Recheck - 2026-05-25

### Objective

Recheck the current live Supabase state before claiming MVP completion and determine whether the remaining Step 7 migration blocker can be resolved from this local environment.

### Summary

- Confirmed current worktree still contains the Step 5 through Step 11 implementation artifacts.
- Confirmed `supabase/step-7-project-financials.sql` exists and remains additive-only for the `project_financials` table, index, updated_at trigger, RLS enablement, and development anon CRUD policy.
- Reran live financial QA and full MVP QA against Supabase.
- Confirmed live Supabase still does not have `project_financials`.
- Checked for local migration paths:
  - Supabase CLI is not installed or not available on `PATH`.
  - `psql` is installed.
  - No `SUPABASE`, `POSTGRES`, `DATABASE`, or `PG` admin connection environment variables are available.
  - `.env.local` only contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Because only public anon credentials are available locally, the financials migration cannot be safely applied from this environment.
- No application code was changed in this recheck.

### Commands Run

- Network-approved `npm run qa:step7` failed because live Supabase does not yet have `project_financials`.
- Network-approved `npm run qa:mvp` failed because live Supabase does not yet have `project_financials`.
- `command -v supabase` found no Supabase CLI.
- `command -v psql` found `/opt/homebrew/bin/psql`.
- Environment key inspection found no database admin connection variables.

### QA Results

- Step 7 QA run marker: `QA_STEP_7_1779729040377`.
- MVP QA run marker: `QA_MVP_1779729046524`.
- Both scripts reported cleanup completed for records created by the run.

### Current Blocker

- Apply `supabase/step-7-project-financials.sql` in Supabase SQL Editor, or provide a safe database admin connection method, then rerun:
  - `npm run qa:step7`
  - `npm run qa:mvp`

### Recommended Next Task

- Apply the Step 7 financials migration in live Supabase, then rerun final QA. After both financials and MVP QA pass, the MVP completion goal can be audited again for completion.

## MVP Completion Verification - 2026-05-25

### Objective

Verify that the Step 7 financials migration has been applied in live Supabase and complete the final Step 5 through Step 11 MVP validation pass.

### Summary

- Confirmed live Supabase now accepts `project_financials` CRUD through the Step 7 QA script.
- Reran the complete validation suite required for MVP completion.
- Confirmed full MVP QA passes against live Supabase.
- Updated README from blocked migration status to completed MVP QA status.
- Temporary QA records were created only by QA scripts and cleaned up by those scripts.
- No database tables were dropped, removed, renamed, or recreated.

### Commands Run

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build` showed the existing Next.js multiple-lockfile workspace-root warning, but the production build completed successfully.
- Network-approved `npm run qa:step4c` passed.
- Network-approved `npm run qa:step5` passed.
- Network-approved `npm run qa:step6` passed.
- Network-approved `npm run qa:step7` passed.
- Network-approved `npm run qa:step8` passed.
- Network-approved `npm run qa:step9` passed.
- Network-approved `npm run qa:mvp` passed.
- Local route smoke checks against the existing Next dev server on `http://localhost:3000` returned HTTP 200 for:
  - `/`
  - `/projects`
  - `/projects/00000000-0000-4000-8000-000000000000`
  - `/actions`
  - `/risks`
  - `/documents`
  - `/contacts`
  - `/ai-workspace`
  - `/reports`
  - `/settings`

### QA Results

- Step 4C QA run marker: `QA_STEP_4C_1779731895669`.
- Step 5 QA run marker: `QA_STEP_5_1779731903009`.
- Step 6 QA run marker: `QA_STEP_6_1779731909761`.
- Step 7 QA run marker: `QA_STEP_7_1779731914099`.
- Step 8 QA run marker: `QA_STEP_8_1779731919899`.
- Step 9 QA run marker: `QA_STEP_9_1779731924138`.
- MVP QA run marker: `QA_MVP_1779731931082`.
- All QA scripts reported cleanup completed for records created by the run.
- Route smoke checks returned HTTP 200 for every MVP checklist route.

### Known Issues Or Limitations

- Live AI features still require `OPENAI_API_KEY`; current QA scripts avoid live OpenAI calls and verify storage/logging paths with mocks.
- Weekly report generation is text/markdown only and does not export PDF.
- The app still uses development anon Supabase policies for MVP validation.
- Build still shows the existing Next.js multiple-lockfile workspace-root warning.

### Recommended Next Task

- Move into post-MVP hardening: authentication, production RLS policies, generated Supabase types, and AI/document extraction improvements.

## Documentation Cleanup - 2026-05-25

### Objective

Clarify README setup language after MVP completion verification.

### Summary

- Updated README wording so new-environment setup steps are separate from actual post-MVP development work.
- Clarified that Step 4C, Step 5, and Step 7 migrations are required for new Supabase environments and are not pending for the current live Supabase project.
- Preserved the known MVP limitations around `OPENAI_API_KEY`, markdown-only reports, review-only AI suggestions, and development anon Supabase policies.
- No application code or database schema was changed.
