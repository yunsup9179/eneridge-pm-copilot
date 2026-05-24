"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  FileText,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"

import { ProjectActionItems } from "@/components/action-items/project-action-items"
import { PageHeader } from "@/components/page-header"
import { ProjectChargers } from "@/components/project-chargers/project-chargers"
import { ProjectDetailSummary } from "@/components/projects/project-detail-summary"
import { ProjectFormSheet } from "@/components/projects/project-form-sheet"
import type { ProjectFormSubmitInput } from "@/components/projects/project-form"
import { ProjectRisks } from "@/components/risks/project-risks"
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
  deleteProject,
  getProjectById,
  isMissingSupabaseConfigError,
  updateProject,
  type Project,
} from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error" | "not_found"

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadProject = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getProjectById(projectId)
      setProject(data)
      setLoadState("ready")
    } catch (error) {
      const message = getErrorMessage(error)
      setLoadError(message)
      setLoadState(message === "Project not found." ? "not_found" : "error")
    }
  }, [projectId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProject()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadProject])

  async function handleUpdateProject(input: ProjectFormSubmitInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      const updatedProject = await updateProject(projectId, input.project)
      setProject(updatedProject)
      setEditOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProject() {
    if (!project) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${project.name}"? This will remove the project row and cascade any linked project data in Supabase.`
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setMutationError(null)

    try {
      await deleteProject(project.id)
      router.push("/projects")
    } catch (error) {
      setMutationError(getErrorMessage(error))
      setIsDeleting(false)
    }
  }

  if (loadState === "loading") {
    return <ProjectDetailLoadingState />
  }

  if (loadState === "error") {
    return (
      <ProjectDetailErrorState
        message={loadError ?? "Unable to load project."}
        onRetry={loadProject}
      />
    )
  }

  if (loadState === "not_found" || !project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project not found</CardTitle>
          <CardDescription>
            This project does not exist in Supabase or may have been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/projects">
              <ArrowLeft />
              Back to projects
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/projects">
          <ArrowLeft />
          Back to projects
        </Link>
      </Button>

      <PageHeader
        eyebrow={project.phase ?? "Project"}
        title={project.name}
        description={project.summary ?? "No project summary has been added yet."}
        actions={
          <>
            <ProjectFormSheet
              open={editOpen}
              title="Edit project"
              description="Update the core project record stored in Supabase."
              submitLabel="Save changes"
              isSubmitting={isSaving}
              error={mutationError}
              project={project}
              trigger={
                <Button variant="outline">
                  <Pencil />
                  Edit
                </Button>
              }
              onOpenChange={(open) => {
                setEditOpen(open)
                if (open) {
                  setMutationError(null)
                }
              }}
              onSubmit={handleUpdateProject}
            />
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              <Trash2 />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      />

      {mutationError && !editOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      <ProjectDetailSummary project={project} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Project overview</CardTitle>
                <CardDescription>
                  Core project data from the `projects` table.
                </CardDescription>
              </div>
              <StatusBadge status={project.status} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ProfileField label="Customer" value={project.customer} />
            <ProfileField label="Location" value={project.location} />
            <ProfileField label="City" value={project.city} />
            <ProfileField label="Utility" value={project.utility} />
            <ProfileField label="Program" value={project.program} />
            <ProfileField label="Priority" value={project.priority} />
            <ProfileField label="Phase" value={project.phase} />
            <ProfileField label="Internal owner" value={project.internal_owner} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key dates</CardTitle>
            <CardDescription>Construction and COD targets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <KeyDate
              icon={<MapPin className="size-4" />}
              label="Project location"
              value={project.location}
            />
            <KeyDate
              icon={<CalendarDays className="size-4" />}
              label="Target construction start"
              value={project.target_construction_start}
            />
            <KeyDate
              icon={<CalendarDays className="size-4" />}
              label="Target COD"
              value={project.target_cod}
            />
          </CardContent>
        </Card>
      </section>

      <ProjectChargers project={project} />

      <ProjectActionItems project={project} />

      <ProjectRisks project={project} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard
          title="Documents"
          description="Uploaded files and AI summaries will appear here."
          icon={<FileText className="size-4" />}
        />
        <PlaceholderCard
          title="Contacts"
          description="Project stakeholders will appear here."
          icon={<Users className="size-4" />}
        />
        <PlaceholderCard
          title="AI Notes"
          description="Approved AI analysis logs will appear here."
          icon={<Bot className="size-4" />}
        />
      </section>
    </div>
  )
}

function ProjectDetailLoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-muted" />
      <Card>
        <CardHeader>
          <div className="h-6 w-2/3 rounded bg-muted" />
          <div className="h-4 w-full max-w-xl rounded bg-muted" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-16 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectDetailErrorState({
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
          {isMissingConfig ? "Supabase is not configured" : "Project failed to load"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMissingConfig && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Add the Supabase values to `.env.local`, apply
            `supabase/schema.sql`, and restart the dev server.
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/projects">
              <ArrowLeft />
              Back to projects
            </Link>
          </Button>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileField({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "Not set"}</p>
    </div>
  )
}

function KeyDate({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium">{value ?? "Not set"}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function PlaceholderCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">Placeholder</Badge>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const isAlert = status === "At risk" || status === "Blocked"

  return <Badge variant={isAlert ? "destructive" : "outline"}>{status ?? "Draft"}</Badge>
}

function getErrorMessage(error: unknown) {
  if (isMissingSupabaseConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected project error."
}
