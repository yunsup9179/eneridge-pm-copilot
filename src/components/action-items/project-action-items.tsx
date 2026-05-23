"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { ActionItemCard } from "@/components/action-items/action-item-card"
import { ActionItemFormSheet } from "@/components/action-items/action-item-form-sheet"
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
  completeActionItem,
  createActionItem,
  deleteActionItem,
  getActionItemsByProjectId,
  isMissingActionItemConfigError,
  updateActionItem,
  type ActionItem,
  type ActionItemCreateInput,
} from "@/lib/data/action-items"
import type { Project } from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectActionItems({ project }: { project: Project }) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingActionItem, setEditingActionItem] =
    useState<ActionItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadActionItems = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getActionItemsByProjectId(project.id)
      setActionItems(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadActionItems()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadActionItems])

  async function refreshActionItems() {
    const data = await getActionItemsByProjectId(project.id)
    setActionItems(data)
  }

  async function handleCreateActionItem(input: ActionItemCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createActionItem({
        ...input,
        project_id: project.id,
      })
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
      await updateActionItem(editingActionItem.id, {
        ...input,
        project_id: project.id,
      })
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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              Project-linked follow-ups, responsibilities, and external party
              requests.
            </CardDescription>
          </div>
          <ActionItemFormSheet
            open={createOpen}
            title="Create project action item"
            description={`Add a follow-up linked to ${project.name}.`}
            submitLabel="Create action item"
            projects={[project]}
            lockedProjectId={project.id}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActionItemFormSheet
          open={editOpen}
          title="Edit action item"
          description="Update this project action item."
          submitLabel="Save changes"
          projects={[project]}
          lockedProjectId={project.id}
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

        {loadState === "loading" && (
          <div className="space-y-3">
            {[0, 1].map((item) => (
              <div key={item} className="h-24 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Action items failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadActionItems()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && actionItems.length === 0 && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No action items</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Add the first action item for this project.
            </p>
          </div>
        )}

        {loadState === "ready" &&
          actionItems.map((actionItem) => (
            <ActionItemCard
              key={actionItem.id}
              actionItem={actionItem}
              onEdit={openEdit}
              onComplete={handleCompleteActionItem}
              onDelete={handleDeleteActionItem}
            />
          ))}
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (isMissingActionItemConfigError(error)) {
    return error.message
  }

  return error instanceof Error
    ? error.message
    : "Unexpected action item error."
}
