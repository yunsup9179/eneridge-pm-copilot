"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import {
  actionItemPriorities,
  actionItemStatuses,
} from "@/components/action-items/action-item-options"
import { ActionItemCard } from "@/components/action-items/action-item-card"
import { ActionItemFormSheet } from "@/components/action-items/action-item-form-sheet"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  completeActionItem,
  createActionItem,
  deleteActionItem,
  getActionItems,
  isMissingActionItemConfigError,
  updateActionItem,
  type ActionItem,
  type ActionItemCreateInput,
  type ActionItemWithProject,
} from "@/lib/data/action-items"
import {
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
} from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ActionItemsClient() {
  const [actionItems, setActionItems] = useState<ActionItemWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingActionItem, setEditingActionItem] =
    useState<ActionItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const [projectData, actionItemData] = await Promise.all([
        getProjects(),
        getActionItems(),
      ])
      setProjects(projectData)
      setActionItems(actionItemData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadData])

  const filteredActionItems = useMemo(
    () =>
      actionItems.filter((item) => {
        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter
        const matchesPriority =
          priorityFilter === "All" || item.priority === priorityFilter

        return matchesStatus && matchesPriority
      }),
    [actionItems, priorityFilter, statusFilter]
  )

  async function refreshActionItems() {
    const data = await getActionItems()
    setActionItems(data)
  }

  async function handleCreateActionItem(input: ActionItemCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createActionItem(input)
      await refreshActionItems()
      setCreateOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateActionItem(input: ActionItemCreateInput) {
    if (!editingActionItem) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await updateActionItem(editingActionItem.id, input)
      await refreshActionItems()
      setEditOpen(false)
      setEditingActionItem(null)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCompleteActionItem(actionItem: ActionItem) {
    setMutationError(null)

    try {
      await completeActionItem(actionItem.id)
      await refreshActionItems()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  async function handleDeleteActionItem(actionItem: ActionItem) {
    const confirmed = window.confirm(
      `Delete action item "${actionItem.title}"?`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await deleteActionItem(actionItem.id)
      await refreshActionItems()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  function openEdit(actionItem: ActionItem) {
    setEditingActionItem(actionItem)
    setMutationError(null)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Actions"
        title="Global action items"
        description="Live cross-project action register for internal owners, external parties, follow-up dates, source references, and completion tracking."
        actions={
          <ActionItemFormSheet
            open={createOpen}
            title="Create action item"
            description="Add a project-linked follow-up or responsibility."
            submitLabel="Create action item"
            projects={projects}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button disabled={projects.length === 0}>
                <Plus />
                New Action Item
              </Button>
            }
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateActionItem}
          />
        }
      />

      <ActionItemFormSheet
        open={editOpen}
        title="Edit action item"
        description="Update the action item record stored in Supabase."
        submitLabel="Save changes"
        projects={projects}
        actionItem={editingActionItem ?? undefined}
        isSubmitting={isSaving}
        error={mutationError}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setEditingActionItem(null)
          }
          if (open) {
            setMutationError(null)
          }
        }}
        onSubmit={handleUpdateActionItem}
      />

      {mutationError && !createOpen && !editOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {loadState === "loading" && <ActionItemsLoadingState />}

      {loadState === "error" && (
        <ActionItemsErrorState
          message={loadError ?? "Unable to load action items."}
          onRetry={() => void loadData()}
        />
      )}

      {loadState === "ready" && (
        <>
          <ActionItemFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
          />

          {actionItems.length === 0 ? (
            <ActionItemsEmptyState
              hasProjects={projects.length > 0}
              onCreate={() => setCreateOpen(true)}
            />
          ) : filteredActionItems.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No action items match these filters</CardTitle>
                <CardDescription>
                  Adjust the status or priority filter to see more records.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredActionItems.map((actionItem) => (
                <ActionItemCard
                  key={actionItem.id}
                  actionItem={actionItem}
                  showProject
                  onEdit={openEdit}
                  onComplete={handleCompleteActionItem}
                  onDelete={handleDeleteActionItem}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ActionItemFilters({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: {
  statusFilter: string
  priorityFilter: string
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
}) {
  return (
    <Card>
      <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="All">All statuses</option>
            {actionItemStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority-filter">Priority</Label>
          <Select
            id="priority-filter"
            value={priorityFilter}
            onChange={(event) => onPriorityChange(event.target.value)}
          >
            <option value="All">All priorities</option>
            {actionItemPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionItemsLoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <Card key={item}>
          <CardContent className="space-y-4 py-4">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="h-4 w-full max-w-2xl rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ActionItemsErrorState({
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
          {isMissingConfig
            ? "Supabase is not configured"
            : "Action items failed to load"}
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
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

function ActionItemsEmptyState({
  hasProjects,
  onCreate,
}: {
  hasProjects: boolean
  onCreate: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No action items yet</CardTitle>
        <CardDescription>
          {hasProjects
            ? "Create the first project-linked action item."
            : "Create a project before adding action items."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {hasProjects ? (
          <Button onClick={onCreate}>
            <Plus />
            New Action Item
          </Button>
        ) : (
          <Button asChild>
            <Link href="/projects">Go to projects</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (
    isMissingActionItemConfigError(error) ||
    isMissingSupabaseConfigError(error)
  ) {
    return error.message
  }

  return error instanceof Error
    ? error.message
    : "Unexpected action item error."
}
