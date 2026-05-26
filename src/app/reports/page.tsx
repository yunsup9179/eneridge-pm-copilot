"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, RefreshCw } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  getActionItems,
  type ActionItemWithProject,
} from "@/lib/data/action-items"
import {
  getDocuments,
  type ProjectDocumentWithProject,
} from "@/lib/data/documents"
import {
  getProjectChargerGroups,
  type ProjectChargerGroup,
} from "@/lib/data/project-chargers"
import { getProjects, type Project } from "@/lib/data/projects"
import { getRisks, type RiskWithProject } from "@/lib/data/risks"

type LoadState = "loading" | "ready" | "error"

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [actionItems, setActionItems] = useState<ActionItemWithProject[]>([])
  const [risks, setRisks] = useState<RiskWithProject[]>([])
  const [documents, setDocuments] = useState<ProjectDocumentWithProject[]>([])
  const [chargerGroups, setChargerGroups] = useState<ProjectChargerGroup[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  useEffect(() => {
    void loadReportData()
  }, [])

  async function loadReportData() {
    setLoadState("loading")
    setLoadError(null)
    setCopyStatus(null)

    try {
      const [projectData, actionData, riskData, documentData, chargerData] =
        await Promise.all([
          getProjects(),
          getActionItems(),
          getRisks(),
          getDocuments(),
          getProjectChargerGroups(),
        ])

      setProjects(projectData)
      setActionItems(actionData)
      setRisks(riskData)
      setDocuments(documentData)
      setChargerGroups(chargerData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Reports failed to load.")
      setLoadState("error")
    }
  }

  const report = useMemo(
    () =>
      buildWeeklyReport({
        projects,
        actionItems,
        risks,
        documents,
        chargerGroups,
      }),
    [projects, actionItems, risks, documents, chargerGroups]
  )

  const reportMetrics = useMemo(() => buildReportMetrics(report), [report])

  async function copyReport() {
    await navigator.clipboard.writeText(report.markdown)
    setCopyStatus("Copied")
    window.setTimeout(() => setCopyStatus(null), 1600)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Weekly report generator"
        description="Generate a deterministic weekly PMO snapshot from live project, action, risk, document, and charger data."
        actions={
          <>
            <Button variant="outline" onClick={() => void loadReportData()}>
              <RefreshCw />
              Refresh
            </Button>
            <Button onClick={copyReport} disabled={loadState !== "ready"}>
              <Copy />
              {copyStatus ?? "Copy report"}
            </Button>
          </>
        }
      />

      {loadState === "error" && (
        <Card>
          <CardHeader>
            <CardTitle>Reports failed to load</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void loadReportData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl">
                {loadState === "loading" ? "..." : metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Report Output</CardTitle>
                <CardDescription>
                  Markdown-ready text for weekly internal updates.
                </CardDescription>
              </div>
              <Badge variant="outline">Deterministic</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadState === "loading" ? (
              <div className="h-[30rem] rounded-lg bg-muted" />
            ) : (
              <Textarea
                readOnly
                value={report.markdown}
                className="min-h-[30rem] resize-y font-mono text-sm leading-6"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Sections</CardTitle>
            <CardDescription>
              Included sections for the MVP weekly cadence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Executive Summary",
              "Active Projects",
              "Watchlist / Risk Projects",
              "Overdue Action Items",
              "Key Risks",
              "Documents Needing Review",
              "Upcoming Milestones",
              "Suggested Follow-ups",
            ].map((section) => (
              <div
                key={section}
                className="rounded-lg border bg-muted/20 px-3 py-2 text-sm font-medium"
              >
                {section}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function buildWeeklyReport({
  projects,
  actionItems,
  risks,
  documents,
  chargerGroups,
}: {
  projects: Project[]
  actionItems: ActionItemWithProject[]
  risks: RiskWithProject[]
  documents: ProjectDocumentWithProject[]
  chargerGroups: ProjectChargerGroup[]
}) {
  const activeProjects = projects.filter(isActiveProject)
  const openActions = actionItems.filter((item) => item.status !== "Completed")
  const overdueActions = openActions.filter((item) => isPastDue(item.due_date))
  const keyRisks = risks.filter(
    (risk) =>
      risk.status !== "Closed" &&
      (risk.severity === "High" || risk.severity === "Critical")
  )
  const reviewDocuments = documents.filter(
    (document) => document.status === "Needs Review"
  )
  const upcomingMilestones = buildUpcomingMilestones(projects)
  const totalChargers = sumNumbers(chargerGroups.map((group) => group.charger_count))
  const totalPorts = sumNumbers(chargerGroups.map((group) => group.port_count))
  const watchlistProjectIds = new Set(
    keyRisks
      .map((risk) => risk.project_id)
      .filter((projectId): projectId is string => Boolean(projectId))
  )
  const watchlistProjects = activeProjects.filter((project) =>
    watchlistProjectIds.has(project.id)
  )

  const markdown = [
    "# Eneridge Weekly Project Report",
    "",
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
    "## Executive Summary",
    `- Active projects: ${activeProjects.length}`,
    `- Open action items: ${openActions.length}`,
    `- Overdue action items: ${overdueActions.length}`,
    `- High / critical risks: ${keyRisks.length}`,
    `- Documents needing review: ${reviewDocuments.length}`,
    `- Charger deployment footprint: ${totalChargers} chargers / ${totalPorts} ports`,
    "",
    "## Active Projects",
    formatProjectLines(activeProjects),
    "",
    "## Watchlist / Risk Projects",
    formatProjectLines(watchlistProjects),
    "",
    "## Overdue Action Items",
    formatActionLines(overdueActions),
    "",
    "## Key Risks",
    formatRiskLines(keyRisks),
    "",
    "## Documents Needing Review",
    formatDocumentLines(reviewDocuments),
    "",
    "## Upcoming Milestones",
    formatMilestoneLines(upcomingMilestones),
    "",
    "## Suggested Follow-ups",
    formatFollowUpLines({
      overdueActions,
      keyRisks,
      reviewDocuments,
      upcomingMilestones,
    }),
  ].join("\n")

  return {
    markdown,
    activeProjects,
    openActions,
    overdueActions,
    keyRisks,
    reviewDocuments,
    upcomingMilestones,
  }
}

function buildReportMetrics(report: ReturnType<typeof buildWeeklyReport>) {
  return [
    {
      label: "Active projects",
      value: report.activeProjects.length.toString(),
      detail: "Not completed or archived",
    },
    {
      label: "Open actions",
      value: report.openActions.length.toString(),
      detail: "Incomplete action items",
    },
    {
      label: "High / critical risks",
      value: report.keyRisks.length.toString(),
      detail: "Open risks needing attention",
    },
    {
      label: "Docs needing review",
      value: report.reviewDocuments.length.toString(),
      detail: "Document status is Needs Review",
    },
  ]
}

function formatProjectLines(projects: Project[]) {
  if (projects.length === 0) {
    return "- None."
  }

  return projects
    .slice(0, 12)
    .map(
      (project) =>
        `- ${project.name} (${project.status ?? "Draft"}, ${project.phase ?? "No phase"}) - COD ${project.target_cod ?? "not set"}`
    )
    .join("\n")
}

function formatActionLines(actionItems: ActionItemWithProject[]) {
  if (actionItems.length === 0) {
    return "- None."
  }

  return actionItems
    .slice(0, 12)
    .map(
      (item) =>
        `- ${item.title} - ${item.project?.name ?? "Unassigned project"} - due ${item.due_date ?? "not set"}`
    )
    .join("\n")
}

function formatRiskLines(risks: RiskWithProject[]) {
  if (risks.length === 0) {
    return "- None."
  }

  return risks
    .slice(0, 12)
    .map(
      (risk) =>
        `- ${risk.severity ?? "Unscored"}: ${risk.description} - ${risk.project?.name ?? "Unassigned project"}`
    )
    .join("\n")
}

function formatDocumentLines(documents: ProjectDocumentWithProject[]) {
  if (documents.length === 0) {
    return "- None."
  }

  return documents
    .slice(0, 12)
    .map(
      (document) =>
        `- ${document.file_name} - ${document.project?.name ?? "Unassigned project"} - ${document.document_type ?? "Document"}`
    )
    .join("\n")
}

function formatMilestoneLines(
  milestones: { projectName: string; label: string; date: string }[]
) {
  if (milestones.length === 0) {
    return "- None."
  }

  return milestones
    .slice(0, 12)
    .map((milestone) => `- ${milestone.date}: ${milestone.projectName} - ${milestone.label}`)
    .join("\n")
}

function formatFollowUpLines({
  overdueActions,
  keyRisks,
  reviewDocuments,
  upcomingMilestones,
}: {
  overdueActions: ActionItemWithProject[]
  keyRisks: RiskWithProject[]
  reviewDocuments: ProjectDocumentWithProject[]
  upcomingMilestones: { projectName: string; label: string; date: string }[]
}) {
  const followUps = [
    ...overdueActions.slice(0, 5).map((item) => `Follow up on overdue action: ${item.title}.`),
    ...keyRisks.slice(0, 5).map((risk) => `Review mitigation for ${risk.severity ?? "unscored"} risk: ${risk.description}.`),
    ...reviewDocuments.slice(0, 5).map((document) => `Review document: ${document.file_name}.`),
    ...upcomingMilestones.slice(0, 5).map((milestone) => `Confirm milestone readiness: ${milestone.projectName} ${milestone.label} on ${milestone.date}.`),
  ]

  if (followUps.length === 0) {
    return "- No urgent follow-ups generated from current data."
  }

  return followUps.slice(0, 12).map((item) => `- ${item}`).join("\n")
}

function buildUpcomingMilestones(projects: Project[]) {
  const milestones: { projectName: string; label: string; date: string }[] = []

  for (const project of projects) {
    if (project.target_construction_start && !isPastDue(project.target_construction_start)) {
      milestones.push({
        projectName: project.name,
        label: "Target construction start",
        date: project.target_construction_start,
      })
    }

    if (project.target_cod && !isPastDue(project.target_cod)) {
      milestones.push({
        projectName: project.name,
        label: "Target COD",
        date: project.target_cod,
      })
    }
  }

  return milestones.sort((a, b) => a.date.localeCompare(b.date))
}

function sumNumbers(values: (number | null)[]): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0)
}

function isActiveProject(project: Project) {
  const status = project.status?.toLowerCase()
  return status !== "completed" && status !== "archived" && status !== "cancelled"
}

function isPastDue(value: string | null) {
  if (!value) {
    return false
  }

  const dueDate = new Date(`${value}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}
