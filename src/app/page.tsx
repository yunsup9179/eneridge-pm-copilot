import Link from "next/link"
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
  getProjectName,
  sampleActionItems,
  sampleDocuments,
  sampleProjects,
  sampleRisks,
} from "@/lib/sample-data"

const metrics = [
  {
    label: "Active projects",
    value: sampleProjects.length.toString(),
    detail: "Project-centered MVP register",
    icon: FolderKanban,
    color: "text-teal-700 bg-teal-50",
  },
  {
    label: "Open actions",
    value: "7",
    detail: "All actions linked to projects",
    icon: ClipboardList,
    color: "text-amber-700 bg-amber-50",
  },
  {
    label: "High risks",
    value: sampleRisks
      .filter((risk) => risk.severity === "High")
      .length.toString(),
    detail: "Utility, permitting, and site access",
    icon: AlertTriangle,
    color: "text-rose-700 bg-rose-50",
  },
  {
    label: "Documents",
    value: sampleDocuments.length.toString(),
    detail: "Ready for later AI extraction",
    icon: FileText,
    color: "text-cyan-700 bg-cyan-50",
  },
]

export default function DashboardPage() {
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.label} size="sm">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl">
                    {metric.value}
                  </CardTitle>
                </div>
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${metric.color}`}
                >
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
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
                  Initial Eneridge project register sample.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.city} / {project.utility} / {project.phase}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={
                        project.status === "At risk" ||
                        project.status === "Blocked"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      COD {project.targetCod}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              </Link>
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
              {sampleActionItems.map((action) => (
                <div key={action.id} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {action.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {getProjectName(action.projectId)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="h-fit shrink-0">
                    {action.dueDate}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk watchlist</CardTitle>
              <CardDescription>
                Project risks ready for the future AI review loop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleRisks.map((risk) => (
                <div key={risk.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{risk.category}</Badge>
                    <Badge
                      variant={
                        risk.severity === "High" ? "destructive" : "secondary"
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium">{risk.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getProjectName(risk.projectId)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
