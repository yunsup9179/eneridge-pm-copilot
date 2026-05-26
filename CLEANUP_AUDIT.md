# Post-MVP Cleanup Audit - 2026-05-25

## Scope

This audit started as report-only. Cleanup Pass 1 later removed only the lowest-risk unreferenced tracked files listed below. No application behavior was intentionally changed, no database schema was changed, no migrations were removed, and no Supabase data was modified.

## Files And Areas Inspected

- Root project metadata: `package.json`, `package-lock.json`, `.gitignore`, `README.md`, `DEV_LOG.md`, `AGENTS.md`, `CLAUDE.md`, `components.json`
- App routes: `src/app/page.tsx`, `src/app/projects`, `src/app/actions`, `src/app/risks`, `src/app/documents`, `src/app/contacts`, `src/app/ai-workspace`, `src/app/reports`, `src/app/settings`, `src/app/api/ai`
- Component areas: `src/components/app-shell.tsx`, `src/components/projects`, `src/components/action-items`, `src/components/risks`, `src/components/documents`, `src/components/contacts`, `src/components/project-chargers`, `src/components/project-financials`, `src/components/ai`, `src/components/ui`
- Data layers: `src/lib/data`, `src/lib/supabase`, removed `src/lib/sample-data.ts`, `src/lib/utils.ts`
- QA scripts: `scripts/qa-step-4c.mjs`, `scripts/qa-step-5-documents.mjs`, `scripts/qa-step-6-contacts.mjs`, `scripts/qa-step-7-financials.mjs`, `scripts/qa-step-8-ai.mjs`, `scripts/qa-step-9-email.mjs`, `scripts/qa-mvp.mjs`
- Supabase files: `supabase/schema.sql`, `supabase/rls-policies.sql`, `supabase/step-4c-charger-groups.sql`, `supabase/step-5-documents-storage.sql`, `supabase/step-7-project-financials.sql`
- Assets and generated/local artifacts: `public/*.svg`, `eneridge-dashboard-desktop.png`, `.DS_Store`, `src/.DS_Store`, `.env.local`, `.next`, `node_modules`, `next-env.d.ts`

## Safe Cleanup Candidates

These appear safe to remove in a later cleanup PR, after one final `rg` check immediately before deletion.

- `eneridge-dashboard-desktop.png`
  - Tracked 92 KB screenshot-like JPEG.
  - No references were found in README or app code.
  - Safe candidate if it is not intentionally kept as a design reference.

- Local ignored artifacts already protected by `.gitignore`
  - `.DS_Store`
  - `src/.DS_Store`
  - `.env.local`
  - `.next/`
  - `node_modules/`
  - No deletion was performed. These should simply remain uncommitted.

## Completed In Cleanup Pass 1

- Removed `src/lib/sample-data.ts` after final reference checks confirmed no app imports.
- Removed the README reference to `src/lib/sample-data.ts`.
- Removed unreferenced default starter SVG assets:
  - `public/file.svg`
  - `public/globe.svg`
  - `public/next.svg`
  - `public/vercel.svg`
  - `public/window.svg`
- These removals did not change the database schema, Supabase data, dependencies, auth/RLS behavior, or active app routes.

## Completed Or Partially Completed In Cleanup Pass 2

- Cleaned up `src/components/app-shell.tsx` stale and nonfunctional shell UI.
- Removed the hardcoded `workspacePulse` cards, including the stale `MVP sample set` text.
- Removed nonfunctional header search, notification, and account dropdown controls.
- Replaced those surfaces with simple static workspace context text.
- Kept navigation, responsive layout, routes, data logic, schema, auth/RLS behavior, dependencies, and QA scripts unchanged.

## Needs-Review Cleanup Candidates

These are not deletion candidates yet because they may still encode intended MVP or post-MVP behavior.

- `src/app/settings/page.tsx` and `src/components/placeholder-page.tsx`
  - Settings remains the only active user-facing placeholder route.
  - `PlaceholderPage` is still used by Settings, so do not remove it until Settings has a live implementation or the route is intentionally removed.

- `README.md`
  - Current README is accurate after MVP cleanup, but it is growing into both user setup guide and technical status log.
  - Recommended later action: split operational setup, QA commands, and roadmap into shorter docs once post-MVP hardening starts.

- `DEV_LOG.md`
  - The log is intentionally historical and now includes obsolete blocked-state entries that were later resolved.
  - Recommended later action: keep the raw log for auditability, but optionally add a concise `CHANGELOG.md` or `MVP_STATUS.md` instead of pruning history.

- `next-env.d.ts`
  - The file exists locally and is ignored by `.gitignore`.
  - Next.js commonly generates this file; review whether the project wants it tracked or intentionally ignored. Current build passes as-is.

- Root instruction files
  - `AGENTS.md` and `CLAUDE.md` are small agent/tooling guidance files.
  - Keep unless the team decides to consolidate coding-agent instructions.

## Unused Imports And Obvious Dead Code

- `npm run lint` passed, so there are no lint-detected unused imports in the current TypeScript/React source.
- Cleanup Pass 1 removed the obvious dead-code candidate, `src/lib/sample-data.ts`, after final `rg` checks found no app imports.
- No additional lint-safe code cleanup was applied because the pass intentionally stayed narrowly scoped.

