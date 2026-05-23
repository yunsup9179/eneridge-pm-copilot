"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { CalendarDays, CheckCircle2, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  ActionItem,
  ActionItemWithProject,
} from "@/lib/data/action-items"

type ActionItemCardProps = {
  actionItem: ActionItem | ActionItemWithProject
  showProject?: boolean
  onEdit: (actionItem: ActionItem) => void
  onComplete: (actionItem: ActionItem) => void
  onDelete: (actionItem: ActionItem) => void
}

export function ActionItemCard({
  actionItem,
  showProject = false,
  onEdit,
  onComplete,
  onDelete,
}: ActionItemCardProps) {
  const project =
    "project" in actionItem ? actionItem.project : null
  const isCompleted = actionItem.status === "Completed"

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{actionItem.title}</h3>
            <StatusBadge status={actionItem.status} />
            <PriorityBadge priority={actionItem.priority} />
          </div>
          {showProject && (
            <p className="text-xs text-muted-foreground">
              Project:{" "}
              {project && actionItem.project_id ? (
                <Link
                  href={`/projects/${actionItem.project_id}`}
                  className="font-medium hover:text-foreground"
                >
                  {project.name}
                </Link>
              ) : (
                "Not linked"
              )}
            </p>
          )}
          {actionItem.description && (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {actionItem.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(actionItem)}
            disabled={isCompleted}
          >
            <CheckCircle2 />
            Complete
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(actionItem)}>
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(actionItem)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Assigned to" value={actionItem.assigned_to} />
        <Meta label="External party" value={actionItem.external_party} />
        <Meta
          label="Due date"
          value={actionItem.due_date}
          icon={<CalendarDays className="size-4" />}
        />
        <Meta
          label="Follow-up"
          value={actionItem.follow_up_date}
          icon={<CalendarDays className="size-4" />}
        />
      </div>

      {(actionItem.source_type ||
        actionItem.source_reference ||
        actionItem.notes) && (
        <div className="mt-4 grid gap-3 rounded-lg bg-muted/40 p-3 text-sm md:grid-cols-3">
          <Meta label="Source type" value={actionItem.source_type} />
          <Meta label="Source reference" value={actionItem.source_reference} />
          <Meta label="Notes" value={actionItem.notes} />
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
    status === "Completed"
      ? "secondary"
      : status === "Blocked"
        ? "destructive"
        : "outline"

  return <Badge variant={variant}>{status ?? "Open"}</Badge>
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const variant =
    priority === "Critical" || priority === "High" ? "destructive" : "secondary"

  return <Badge variant={variant}>{priority ?? "Medium"}</Badge>
}
