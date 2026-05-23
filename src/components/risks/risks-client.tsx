"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { RiskCard } from "@/components/risks/risk-card"
import { RiskFormSheet } from "@/components/risks/risk-form-sheet"
import {
  riskSeverityValues,
  riskStatuses,
} from "@/components/risks/risk-options"
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
  closeRisk,
  createRisk,
  deleteRisk,
  getRisks,
  isMissingRiskConfigError,
  updateRisk,
  type Risk,
  type RiskCreateInput,
  type RiskWithProject,
} from "@/lib/data/risks"
import {
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
} from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function RisksClient() {
  const [risks, setRisks] = useState<RiskWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const [projectData, riskData] = await Promise.all([
        getProjects(),
        getRisks(),
      ])
      setProjects(projectData)
      setRisks(riskData)
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

  const filteredRisks = useMemo(
    () =>
      risks.filter((risk) => {
        const matchesSeverity =
          severityFilter === "All" || risk.severity === severityFilter
        const matchesStatus =
          statusFilter === "All" || risk.status === statusFilter

        return matchesSeverity && matchesStatus
      }),
    [risks, severityFilter, statusFilter]
  )

  async function refreshRisks() {
    const data = await getRisks()
    setRisks(data)
  }

  async function handleCreateRisk(input: RiskCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createRisk(input)
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
      await updateRisk(editingRisk.id, input)
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Risks"
        title="Global risk register"
        description="Live cross-project risk tracking for utility, permitting, grant compliance, cost, design, contract, customer, and construction issues."
        actions={
          <RiskFormSheet
            open={createOpen}
            title="Create risk"
            description="Add a project-linked risk with severity, owner, and mitigation context."
            submitLabel="Create risk"
            projects={projects}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button disabled={projects.length === 0}>
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
        }
      />

      <RiskFormSheet
        open={editOpen}
        title="Edit risk"
        description="Update the risk record stored in Supabase."
        submitLabel="Save changes"
        projects={projects}
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

      {loadState === "loading" && <RisksLoadingState />}

      {loadState === "error" && (
        <RisksErrorState
          message={loadError ?? "Unable to load risks."}
          onRetry={() => void loadData()}
        />
      )}

      {loadState === "ready" && (
        <>
          <RiskFilters
            severityFilter={severityFilter}
            statusFilter={statusFilter}
            onSeverityChange={setSeverityFilter}
            onStatusChange={setStatusFilter}
          />

          {risks.length === 0 ? (
            <RisksEmptyState
              hasProjects={projects.length > 0}
              onCreate={() => setCreateOpen(true)}
            />
          ) : filteredRisks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No risks match these filters</CardTitle>
                <CardDescription>
                  Adjust the severity or status filter to see more records.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  showProject
                  onEdit={openEdit}
                  onClose={handleCloseRisk}
                  onDelete={handleDeleteRisk}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RiskFilters({
  severityFilter,
  statusFilter,
  onSeverityChange,
  onStatusChange,
}: {
  severityFilter: string
  statusFilter: string
  onSeverityChange: (value: string) => void
  onStatusChange: (value: string) => void
}) {
  return (
    <Card>
      <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="severity-filter">Severity</Label>
          <Select
            id="severity-filter"
            value={severityFilter}
            onChange={(event) => onSeverityChange(event.target.value)}
          >
            <option value="All">All severities</option>
            {riskSeverityValues.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="risk-status-filter">Status</Label>
          <Select
            id="risk-status-filter"
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="All">All statuses</option>
            {riskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function RisksLoadingState() {
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

function RisksErrorState({
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
          {isMissingConfig ? "Supabase is not configured" : "Risks failed to load"}
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

function RisksEmptyState({
  hasProjects,
  onCreate,
}: {
  hasProjects: boolean
  onCreate: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No risks yet</CardTitle>
        <CardDescription>
          {hasProjects
            ? "Create the first project-linked risk."
            : "Create a project before adding risks."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {hasProjects ? (
          <Button onClick={onCreate}>
            <Plus />
            New Risk
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
  if (isMissingRiskConfigError(error) || isMissingSupabaseConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected risk error."
}
