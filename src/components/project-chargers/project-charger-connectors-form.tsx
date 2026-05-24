"use client"

import { useId, useState, type FormEvent } from "react"

import { connectorTypes } from "@/components/project-chargers/project-charger-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  ProjectChargerConnector,
  ProjectChargerConnectorCreateInput,
} from "@/lib/data/project-chargers"

type ProjectChargerConnectorFormValues = {
  charger_group_id: string
  connector_type: string
  connector_count_per_charger: string
  total_connector_count: string
  notes: string
}

type ProjectChargerConnectorsFormProps = {
  chargerGroupId: string
  connector?: ProjectChargerConnector
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectChargerConnectorCreateInput) => void
}

function getInitialValues(
  chargerGroupId: string,
  connector?: ProjectChargerConnector
): ProjectChargerConnectorFormValues {
  return {
    charger_group_id: chargerGroupId,
    connector_type: connector?.connector_type ?? "J1772",
    connector_count_per_charger:
      connector?.connector_count_per_charger?.toString() ?? "",
    total_connector_count: connector?.total_connector_count?.toString() ?? "",
    notes: connector?.notes ?? "",
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function numericToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? Number(trimmed) : null
}

function toConnectorInput(
  values: ProjectChargerConnectorFormValues
): ProjectChargerConnectorCreateInput {
  return {
    charger_group_id: values.charger_group_id,
    connector_type: emptyToNull(values.connector_type),
    connector_count_per_charger: numericToNull(
      values.connector_count_per_charger
    ),
    total_connector_count: numericToNull(values.total_connector_count),
    notes: emptyToNull(values.notes),
  }
}

export function ProjectChargerConnectorsForm({
  chargerGroupId,
  connector,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ProjectChargerConnectorsFormProps) {
  const idPrefix = useId()
  const [values, setValues] = useState<ProjectChargerConnectorFormValues>(() =>
    getInitialValues(chargerGroupId, connector)
  )

  function updateValue(
    name: keyof ProjectChargerConnectorFormValues,
    value: string
  ) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toConnectorInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-connector_type`}>Connector Type</Label>
          <Select
            id={`${idPrefix}-connector_type`}
            name="connector_type"
            value={values.connector_type}
            onChange={(event) =>
              updateValue("connector_type", event.target.value)
            }
          >
            {connectorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        <NumberField
          id={`${idPrefix}-connector_count_per_charger`}
          label="Per Charger"
          name="connector_count_per_charger"
          value={values.connector_count_per_charger}
          onChange={(value) =>
            updateValue("connector_count_per_charger", value)
          }
        />
        <NumberField
          id={`${idPrefix}-total_connector_count`}
          label="Total Connectors"
          name="total_connector_count"
          value={values.total_connector_count}
          onChange={(value) => updateValue("total_connector_count", value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
          placeholder="Optional connector detail."
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function NumberField({
  id,
  label,
  name,
  value,
  onChange,
}: {
  id: string
  label: string
  name: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

