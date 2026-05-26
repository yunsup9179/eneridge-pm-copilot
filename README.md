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
```

## Supabase Setup Note

The initial SQL schema is available at `supabase/schema.sql`. Apply it in the Supabase SQL editor or through the Supabase CLI before using live CRUD screens. For an existing live Supabase project, apply additive migration files such as `supabase/step-4c-charger-groups.sql`, `supabase/step-5-documents-storage.sql`, `supabase/step-7-project-financials.sql`, and `supabase/step-post-mvp-project-stage.sql` instead of re-running the full schema. The browser Supabase client factory is defined in `src/lib/supabase/client.ts`. Database types are stubbed in `src/lib/supabase/types.ts` and should be replaced with generated Supabase types once the schema is finalized.


## QA Commands

Run the Step 4C live CRUD stabilization check after applying `supabase/step-4c-charger-groups.sql` to the live Supabase project:

```bash
npm run qa:step4c
```

The script creates clearly marked temporary QA records for a project, action item, risk, charger groups, and connector rows, verifies reads and updates, then deletes only the records it created.

## App Structure

- `src/app/page.tsx` - live dashboard rollups for projects, action items, and risks
- `src/app/projects` - live project register with create workflow
- `src/app/projects/[id]` - live project detail with edit, delete, charger group, action item, and risk workflows
- `src/app/actions` - live global action items page with create, edit, complete, delete, and filters
- `src/app/risks` - live global risks page with create, edit, close, delete, and filters
- `src/app/documents` - document library page
- `src/app/contacts` - contact directory page
- `src/app/ai-workspace` - AI workspace placeholder
- `src/app/reports` - project reporting placeholder
- `src/app/settings` - workspace settings placeholder
- `src/components/app-shell.tsx` - responsive layout, sidebar, mobile navigation, and header
- `src/components/projects` - project CRUD screens and form components
- `src/components/action-items` - action item CRUD screens, cards, and form components
- `src/components/risks` - risk CRUD screens, cards, and form components
- `src/components/project-chargers` - project charger group and connector detail components
- `src/components/placeholder-page.tsx` - shared placeholder page template
- `src/config/navigation.ts` - primary navigation configuration
- `src/lib/data/projects.ts` - Supabase project data access layer
- `src/lib/data/action-items.ts` - Supabase action item data access layer
- `src/lib/data/risks.ts` - Supabase risk data access layer
- `src/lib/data/project-chargers.ts` - Supabase charger group and connector data access layer
- `src/lib/supabase` - Supabase client and type stubs
- `supabase/schema.sql` - initial database schema
- `supabase/step-4c-charger-groups.sql` - additive migration for charger groups and connector details

## Current Project Status

- Basic Next.js application scaffold is complete.
- Responsive dashboard layout and navigation are in place.
- Project-centered MVP routes and placeholder pages are in place.
- Initial Supabase schema and TypeScript table stubs are present.
- Projects CRUD is implemented against Supabase with loading, empty, error, create, edit, and delete states.
- Action Items CRUD is implemented against Supabase globally and inside project detail pages.
- Risks CRUD is implemented against Supabase globally and inside project detail pages.
- Project charger groups and connector details are implemented inside project detail pages, and project creation can optionally seed an initial charger group.
- The dashboard reads live Supabase projects, action items, and risks.
- Documents, contacts, and AI workspace remain placeholders.
- AI features have not been implemented yet.

## Next Development Steps

- Replace stubbed database types with generated Supabase types.
- Apply `supabase/step-4c-charger-groups.sql` in the live Supabase SQL Editor if the live database has not received Step 4C yet.
- Implement Documents CRUD and file upload support.
- Implement Contacts CRUD and project-contact relationships.
- Add dashboard rollups for open and overdue action items plus active and critical risks.
- Introduce authentication and role-based access when the core data model is ready.
