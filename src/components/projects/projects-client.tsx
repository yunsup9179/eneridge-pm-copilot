"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  PlugZap,
  Plus,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ProjectFormSheet } from "@/components/projects/project-form-sheet"
import type { ProjectFormSubmitInput } from "@/components/projects/project-form"
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
} from "@/lib/data/projects"
import {
  getActionItems,
  type ActionItemWithProject,
} from "@/lib/data/action-items"
import {
  getDocuments,
  type ProjectDocumentWithProject,
} from "@/lib/data/documents"
import {
  getProjectFinancials,
  type ProjectFinancial,
} from "@/lib/data/project-financials"
import {
  createProjectChargerConnector,
  createProjectChargerGroup,
  getProjectChargerGroups,
  type ProjectChargerGroup,
} from "@/lib/data/project-chargers"
import { getRisks, type RiskWithProject } from "@/lib/data/risks"

type LoadState = "loading" | "ready" | "error"
type ProjectListRollup = {
  openActions: number
  highRisks: number
  documents: number
  chargers: number
  ports: number
  financial: ProjectFinancial | null
}

export function ProjectsClient() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [actionItems, setActionItems] = useState<ActionItemWithProject[]>([])
  const [risks, setRisks] = useState<RiskWithProject[]>([])
  const [documents, setDocuments] = useState<ProjectDocumentWithProject[]>([])
  const [chargerGroups, setChargerGroups] = useState<ProjectChargerGroup[]>([])
  const [financials, setFinancials] = useState<ProjectFinancial[]>([])
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
      const [
        projectData,
        actionData,
        riskData,
        documentData,
        chargerData,
        financialData,
      ] = await Promise.all([
        getProjects(),
        getActionItems(),
        getRisks(),
        getDocuments(),
        getProjectChargerGroups(),
        getProjectFinancials(),
      ])

      setProjects(projectData)
      setActionItems(actionData)
      setRisks(riskData)
      setDocuments(documentData)
      setChargerGroups(chargerData)
      setFinancials(financialData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }

  async function handleCreateProject(input: ProjectFormSubmitInput) {
    setIsCreating(true)
    setMutationError(null)

    try {
      const project = await createProject(input.project)
      setProjects((current) => [project, ...current])

      if (input.initialChargerGroup) {
        try {
          const chargerGroup = await createProjectChargerGroup({
            ...input.initialChargerGroup.chargerGroup,
            project_id: project.id,
          })

          for (const connector of input.initialChargerGroup.connectors) {
            await createProjectChargerConnector({
              ...connector,
              charger_group_id: chargerGroup.id,
            })
          }
        } catch (error) {
          setCreateOpen(false)
          setMutationError(
            `Project created, but the initial charger group was not saved: ${getErrorMessage(error)}. Open the project detail page to add charger groups manually.`
          )
          return
        }
      }

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

  const rollupsByProjectId = useMemo(
    () =>
      buildProjectListRollups(
        projects,
        actionItems,
        risks,
        documents,
        chargerGroups,
        financials
      ),
    [projects, actionItems, risks, documents, chargerGroups, financials]
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

      {mutationError && !createOpen && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {mutationError}
        </div>
      )}

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
            <ProjectCard
              key={project.id}
              project={project}
              rollup={rollupsByProjectId.get(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  rollup,
}: {
  project: Project
  rollup?: ProjectListRollup
}) {
  const financial = rollup?.financial ?? null
  const incentiveProgram = financial?.rebate_program ?? project.program
  const reservedIncentive = getReservedIncentive(financial)
  const showPriority = hasMeaningfulPriority(project.priority)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">{project.name}</CardTitle>
            <CardDescription className="mt-1">
              {project.customer ?? "No customer set"}
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              {project.project_stage && (
                <Badge variant="secondary">{project.project_stage}</Badge>
              )}
              {showPriority && (
                <Badge
                  variant={
                    project.priority === "Critical" || project.priority === "High"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {project.priority}
                </Badge>
              )}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{project.location ?? "No location set"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Target COD {formatNullable(project.target_cod)}</span>
            </div>
          </div>

          <div className="grid gap-2 rounded-lg bg-muted/40 p-3">
            <MetaRow
              label="Program / Incentive"
              value={incentiveProgram}
            />
            <MetaRow
              label="Estimated CAPEX / Budget"
              value={formatCurrency(financial?.estimated_total_cost ?? null)}
            />
            <MetaRow
              label="Reserved Incentive"
              value={formatCurrency(reservedIncentive)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <RollupPill
              icon={PlugZap}
              label="Chargers / Ports"
              value={`${rollup?.chargers ?? 0} / ${rollup?.ports ?? 0}`}
            />
            <RollupPill
              icon={ClipboardList}
              label="Open actions"
              value={rollup?.openActions ?? 0}
            />
            <RollupPill
              icon={ShieldAlert}
              label="High / Critical risks"
              value={rollup?.highRisks ?? 0}
            />
            <RollupPill
              icon={FileText}
              label="Documents"
              value={rollup?.documents ?? 0}
            />
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

function RollupPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
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
  const isAlert =
    status === "At Risk" || status === "At risk" || status === "Blocked"

  return (
    <Badge variant={isAlert ? "destructive" : "outline"}>
      {status ?? "Draft"}
    </Badge>
  )
}

function buildProjectListRollups(
  projects: Project[],
  actionItems: ActionItemWithProject[],
  risks: RiskWithProject[],
  documents: ProjectDocumentWithProject[],
  chargerGroups: ProjectChargerGroup[],
  financials: ProjectFinancial[]
) {
  const rollups = new Map<string, ProjectListRollup>()

  for (const project of projects) {
    rollups.set(project.id, {
      openActions: 0,
      highRisks: 0,
      documents: 0,
      chargers: 0,
      ports: 0,
      financial: null,
    })
  }

  for (const financial of financials) {
    if (financial.project_id) {
      const rollup = rollups.get(financial.project_id)
      if (rollup && !rollup.financial) {
        rollup.financial = financial
      }
    }
  }

  for (const action of actionItems) {
    if (action.project_id && action.status !== "Completed") {
      const rollup = rollups.get(action.project_id)
      if (rollup) {
        rollup.openActions += 1
      }
    }
  }

  for (const risk of risks) {
    if (
      risk.project_id &&
      risk.status !== "Closed" &&
      (risk.severity === "High" || risk.severity === "Critical")
    ) {
      const rollup = rollups.get(risk.project_id)
      if (rollup) {
        rollup.highRisks += 1
      }
    }
  }

  for (const document of documents) {
    if (document.project_id) {
      const rollup = rollups.get(document.project_id)
      if (rollup) {
        rollup.documents += 1
      }
    }
  }

  for (const group of chargerGroups) {
    if (group.project_id) {
      const rollup = rollups.get(group.project_id)
      if (rollup) {
        rollup.chargers += group.charger_count ?? 0
        rollup.ports += group.port_count ?? 0
      }
    }
  }

  return rollups
}

function formatNullable(value: string | null) {
  return value ?? "Not set"
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Not set"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getReservedIncentive(financial: ProjectFinancial | null) {
  if (!financial) {
    return null
  }

  const rebateAmount = financial.rebate_amount
  const grantAmount = financial.grant_amount

  if (rebateAmount === null && grantAmount === null) {
    return null
  }

  return (rebateAmount ?? 0) + (grantAmount ?? 0)
}

function hasMeaningfulPriority(priority: string | null) {
  if (!priority) {
    return false
  }

  return priority.trim().length > 0 && priority.toLowerCase() !== "not set"
}

function getErrorMessage(error: unknown) {
  if (isMissingSupabaseConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected project error."
}
