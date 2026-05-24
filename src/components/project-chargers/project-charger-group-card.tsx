"use client"

import { useState } from "react"
import { Cable, Pencil, Plus, Trash2 } from "lucide-react"

import { ProjectChargerConnectorsForm } from "@/components/project-chargers/project-charger-connectors-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  ProjectChargerConnector,
  ProjectChargerConnectorCreateInput,
  ProjectChargerGroupWithConnectors,
} from "@/lib/data/project-chargers"

type ProjectChargerGroupCardProps = {
  chargerGroup: ProjectChargerGroupWithConnectors
  isSaving?: boolean
  error?: string | null
  onEditGroup: (chargerGroup: ProjectChargerGroupWithConnectors) => void
  onDeleteGroup: (chargerGroup: ProjectChargerGroupWithConnectors) => void
  onCreateConnector: (
    chargerGroup: ProjectChargerGroupWithConnectors,
    input: ProjectChargerConnectorCreateInput
  ) => Promise<void>
  onUpdateConnector: (
    connector: ProjectChargerConnector,
    input: ProjectChargerConnectorCreateInput
  ) => Promise<void>
  onDeleteConnector: (connector: ProjectChargerConnector) => void
}

export function ProjectChargerGroupCard({
  chargerGroup,
  isSaving = false,
  error,
  onEditGroup,
  onDeleteGroup,
  onCreateConnector,
  onUpdateConnector,
  onDeleteConnector,
}: ProjectChargerGroupCardProps) {
  const [connectorFormOpen, setConnectorFormOpen] = useState(false)
  const [editingConnector, setEditingConnector] =
    useState<ProjectChargerConnector | null>(null)

  async function handleConnectorSubmit(
    input: ProjectChargerConnectorCreateInput
  ) {
    if (editingConnector) {
      await onUpdateConnector(editingConnector, input)
    } else {
      await onCreateConnector(chargerGroup, input)
    }

    setConnectorFormOpen(false)
    setEditingConnector(null)
  }

  function openCreateConnector() {
    setEditingConnector(null)
    setConnectorFormOpen(true)
  }

  function openEditConnector(connector: ProjectChargerConnector) {
    setEditingConnector(connector)
    setConnectorFormOpen(true)
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {chargerGroup.charger_model ?? "Unnamed charger group"}
            </h3>
            <Badge variant="outline">
              {chargerGroup.charger_category ?? "Category not set"}
            </Badge>
            <Badge variant="secondary">
              {formatNumber(chargerGroup.power_rating_kw)} kW
            </Badge>
          </div>
          {chargerGroup.notes && (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {chargerGroup.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={openCreateConnector}>
            <Plus />
            Connector
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditGroup(chargerGroup)}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteGroup(chargerGroup)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Physical chargers" value={formatNumber(chargerGroup.charger_count)} />
        <Meta label="Total ports" value={formatNumber(chargerGroup.port_count)} />
        <Meta
          label="Port configuration"
          value={chargerGroup.port_configuration ?? "Not set"}
        />
        <Meta label="Connectors" value={chargerGroup.connectors.length.toString()} />
      </div>

      <div className="mt-4 space-y-3 rounded-lg bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Connector details</p>
            <p className="text-xs text-muted-foreground">
              Connector types and counts for this charger group.
            </p>
          </div>
          <Cable className="size-4 text-muted-foreground" />
        </div>

        {connectorFormOpen && (
          <ProjectChargerConnectorsForm
            key={`${editingConnector?.id ?? "new"}-${chargerGroup.id}`}
            chargerGroupId={chargerGroup.id}
            connector={editingConnector ?? undefined}
            submitLabel={editingConnector ? "Save connector" : "Add connector"}
            isSubmitting={isSaving}
            error={error}
            onCancel={() => {
              setConnectorFormOpen(false)
              setEditingConnector(null)
            }}
            onSubmit={handleConnectorSubmit}
          />
        )}

        {chargerGroup.connectors.length === 0 && !connectorFormOpen && (
          <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            No connector rows yet.
          </div>
        )}

        {chargerGroup.connectors.map((connector) => (
          <div
            key={connector.id}
            className="rounded-lg border bg-background p-3 text-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {connector.connector_type ?? "Connector"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(connector.connector_count_per_charger)} per charger
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(connector.total_connector_count)} total
                  </span>
                </div>
                {connector.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {connector.notes}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditConnector(connector)}
                >
                  <Pencil />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteConnector(connector)}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  )
}

function formatNumber(value: number | null) {
  return value === null ? "Not set" : value.toString()
}

