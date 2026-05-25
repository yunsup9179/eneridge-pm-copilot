# Eneridge PM Copilot

Internal project management platform scaffold for Eneridge EV charging infrastructure delivery teams. The app is project-centered: actions, risks, documents, contacts, and future AI analysis connect back to projects.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase JavaScript client
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` from `.env.example` and provide the public Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_DOCUMENT_ANALYSIS_MODEL=gpt-4.1-mini
OPENAI_EMAIL_DRAFT_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` is server-side only. Do not prefix it with `NEXT_PUBLIC_`.

## Supabase Setup For New Environments

The current live Supabase project has already received the MVP migrations needed for Step 5 through Step 11 validation. For a new Supabase environment, start from `supabase/schema.sql`, then apply the additive migration files as needed instead of re-running destructive or duplicate setup against an existing database:

- `supabase/step-4c-charger-groups.sql` - charger groups and connector details
- `supabase/step-5-documents-storage.sql` - `project-documents` storage bucket and development anon storage policy
- `supabase/step-7-project-financials.sql` - project financial tracking

Step 5 document uploads require a private Supabase Storage bucket named `project-documents`. The browser Supabase client factory is defined in `src/lib/supabase/client.ts`. Database types are stubbed in `src/lib/supabase/types.ts` and should be replaced with generated Supabase types once the schema is finalized.

## QA Commands

Run the Step 4C live CRUD stabilization check after the target Supabase environment has charger group tables:

```bash
npm run qa:step4c
```

The script creates clearly marked temporary QA records for a project, action item, risk, charger groups, and connector rows, verifies reads and updates, then deletes only the records it created.

Run the Step 5 document storage QA after the target Supabase environment has the `project-documents` bucket and storage policy:

```bash
npm run qa:step5
```

The script creates a clearly marked temporary project, uploads a temporary text file to `project-documents`, creates and updates document metadata, verifies signed URL creation, and deletes only the records and storage object it created.

Run the Step 6 contacts QA:

```bash
npm run qa:step6
```

The script creates a clearly marked temporary project and contact, links the contact to the project, verifies relationship updates, unlinks the contact, and deletes only the records it created.

Run the Step 7 financials QA after the target Supabase environment has `project_financials`:

```bash
npm run qa:step7
```

The script creates a clearly marked temporary project and financial record, verifies numeric persistence, updates reimbursement fields, and deletes only the records it created.

Run the Step 8 AI foundation QA:

```bash
npm run qa:step8
```

The script verifies the server-side missing-key guard, creates a temporary project/document/mock AI log, updates document AI fields, verifies readback, and deletes only the records it created. It does not call OpenAI.

Run the Step 9 email draft QA:

```bash
npm run qa:step9
```

The script verifies the server-side email draft route and AI Workspace UI wiring, creates temporary project context records, inserts a mock email draft log, verifies readback, and deletes only the records it created. It does not call OpenAI.

Run the full MVP QA after the target Supabase environment has all MVP tables, policies, and storage setup:

```bash
npm run qa:mvp
```

The script creates clearly marked temporary records across projects, action items, risks, charger groups, connectors, document metadata, contacts, project-contact links, financials, and AI logs. It verifies CRUD/readback and deletes only records it created.

## App Structure

