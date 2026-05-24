"use client"

import { useState } from "react"
import { AlertTriangle, Cable, Pencil, Plus, Trash2 } from "lucide-react"

import {
  getChargerGroupWarnings,
  getConnectorTotal,
  getExpectedPortLabel,
} from "@/components/project-chargers/project-charger-calculations"
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
  const connectorTotal = getConnectorTotal(chargerGroup)
  const expectedPortLabel = getExpectedPortLabel({
    chargerCount: chargerGroup.charger_count,
    portConfiguration: chargerGroup.port_configuration,
  })
  const warnings = getChargerGroupWarnings(chargerGroup)

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
    <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-tight sm:text-lg">
              {chargerGroup.charger_model ?? "Unnamed charger group"}
            </h3>
            <Badge variant="outline">
              {chargerGroup.charger_category ?? "Category not set"}
            </Badge>
            <Badge variant="secondary">
              {chargerGroup.power_rating_kw === null
                ? "Rated power not set"
                : `${formatNumber(chargerGroup.power_rating_kw)} kW per charger`}
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

      <div className="mt-5 grid gap-3 border-t pt-5 text-sm sm:grid-cols-2 xl:grid-cols-5">
        <Meta
          label="Rated Power per Charger"
          value={
            chargerGroup.power_rating_kw === null
              ? "Not set"
              : `${formatNumber(chargerGroup.power_rating_kw)} kW`
          }
        />
        <Meta
          label="Physical Chargers"
          value={formatNumber(chargerGroup.charger_count)}
        />
        <Meta
          label="Entered Total Ports"
          value={formatNumber(chargerGroup.port_count)}
        />
        <Meta label="Connector Total" value={formatNumber(connectorTotal)} />
        <Meta label="Expected Ports" value={expectedPortLabel} />
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {warnings.map((warning) => (
            <div key={warning} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
        <Meta
          label="Port Configuration"
          value={chargerGroup.port_configuration ?? "Not set"}
        />
        <Meta
          label="Connectors"
          value={chargerGroup.connectors.length.toString()}
        />
      </div>

      <div className="mt-4 space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">Connector details</p>
            <p className="text-sm text-muted-foreground">
              Connector types and counts for this charger group.
            </p>
          </div>
          <Cable className="size-4 text-muted-foreground" />
        </div>

        {connectorFormOpen && (
          <ProjectChargerConnectorsForm
            key={`${editingConnector?.id ?? "new"}-${chargerGroup.id}`}
            chargerGroupId={chargerGroup.id}
            chargerCount={chargerGroup.charger_count}
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
            className="rounded-lg border bg-background p-4 text-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <Badge variant="outline">
                  {connector.connector_type ?? "Connector"}
                </Badge>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConnectorMeta
                    label="Per Charger"
                    value={formatNumber(connector.connector_count_per_charger)}
                  />
                  <ConnectorMeta
                    label="Total Connectors"
                    value={formatNumber(connector.total_connector_count)}
                  />
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
    <div className="min-w-0 rounded-lg bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-base font-semibold leading-snug">
        {value}
      </p>
    </div>
  )
}

function ConnectorMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold leading-snug">{value}</p>
    </div>
  )
}

function formatNumber(value: number | null) {
  return value === null ? "Not set" : value.toString()
}
