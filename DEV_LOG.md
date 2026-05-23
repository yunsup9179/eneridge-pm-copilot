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