- `src/app/page.tsx` - live dashboard rollups for projects, actions, risks, documents, and charger totals
- `src/app/projects` - live project register with create workflow
- `src/app/projects/[id]` - live project detail with edit, delete, charger group, action item, and risk workflows
- `src/app/actions` - live global action items page with create, edit, complete, delete, and filters
- `src/app/risks` - live global risks page with create, edit, close, delete, and filters
- `src/app/documents` - live document library with upload, edit, delete, filters, and signed file open workflow
- `src/app/contacts` - live contact directory with create, edit, delete, search, and project link display
- `src/app/ai-workspace` - AI workspace with project-context email draft generator
- `src/app/api/ai/analyze-document` - server-side document analysis API route
- `src/app/api/ai/draft-email` - server-side project-context email draft API route
- `src/app/reports` - deterministic weekly report generator with copyable markdown output
- `src/app/settings` - workspace settings placeholder
- `src/components/app-shell.tsx` - responsive layout, sidebar, mobile navigation, and header
- `src/components/projects` - project CRUD screens and form components
- `src/components/action-items` - action item CRUD screens, cards, and form components
- `src/components/risks` - risk CRUD screens, cards, and form components
- `src/components/documents` - document CRUD screens, cards, and form components
- `src/components/contacts` - contact CRUD screens, cards, and project contact link components
- `src/components/ai` - AI workspace components including email draft generation
- `src/components/project-financials` - project financial tracking form and detail section
- `src/components/project-chargers` - project charger group and connector detail components
- `src/components/placeholder-page.tsx` - shared placeholder page template
- `src/config/navigation.ts` - primary navigation configuration
- `src/lib/data/projects.ts` - Supabase project data access layer
- `src/lib/data/action-items.ts` - Supabase action item data access layer
- `src/lib/data/risks.ts` - Supabase risk data access layer
- `src/lib/data/documents.ts` - Supabase document metadata and storage data access layer
- `src/lib/data/contacts.ts` - Supabase contacts and project-contact relationship data access layer
- `src/lib/data/project-financials.ts` - Supabase project financials data access layer
- `src/lib/data/project-chargers.ts` - Supabase charger group and connector data access layer
- `src/lib/supabase` - Supabase client and type stubs
- `src/lib/sample-data.ts` - placeholder project data for UI scaffolding
- `supabase/schema.sql` - initial database schema
- `supabase/step-4c-charger-groups.sql` - additive migration for charger groups and connector details
- `supabase/step-5-documents-storage.sql` - additive storage bucket and policy setup for document uploads
- `supabase/step-7-project-financials.sql` - additive migration for project financial tracking

## Current Project Status

- Basic Next.js application scaffold is complete.
- Responsive dashboard layout and navigation are in place.
- Project-centered MVP routes and placeholder pages are in place.
- Initial Supabase schema and TypeScript table stubs are present.
- Projects CRUD is implemented against Supabase with loading, empty, error, create, edit, and delete states.
- Action Items CRUD is implemented against Supabase globally and inside project detail pages.
- Risks CRUD is implemented against Supabase globally and inside project detail pages.
- Project charger groups and connector details are implemented inside project detail pages, and project creation can optionally seed an initial charger group.
- Documents CRUD and Supabase Storage upload UI are implemented globally and inside project detail pages.
- Contacts CRUD and project-contact linking are implemented globally and inside project detail pages.
- Project Financials UI and data access are implemented inside project detail pages.
- AI Document Analysis foundation is implemented for documents, using server-side OpenAI calls and storing output in `ai_analysis_logs`.
- Email Draft Generator is implemented in AI Workspace, using project context and storing generated drafts in `ai_analysis_logs`.
- The dashboard reads live Supabase projects, action items, risks, documents, and charger groups for MVP rollups.
- Weekly report generation is implemented with deterministic markdown output under `/reports`.
- The live Supabase project has passed Step 4C, Step 5, Step 6, and Step 7 QA scripts.
- Step 8 AI foundation QA passes with mocked AI log storage; live AI calls require `OPENAI_API_KEY`.
- Step 9 email draft QA passes with mocked email draft log storage; live email generation requires `OPENAI_API_KEY`.
- Step 11 full MVP QA passes against live Supabase.

## Known Limitations

- Live AI document analysis and email draft generation require `OPENAI_API_KEY` in `.env.local` and a dev server restart.
- Weekly reports are markdown/text only; PDF export is not implemented.
- AI suggestions are review-only and do not automatically create action items, risks, or emails.
- The MVP still uses development anon Supabase policies; production should add authentication and role-based access.

## New Environment Setup Checklist

- Create a Supabase project and configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Apply `supabase/schema.sql`, then apply the additive MVP migration files for charger groups, document storage, and project financials.
- Confirm the `project-documents` storage bucket exists before testing document uploads.
- Run `npm run qa:step4c`, `npm run qa:step5`, `npm run qa:step6`, `npm run qa:step7`, `npm run qa:step8`, `npm run qa:step9`, and `npm run qa:mvp`.
- Add `OPENAI_API_KEY` to `.env.local` and restart the dev server before testing live AI document analysis or email draft generation.

## Next Post-MVP Development Steps

- Replace stubbed database types with generated Supabase types.
- Introduce authentication and role-based access.
- Replace development anon Supabase policies with production RLS policies.
- Improve AI document extraction with OCR/PDF parsing and stronger review workflows.
- Add report export workflows beyond markdown/text output.

## Next Major Roadmap

- Authentication, user roles, and production Supabase RLS policies.
- Document OCR/PDF extraction and stronger AI review workflows.
- PDF/export workflows for reports.
- Financial rollups, reimbursement tracking dashboards, and margin/ROI views.
- Customer/vendor communication history and email integration.
