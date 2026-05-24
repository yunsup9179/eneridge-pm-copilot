"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, BatteryCharging, Plus } from "lucide-react"

import { getChargerGroupWarnings } from "@/components/project-chargers/project-charger-calculations"
import { ProjectChargerGroupCard } from "@/components/project-chargers/project-charger-group-card"
import { ProjectChargerGroupFormSheet } from "@/components/project-chargers/project-charger-group-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Project } from "@/lib/data/projects"
import {
  createProjectChargerConnector,
  createProjectChargerGroup,
  deleteProjectChargerConnector,
  deleteProjectChargerGroup,
  getProjectChargerGroupsWithConnectorsByProjectId,
  isMissingProjectChargerConfigError,
  updateProjectChargerConnector,
  updateProjectChargerGroup,
  type ProjectChargerConnector,
  type ProjectChargerConnectorCreateInput,
  type ProjectChargerGroupCreateInput,
  type ProjectChargerGroupWithConnectors,
} from "@/lib/data/project-chargers"

type LoadState = "loading" | "ready" | "error"

export function ProjectChargers({ project }: { project: Project }) {
  const [chargerGroups, setChargerGroups] = useState<
    ProjectChargerGroupWithConnectors[]
  >([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] =
    useState<ProjectChargerGroupWithConnectors | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadChargerGroups = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getProjectChargerGroupsWithConnectorsByProjectId(
        project.id
      )
      setChargerGroups(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadChargerGroups()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadChargerGroups])

  async function refreshChargerGroups() {
    const data = await getProjectChargerGroupsWithConnectorsByProjectId(
      project.id
    )
    setChargerGroups(data)
  }

  async function handleCreateGroup(input: ProjectChargerGroupCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createProjectChargerGroup({
        ...input,
        project_id: project.id,
      })
      await refreshChargerGroups()
      setCreateOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateGroup(input: ProjectChargerGroupCreateInput) {
    if (!editingGroup) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await updateProjectChargerGroup(editingGroup.id, {
        ...input,
        project_id: project.id,
      })
      await refreshChargerGroups()
      setEditOpen(false)
      setEditingGroup(null)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteGroup(group: ProjectChargerGroupWithConnectors) {
    const confirmed = window.confirm(
      `Delete charger group "${group.charger_model ?? group.charger_category ?? "Unnamed charger group"}" and its connector rows?`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await deleteProjectChargerGroup(group.id)
      await refreshChargerGroups()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  async function handleCreateConnector(
    group: ProjectChargerGroupWithConnectors,
    input: ProjectChargerConnectorCreateInput
  ) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createProjectChargerConnector({
        ...input,
        charger_group_id: group.id,
      })
      await refreshChargerGroups()
    } catch (error) {
      setMutationError(getErrorMessage(error))
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateConnector(
    connector: ProjectChargerConnector,
    input: ProjectChargerConnectorCreateInput
  ) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await updateProjectChargerConnector(connector.id, {
        ...input,
        charger_group_id: connector.charger_group_id,
      })
      await refreshChargerGroups()
    } catch (error) {
      setMutationError(getErrorMessage(error))
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteConnector(connector: ProjectChargerConnector) {
    const confirmed = window.confirm(
      `Delete connector "${connector.connector_type ?? "Connector"}"?`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await deleteProjectChargerConnector(connector.id)
      await refreshChargerGroups()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  function openEditGroup(group: ProjectChargerGroupWithConnectors) {
    setEditingGroup(group)
    setMutationError(null)
    setEditOpen(true)
  }

  const totalChargers = chargerGroups.reduce(
    (sum, group) => sum + (group.charger_count ?? 0),
    0
  )
  const totalPorts = chargerGroups.reduce(
    (sum, group) => sum + (group.port_count ?? 0),
    0
  )
  const chargerMix = Array.from(
    new Set(
      chargerGroups
        .map((group) => group.charger_category)
        .filter((category): category is string => Boolean(category))
    )
  ).join(" + ")
  const connectorBreakdown = getConnectorBreakdown(chargerGroups)
  const hasCountWarnings = chargerGroups.some(
    (group) => getChargerGroupWarnings(group).length > 0
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Charger Groups</CardTitle>
            <CardDescription>
              Project-level charger configurations and connector details.
            </CardDescription>
          </div>
          <ProjectChargerGroupFormSheet
            open={createOpen}
            title="Create charger group"
            description={`Add a charger configuration linked to ${project.name}.`}
            submitLabel="Create charger group"
            project={project}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button>
                <Plus />
                New Charger Group
              </Button>
            }
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateGroup}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProjectChargerGroupFormSheet
          open={editOpen}
          title="Edit charger group"
          description="Update this charger configuration."
          submitLabel="Save changes"
          project={project}
          chargerGroup={editingGroup ?? undefined}
          isSubmitting={isSaving}
          error={mutationError}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) {
              setEditingGroup(null)
            }
            if (open) {
              setMutationError(null)
            }
          }}
          onSubmit={handleUpdateGroup}
        />

        {mutationError && !createOpen && !editOpen && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {mutationError}
          </div>
        )}

        {loadState === "ready" && chargerGroups.length > 0 && (
          <>
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Total Chargers" value={totalChargers.toString()} />
              <SummaryMetric label="Total Ports" value={totalPorts.toString()} />
              <SummaryMetric label="Charger Mix" value={chargerMix || "Not set"} />
              <SummaryMetric
                label="Connector Breakdown"
                value={connectorBreakdown || "Not set"}
              />
            </div>
            {hasCountWarnings && (
              <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>Some charger group counts need review.</span>
              </div>
            )}
          </>
        )}

        {loadState === "loading" && (
          <div className="space-y-3">
            {[0, 1].map((item) => (
              <div key={item} className="h-36 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Charger groups failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadChargerGroups()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && chargerGroups.length === 0 && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No charger groups</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Add the first charger group for this project.
            </p>
          </div>
        )}

        {loadState === "ready" &&
          chargerGroups.map((group) => (
            <ProjectChargerGroupCard
              key={group.id}
              chargerGroup={group}
              isSaving={isSaving}
              error={mutationError}
              onEditGroup={openEditGroup}
              onDeleteGroup={handleDeleteGroup}
              onCreateConnector={handleCreateConnector}
              onUpdateConnector={handleUpdateConnector}
              onDeleteConnector={handleDeleteConnector}
            />
          ))}
      </CardContent>
    </Card>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg bg-background/70 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <BatteryCharging className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-base font-semibold leading-snug">{value}</p>
      </div>
    </div>
  )
}

function getConnectorBreakdown(groups: ProjectChargerGroupWithConnectors[]) {
  const totalsByType = new Map<string, number>()

  for (const group of groups) {
    for (const connector of group.connectors) {
      if (connector.total_connector_count === null) {
        continue
      }

      const type = connector.connector_type ?? "Unspecified"
      totalsByType.set(
        type,
        (totalsByType.get(type) ?? 0) + connector.total_connector_count
      )
    }
  }

  return Array.from(totalsByType.entries())
    .map(([type, total]) => `${type}: ${total}`)
    .join(", ")
}

function getErrorMessage(error: unknown) {
  if (isMissingProjectChargerConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected charger error."
}
