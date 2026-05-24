"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  BatteryCharging,
  CalendarDays,
  ClipboardList,
  GitBranch,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getActionItemsByProjectId } from "@/lib/data/action-items"
import { getProjectChargerGroupsWithConnectorsByProjectId } from "@/lib/data/project-chargers"
import type { Project } from "@/lib/data/projects"
import { getRisksByProjectId } from "@/lib/data/risks"

type LoadState = "loading" | "ready" | "error"

type SummaryCounts = {
  totalChargers: number
  totalPorts: number
  openActions: number
  openRisks: number
  highRisks: number
}

export function ProjectDetailSummary({ project }: { project: Project }) {
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [counts, setCounts] = useState<SummaryCounts>({
    totalChargers: 0,
    totalPorts: 0,
    openActions: 0,
    openRisks: 0,
    highRisks: 0,
  })

  const loadSummary = useCallback(async () => {
    setLoadState("loading")
    setLoadError(null)

    try {
      const [chargerGroups, actionItems, risks] = await Promise.all([
        getProjectChargerGroupsWithConnectorsByProjectId(project.id),
        getActionItemsByProjectId(project.id),
        getRisksByProjectId(project.id),
      ])

      const openRisks = risks.filter((risk) => risk.status !== "Closed")

      setCounts({
        totalChargers: chargerGroups.reduce(
          (sum, group) => sum + (group.charger_count ?? 0),
          0
        ),
        totalPorts: chargerGroups.reduce(
          (sum, group) => sum + (group.port_count ?? 0),
          0
        ),
        openActions: actionItems.filter(
          (item) => item.status !== "Completed"
        ).length,
        openRisks: openRisks.length,
        highRisks: openRisks.filter((risk) => risk.severity === "High").length,
      })
      setLoadState("ready")
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Summary failed.")
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadSummary()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadSummary])

  const isLoading = loadState === "loading"

  return (
    <Card className="border-l-4 border-l-primary/60">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Project Snapshot</CardTitle>
            <CardDescription>
              Live delivery, charger, action, and risk rollup for this project.
            </CardDescription>
          </div>
          {loadState === "error" && (
            <Badge variant="destructive">{loadError ?? "Summary unavailable"}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <SummaryTile label="Status" value={project.status ?? "Draft"} />
          <SummaryTile label="Phase" value={project.phase ?? "Not set"} />
          <SummaryTile
            label="Total Chargers"
            value={isLoading ? "..." : counts.totalChargers.toString()}
            icon={<BatteryCharging className="size-4" />}
          />
          <SummaryTile
            label="Total Ports"
            value={isLoading ? "..." : counts.totalPorts.toString()}
            icon={<BatteryCharging className="size-4" />}
          />
          <SummaryTile
            label="Open Action Items"
            value={isLoading ? "..." : counts.openActions.toString()}
            icon={<ClipboardList className="size-4" />}
          />
          <SummaryTile
            label="Open / High Risks"
            value={
              isLoading ? "..." : `${counts.openRisks} / ${counts.highRisks}`
            }
            icon={<AlertTriangle className="size-4" />}
          />
          <SummaryTile
            label="Target COD"
            value={project.target_cod ?? "Not set"}
            icon={<CalendarDays className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon ?? <GitBranch className="size-4" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold leading-tight">{value}</p>
    </div>
  )
}
