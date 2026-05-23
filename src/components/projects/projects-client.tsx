"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  PlugZap,
  Plus,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ProjectFormSheet } from "@/components/projects/project-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  createProject,
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
  type ProjectCreateInput,
} from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectsClient() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    void loadProjects()
  }, [])

  async function loadProjects() {
    setLoadState("loading")
    setLoadError(null)

    try {
      const data = await getProjects()
      setProjects(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }

  async function handleCreateProject(input: ProjectCreateInput) {
    setIsCreating(true)
    setMutationError(null)

    try {
      const project = await createProject(input)
      setProjects((current) => [project, ...current])
      setCreateOpen(false)
      router.push(`/projects/${project.id}`)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  const createTrigger = (
    <Button>
      <Plus />
      New Project
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project register"
        description="Live Supabase project register for Eneridge EV charging infrastructure work."
        actions={
          <ProjectFormSheet
            open={createOpen}
            title="Create project"
            description="Add a project record. Actions, risks, documents, contacts, and AI analysis will later connect to this project."
            submitLabel="Create project"
            isSubmitting={isCreating}
            error={mutationError}
            trigger={createTrigger}
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateProject}
          />
        }
      />

      {loadState === "loading" && <ProjectsLoadingState />}

      {loadState === "error" && (
        <ProjectsErrorState
          message={loadError ?? "Unable to load projects."}
          onRetry={loadProjects}
        />
      )}

      {loadState === "ready" && projects.length === 0 && (
        <ProjectsEmptyState onCreate={() => setCreateOpen(true)} />
      )}

      {loadState === "ready" && projects.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{project.name}</CardTitle>
            <CardDescription className="mt-1">
              {project.customer ?? "No customer set"}
            </CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            <span>{project.location ?? "No location set"}</span>
          </div>
          <div className="grid gap-2 rounded-lg bg-muted/40 p-3">
            <MetaRow label="Utility" value={project.utility} />
            <MetaRow label="Program" value={project.program} />
            <MetaRow label="Phase" value={project.phase} />
            <MetaRow label="Priority" value={project.priority} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PlugZap className="size-4" />
            <span>
              {project.charger_type ?? "No charger type set"} /{" "}
              {project.port_count ?? "No"} ports
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>Target COD {formatNullable(project.target_cod)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Owner</p>
            <p className="text-sm font-medium">
              {project.internal_owner ?? "Not assigned"}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}`}>
              Open
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">
        {value ?? "Not set"}
      </span>
    </div>
  )
}

function ProjectsLoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <Card key={item}>
          <CardHeader>
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 rounded bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-9 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProjectsErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  const isMissingConfig = message.includes("NEXT_PUBLIC_SUPABASE")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isMissingConfig ? "Supabase is not configured" : "Projects failed to load"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMissingConfig && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, apply
            `supabase/schema.sql`, then restart `npm run dev`.
          </div>
        )}
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

function ProjectsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No projects yet</CardTitle>
        <CardDescription>
          Create the first EV charging infrastructure project to start building
          the project-centered workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate}>
          <Plus />
          New Project
        </Button>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const isAlert = status === "At risk" || status === "Blocked"

  return <Badge variant={isAlert ? "destructive" : "outline"}>{status ?? "Draft"}</Badge>
}

function formatNullable(value: string | null) {
  return value ?? "Not set"
}

function getErrorMessage(error: unknown) {
  if (isMissingSupabaseConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected project error."
}
