"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { RiskCard } from "@/components/risks/risk-card"
import { RiskFormSheet } from "@/components/risks/risk-form-sheet"
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
  closeRisk,
  createRisk,
  deleteRisk,
  getRisksByProjectId,
  isMissingRiskConfigError,
  updateRisk,
  type Risk,
  type RiskCreateInput,
} from "@/lib/data/risks"
import type { Project } from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectRisks({ project }: { project: Project }) {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadRisks = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getRisksByProjectId(project.id)
      setRisks(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRisks()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadRisks])

  async function refreshRisks() {
    const data = await getRisksByProjectId(project.id)
    setRisks(data)
  }

  async function handleCreateRisk(input: RiskCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createRisk({
        ...input,
        project_id: project.id,
      })
      await refreshRisks()
      setCreateOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateRisk(input: RiskCreateInput) {
    if (!editingRisk) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await updateRisk(editingRisk.id, {
        ...input,
        project_id: project.id,
      })
      await refreshRisks()
      setEditOpen(false)
      setEditingRisk(null)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCloseRisk(risk: Risk) {
    setMutationError(null)

    try {
      await closeRisk(risk.id)
      await refreshRisks()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  async function handleDeleteRisk(risk: Risk) {
    const confirmed = window.confirm(
      `Delete risk "${risk.category ?? risk.description}"?`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await deleteRisk(risk.id)
      await refreshRisks()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  function openEdit(risk: Risk) {
    setEditingRisk(risk)
    setMutationError(null)
    setEditOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Risks</CardTitle>
            <CardDescription>
              Project-linked risk register with severity, ownership, and
              mitigation tracking.
            </CardDescription>
          </div>
          <RiskFormSheet
            open={createOpen}
            title="Create project risk"
            description={`Add a risk linked to ${project.name}.`}
            submitLabel="Create risk"
            projects={[project]}
            lockedProjectId={project.id}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button>
                <Plus />
                New Risk
              </Button>
            }
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateRisk}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <RiskFormSheet
          open={editOpen}
          title="Edit risk"
          description="Update this project risk."
          submitLabel="Save changes"
          projects={[project]}
          lockedProjectId={project.id}
          risk={editingRisk ?? undefined}
          isSubmitting={isSaving}
          error={mutationError}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) {
              setEditingRisk(null)
            }
            if (open) {
              setMutationError(null)
            }
          }}
          onSubmit={handleUpdateRisk}
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
            <p className="text-sm font-medium">Risks failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadRisks()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && risks.length === 0 && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No risks</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Add the first risk for this project.
            </p>
          </div>
        )}

        {loadState === "ready" &&
          risks.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              onEdit={openEdit}
              onClose={handleCloseRisk}
              onDelete={handleDeleteRisk}
            />
          ))}
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (isMissingRiskConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected risk error."
}
