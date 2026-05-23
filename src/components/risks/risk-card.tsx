"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { CheckCircle2, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Risk, RiskWithProject } from "@/lib/data/risks"

type RiskCardProps = {
  risk: Risk | RiskWithProject
  showProject?: boolean
  onEdit: (risk: Risk) => void
  onClose: (risk: Risk) => void
  onDelete: (risk: Risk) => void
}

export function RiskCard({
  risk,
  showProject = false,
  onEdit,
  onClose,
  onDelete,
}: RiskCardProps) {
  const project = "project" in risk ? risk.project : null
  const isClosed = risk.status === "Closed"

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {risk.category ?? "Uncategorized risk"}
            </h3>
            <StatusBadge status={risk.status} />
            <SeverityBadge severity={risk.severity} />
            {risk.ai_detected && <Badge variant="secondary">AI detected</Badge>}
          </div>
          {showProject && (
            <p className="text-xs text-muted-foreground">
              Project:{" "}
              {project && risk.project_id ? (
                <Link
                  href={`/projects/${risk.project_id}`}
                  className="font-medium hover:text-foreground"
                >
                  {project.name}
                </Link>
              ) : (
                "Not linked"
              )}
            </p>
          )}
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {risk.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClose(risk)}
            disabled={isClosed}
          >
            <CheckCircle2 />
            Close
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(risk)}>
            <Pencil />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(risk)}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Impact" value={risk.impact} />
        <Meta label="Likelihood" value={risk.likelihood} />
        <Meta label="Owner" value={risk.owner} />
        <Meta label="Status" value={risk.status} />
      </div>

      {risk.mitigation_plan && (
        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Mitigation plan</p>
          <p className="mt-1 leading-6">{risk.mitigation_plan}</p>
        </div>
      )}
    </div>
  )
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex min-w-0 items-center gap-1 font-medium">
        {icon}
        <span className="truncate">{value ?? "Not set"}</span>
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const variant =
    status === "Closed"
      ? "secondary"
      : status === "Mitigating"
        ? "outline"
        : "destructive"

  return <Badge variant={variant}>{status ?? "Open"}</Badge>
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const variant =
    severity === "Critical" || severity === "High"
      ? "destructive"
      : "secondary"

  return <Badge variant={variant}>{severity ?? "Medium"}</Badge>
}
