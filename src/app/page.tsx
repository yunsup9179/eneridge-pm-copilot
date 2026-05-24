"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  Plus,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  getActionItems,
  isMissingActionItemConfigError,
  type ActionItemWithProject,
} from "@/lib/data/action-items"
import {
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
} from "@/lib/data/projects"
import {
  getRisks,
  isMissingRiskConfigError,
  type RiskWithProject,
} from "@/lib/data/risks"
import { sampleDocuments } from "@/lib/sample-data"

type LoadState = "loading" | "ready" | "error"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [actionItems, setActionItems] = useState<ActionItemWithProject[]>([])
  const [risks, setRisks] = useState<RiskWithProject[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoadState("loading")
    setLoadError(null)

    try {
      const [projectData, actionData, riskData] = await Promise.all([
        getProjects(),
        getActionItems(),
        getRisks(),
      ])

      setProjects(projectData)
      setActionItems(actionData)
      setRisks(riskData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }

  const openActions = useMemo(
    () => actionItems.filter((item) => item.status !== "Completed"),
    [actionItems]
  )
  const highRisks = useMemo(
    () => risks.filter((risk) => risk.severity === "High"),
    [risks]
  )
  const priorityProjects = projects.slice(0, 3)
  const upcomingActions = openActions.slice(0, 4)
  const watchlistRisks = risks.slice(0, 3)

  const metrics = [
    {
      label: "Active projects",
      value: projects.length.toString(),
      detail: "Live Supabase project register",
      icon: FolderKanban,
      color: "text-teal-700 bg-teal-50",
      href: "/projects",
    },
    {
      label: "Open actions",
      value: openActions.length.toString(),
      detail: "All actions linked to projects",
      icon: ClipboardList,
      color: "text-amber-700 bg-amber-50",
      href: "/actions",
    },
    {
      label: "High risks",
      value: highRisks.length.toString(),
      detail: "Utility, permitting, and site access",
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-50",
      href: "/risks",
    },
    {
      label: "Documents",
      value: sampleDocuments.length.toString(),
      detail: "Ready for later AI extraction",
      icon: FileText,
      color: "text-cyan-700 bg-cyan-50",
      href: "/documents",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Eneridge PM Copilot"
        title="Project command center"
        description="Project-centered workspace for EV charging infrastructure delivery, with every action, risk, document, contact, and future AI analysis tied back to a project."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/ai-workspace">
                <Bot />
                AI workspace
              </Link>
            </Button>
            <Button asChild>
              <Link href="/projects">
                <Plus />
                New project
              </Link>
            </Button>
          </>
        }
      />

      {loadState === "error" && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard failed to load</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={loadDashboard}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="block rounded-lg transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card size="sm" className="h-full">
                <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                  <div>
                    <CardDescription>{metric.label}</CardDescription>
                    <CardTitle className="mt-1 text-2xl">
                      {loadState === "loading" ? "..." : metric.value}
                    </CardTitle>
                  </div>
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg ${metric.color}`}
                  >
                    <Icon className="size-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Priority projects</CardTitle>
                <CardDescription>
                  Live projects from the Supabase register.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadState === "loading" && <DashboardListLoading />}
            {loadState === "ready" && priorityProjects.length === 0 && (
              <EmptyDashboardMessage
                title="No projects yet"
                description="Create a project to populate the dashboard."
                href="/projects"
                action="Go to projects"
              />
            )}
            {priorityProjects.map((project) => (
              <ProjectSummaryCard key={project.id} project={project} />
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming actions</CardTitle>
              <CardDescription>Near-term project follow-ups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadState === "loading" && <DashboardListLoading />}
              {loadState === "ready" && upcomingActions.length === 0 && (
                <EmptyDashboardMessage
                  title="No open actions"
                  description="Action items will appear here when added."
                  href="/actions"
                  action="View actions"
                />
              )}
              {upcomingActions.map((action) => (
                <Link
                  key={action.id}
                  href="/actions"
                  className="flex gap-3 rounded-lg transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {action.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {action.project?.name ?? "Unassigned project"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="h-fit shrink-0">
                    {formatNullable(action.due_date)}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk watchlist</CardTitle>
              <CardDescription>
                Active project risks ready for review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadState === "loading" && <DashboardListLoading />}
              {loadState === "ready" && watchlistRisks.length === 0 && (
                <EmptyDashboardMessage
                  title="No risks logged"
                  description="Risks will appear here when added."
                  href="/risks"
                  action="View risks"
                />
              )}
              {watchlistRisks.map((risk) => (
                <Link
                  key={risk.id}
                  href="/risks"
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{risk.category ?? "Risk"}</Badge>
                    <Badge
                      variant={
                        risk.severity === "High" ? "destructive" : "secondary"
                      }
                    >
                      {risk.severity ?? "Unscored"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium">{risk.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {risk.project?.name ?? "Unassigned project"}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function ProjectSummaryCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{project.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {[project.city, project.utility, project.phase]
              .filter(Boolean)
              .join(" / ") || "No project metadata set"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant={
              project.status === "At risk" || project.status === "Blocked"
                ? "destructive"
                : "outline"
            }
          >
            {project.status ?? "Draft"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            COD {formatNullable(project.target_cod)}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">Live</span>
        </div>
        <Progress value={getProjectProgress(project)} />
      </div>
    </Link>
  )
}

function DashboardListLoading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-lg border p-4">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyDashboardMessage({
  title,
  description,
  href,
  action,
}: {
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <Button className="mt-4" variant="outline" size="sm" asChild>
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  )
}

function getProjectProgress(project: Project) {
  if (project.status === "Completed") {
    return 100
  }

  if (project.status === "Blocked") {
    return 25
  }

  if (project.status === "At risk") {
    return 45
  }

  if (project.phase?.toLowerCase().includes("construction")) {
    return 70
  }

  if (project.phase?.toLowerCase().includes("design")) {
    return 50
  }

  return 35
}

function formatNullable(value: string | null) {
  return value ?? "Not set"
}

function getErrorMessage(error: unknown) {
  if (
    isMissingSupabaseConfigError(error) ||
    isMissingActionItemConfigError(error) ||
    isMissingRiskConfigError(error)
  ) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected dashboard error."
}
