"use client"

import { useId, useState, type FormEvent } from "react"

import {
  chargerCategories,
  portConfigurations,
} from "@/components/project-chargers/project-charger-options"
import { getExpectedPortCount } from "@/components/project-chargers/project-charger-calculations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/lib/data/projects"
import type {
  ProjectChargerGroup,
  ProjectChargerGroupCreateInput,
} from "@/lib/data/project-chargers"

type ProjectChargerGroupFormValues = {
  project_id: string
  charger_model: string
  charger_category: string
  power_rating_kw: string
  charger_count: string
  port_count: string
  port_configuration: string
  notes: string
}

type ProjectChargerGroupFormProps = {
  project: Project
  chargerGroup?: ProjectChargerGroup
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectChargerGroupCreateInput) => void
}

function getInitialValues(
  project: Project,
  chargerGroup?: ProjectChargerGroup
): ProjectChargerGroupFormValues {
  return {
    project_id: project.id,
    charger_model: chargerGroup?.charger_model ?? "",
    charger_category: chargerGroup?.charger_category ?? "Level 2",
    power_rating_kw: chargerGroup?.power_rating_kw?.toString() ?? "",
    charger_count: chargerGroup?.charger_count?.toString() ?? "",
    port_count: chargerGroup?.port_count?.toString() ?? "",
    port_configuration: chargerGroup?.port_configuration ?? "Dual Port",
    notes: chargerGroup?.notes ?? "",
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

function toChargerGroupInput(
  values: ProjectChargerGroupFormValues
): ProjectChargerGroupCreateInput {
  return {
    project_id: values.project_id,
    charger_model: emptyToNull(values.charger_model),
    charger_category: emptyToNull(values.charger_category),
    power_rating_kw: numericToNull(values.power_rating_kw),
    charger_count: numericToNull(values.charger_count),
    port_count: numericToNull(values.port_count),
    port_configuration: emptyToNull(values.port_configuration),
    notes: emptyToNull(values.notes),
  }
}

export function ProjectChargerGroupForm({
  project,
  chargerGroup,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ProjectChargerGroupFormProps) {
  const idPrefix = useId()
  const [values, setValues] = useState<ProjectChargerGroupFormValues>(() =>
    getInitialValues(project, chargerGroup)
  )
  const suggestedPortCount = getExpectedPortCount({
    chargerCount: numericToNull(values.charger_count),
    portConfiguration: values.port_configuration,
  })
  const enteredPortCount = numericToNull(values.port_count)
  const portCountMismatch =
    suggestedPortCount !== null &&
    enteredPortCount !== null &&
    suggestedPortCount !== enteredPortCount

  function updateValue(name: keyof ProjectChargerGroupFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toChargerGroupInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Project</Label>
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            {project.name}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-charger_model`}>
            Charger Model / Product Name
          </Label>
          <Input
            id={`${idPrefix}-charger_model`}
            name="charger_model"
            value={values.charger_model}
            onChange={(event) =>
              updateValue("charger_model", event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-charger_category`}>
            Charger Category
          </Label>
          <Select
            id={`${idPrefix}-charger_category`}
            name="charger_category"
            value={values.charger_category}
            onChange={(event) =>
              updateValue("charger_category", event.target.value)
            }
          >
            {chargerCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <NumberField
          id={`${idPrefix}-power_rating_kw`}
          label="Rated Power per Charger (kW)"
          name="power_rating_kw"
          value={values.power_rating_kw}
          step="0.1"
          onChange={(value) => updateValue("power_rating_kw", value)}
        />
        <NumberField
          id={`${idPrefix}-charger_count`}
          label="Physical Chargers"
          name="charger_count"
          value={values.charger_count}
          onChange={(value) => updateValue("charger_count", value)}
        />
        <NumberField
          id={`${idPrefix}-port_count`}
          label="Total Ports"
          name="port_count"
          value={values.port_count}
          helperText={
            suggestedPortCount !== null
              ? `Suggested total ports: ${suggestedPortCount}`
              : undefined
          }
          warningText={
            portCountMismatch
              ? "Entered total ports does not match the selected port configuration."
              : undefined
          }
          onChange={(value) => updateValue("port_count", value)}
        />

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-port_configuration`}>
            Port Configuration
          </Label>
          <Select
            id={`${idPrefix}-port_configuration`}
            name="port_configuration"
            value={values.port_configuration}
            onChange={(event) =>
              updateValue("port_configuration", event.target.value)
            }
          >
            {portConfigurations.map((configuration) => (
              <option key={configuration} value={configuration}>
                {configuration}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
          placeholder="Optional charger details, procurement context, or design notes."
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
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !values.project_id}>
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
  step = "1",
  helperText,
  warningText,
  onChange,
}: {
  id: string
  label: string
  name: string
  value: string
  step?: string
  helperText?: string
  warningText?: string
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
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {warningText && <p className="text-xs text-amber-700">{warningText}</p>}
    </div>
  )
}