## Sample Data

- Cleanup Pass 1 removed obsolete sample project data and stale string IDs after live Supabase-backed MVP work replaced the scaffolding.
- The README reference was removed in the same pass.

## Duplicated Logic To Refactor Later

- QA helper duplication across all QA scripts:
  - `loadEnvLocal`
  - `summarizeSupabaseError`
  - `safeDelete`
  - temporary record cleanup patterns
  - Recommended later action: create `scripts/qa-utils.mjs`.

- Client error formatting duplication:
  - Many components define local `getErrorMessage` helpers.
  - Recommended later action: add shared UI/data error helpers once error-display requirements stabilize.

- Form sheet component duplication:
  - `ProjectFormSheet`, `ActionItemFormSheet`, `RiskFormSheet`, document/contact/charger/financial sheet components share the same sheet shell.
  - Recommended later action: extract a generic `EntityFormSheet` only if it reduces complexity without making forms harder to scan.

- AI route helper duplication:
  - `createServerSupabaseClient` and OpenAI `getOutputText` parsing are duplicated in `analyze-document` and `draft-email` routes.
  - Recommended later action: create a small server-only AI/Supabase helper module.

- Dashboard/report calculation duplication:
  - `sumNumbers` and `isPastDue` appear in both `src/app/page.tsx` and `src/app/reports/page.tsx`.
  - Recommended later action: move shared portfolio/report calculations into `src/lib/data` or `src/lib/reporting` when more rollups are added.

## Dependency Review

- Clearly used dependencies:
  - `@supabase/supabase-js`
  - `class-variance-authority`
  - `clsx`
  - `lucide-react`
  - `next`
  - `radix-ui`
  - `react`
  - `react-dom`
  - `tailwind-merge`
  - `tw-animate-css`

- Needs review:
  - `shadcn`
    - It is referenced by `src/app/globals.css` through `@import "shadcn/tailwind.css";`, so it is not obviously unused.
    - It is also a CLI/package dependency. Review whether it should remain in `dependencies`, move to `devDependencies`, or be replaced by checked-in CSS if production bundle policy requires fewer package dependencies.

- Dependency footprint note:
  - The `radix-ui` umbrella package brings many Radix packages into `package-lock.json`.
  - The app imports from the umbrella package in UI components. Review later whether switching to per-component `@radix-ui/react-*` packages is worthwhile.

## Documentation Consistency Findings

- README now correctly separates:
  - new-environment setup
  - post-MVP development work
  - known limitations
- DEV_LOG is accurate as a chronological record but overly verbose for day-to-day status lookup.
- Historical blocked entries in DEV_LOG are not incorrect because later completion verification supersedes them, but they may confuse readers scanning quickly.

## Do-Not-Delete Items

- Supabase migrations and schema files:
  - `supabase/schema.sql`
  - `supabase/rls-policies.sql`
  - `supabase/step-4c-charger-groups.sql`
  - `supabase/step-5-documents-storage.sql`
  - `supabase/step-7-project-financials.sql`

- QA scripts:
  - Keep all Step 4C through Step 9 scripts and `qa-mvp` unless a shared QA utility refactor replaces duplicated internals.

- `package-lock.json`
  - Keep for reproducible installs.

- `src/components/ui/*`
  - These are active UI primitives used across the app.

- `src/components/placeholder-page.tsx`
  - Keep while Settings still uses it.

- `.env.local`
  - Do not commit; keep local only.

## Recommended Cleanup Order

1. Remove ignored local artifacts from the working directory only if desired: `.DS_Store`, `src/.DS_Store`, `.next/`, local logs. Do not commit them.
2. Review `eneridge-dashboard-desktop.png` and remove it only if it is not intentionally kept as a design/reference artifact.
3. Add `scripts/qa-utils.mjs` and refactor QA scripts one at a time, validating after each.
4. Extract shared AI route helpers only after the OpenAI/document workflows settle.
5. Split README/DEV_LOG operational status into smaller docs if the team wants cleaner post-MVP docs.
6. Review dependency shape for `shadcn` and `radix-ui` after deciding whether to keep umbrella packages.

## Risks

- Removed sample data and default public SVGs were checked with `rg` first; no active app references were found.
- Refactoring QA helper logic can accidentally weaken cleanup safety; keep temporary record markers and conservative cleanup behavior intact.
- Refactoring form sheets too early could obscure simple, readable CRUD flows.
- Rewriting DEV_LOG could remove useful audit history; prefer adding concise status docs instead of deleting history.

## Validation Results

- `npm run lint` passed.
- `npm run build` passed.
- Build still shows the existing Next.js multiple-lockfile workspace-root warning:
  - Next selected `/Users/yunsupark/package-lock.json` as the workspace root.
  - The project also has `/Users/yunsupark/eneridge-pm-copilot/package-lock.json`.
- Cleanup Pass 1 also ran `npm run qa:step5`, `npm run qa:step7`, and `npm run qa:mvp`; all passed and cleaned up only records created by those QA runs.
- Cleanup Pass 2 ran `npm run lint`, `npm run build`, and `npm run qa:mvp`; all passed and `qa:mvp` cleaned up only records created by that QA run.
