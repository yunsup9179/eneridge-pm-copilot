"use client"

import { useId, useState, type FormEvent } from "react"
import { Plus, Trash2 } from "lucide-react"

import {
  chargerCategories,
  connectorTypes,
  portConfigurations,
} from "@/components/project-chargers/project-charger-options"
import { getExpectedPortCount } from "@/components/project-chargers/project-charger-calculations"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  ProjectChargerConnectorCreateInput,
  ProjectChargerGroupCreateInput,
} from "@/lib/data/project-chargers"
import type { Project, ProjectCreateInput } from "@/lib/data/projects"

export type InitialChargerGroupInput = {
  chargerGroup: Omit<ProjectChargerGroupCreateInput, "project_id">
  connectors: Array<Omit<ProjectChargerConnectorCreateInput, "charger_group_id">>
}

export type ProjectFormSubmitInput = {
  project: ProjectCreateInput
  initialChargerGroup?: InitialChargerGroupInput
}

type ConnectorFormValues = {
  key: string
  connector_type: string
  connector_count_per_charger: string
  total_connector_count: string
  notes: string
}

type ProjectFormValues = {
  name: string
  location: string
  customer: string
  city: string
  utility: string
  program: string
  phase: string
  status: string
  project_stage: string
  priority: string
  target_construction_start: string
  target_cod: string
  internal_owner: string
  summary: string
  enable_initial_charger_group: boolean
  initial_charger_model: string
  initial_charger_category: string
  initial_power_rating_kw: string
  initial_charger_count: string
  initial_port_count: string
  initial_port_configuration: string
  initial_notes: string
}

type ProjectFormProps = {
  project?: Project
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectFormSubmitInput) => void
}

export const projectStatusOptions = [
  "Active",
  "At Risk",
  "On Hold",
  "Completed",
  "Cancelled",
] as const

export const projectStageOptions = [
  "Site Review",
  "Design",
  "Utility Design",
  "Permitting",
  "Procurement",
  "Construction",
  "Commissioning",
  "Operational",
  "Closeout",
] as const

const projectInfoFields: Array<{
  name: keyof Omit<
    ProjectFormValues,
    | "summary"
    | "enable_initial_charger_group"
    | "initial_charger_model"
    | "initial_charger_category"
    | "initial_power_rating_kw"
    | "initial_charger_count"
    | "initial_port_count"
    | "initial_port_configuration"
    | "initial_notes"
  >
  label: string
  type?: string
  options?: readonly string[]
  required?: boolean
}> = [
  { name: "name", label: "Project name", required: true },
  { name: "location", label: "Location" },
  { name: "customer", label: "Customer" },
  { name: "city", label: "City" },
  { name: "utility", label: "Utility" },
  { name: "program", label: "Program" },
  { name: "phase", label: "Electrical Phase" },
  { name: "status", label: "Status", options: projectStatusOptions },
  { name: "project_stage", label: "Project Stage", options: projectStageOptions },
  { name: "priority", label: "Priority" },
  {
    name: "target_construction_start",
    label: "Target construction start",
    type: "date",
  },
  { name: "target_cod", label: "Target COD", type: "date" },
  { name: "internal_owner", label: "Internal owner" },
]

function getInitialValues(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? "",
    location: project?.location ?? "",
    customer: project?.customer ?? "",
    city: project?.city ?? "",
    utility: project?.utility ?? "",
    program: project?.program ?? "",
    phase: project?.phase ?? "",
    status: project?.status ?? "",
    project_stage: project?.project_stage ?? "",
    priority: project?.priority ?? "",
    target_construction_start: project?.target_construction_start ?? "",
    target_cod: project?.target_cod ?? "",
    internal_owner: project?.internal_owner ?? "",
    summary: project?.summary ?? "",
    enable_initial_charger_group: false,
    initial_charger_model: "",
    initial_charger_category: "Level 2",
    initial_power_rating_kw: "",
    initial_charger_count: "",
    initial_port_count: "",
    initial_port_configuration: "Dual Port",
    initial_notes: "",
  }
}

function getInitialConnector(): ConnectorFormValues {
  return {
    key: `connector-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    connector_type: "J1772",
    connector_count_per_charger: "",
    total_connector_count: "",
    notes: "",
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

function hasMeaningfulInitialGroup(values: ProjectFormValues) {
  return [
    values.initial_charger_model,
    values.initial_power_rating_kw,
    values.initial_charger_count,
    values.initial_port_count,
    values.initial_notes,
  ].some((value) => value.trim().length > 0)
}

function hasMeaningfulConnector(connector: ConnectorFormValues) {
  return (
    connector.connector_type !== "J1772" ||
    connector.connector_count_per_charger.trim().length > 0 ||
    connector.total_connector_count.trim().length > 0 ||
    connector.notes.trim().length > 0
  )
}

function toProjectInput(values: ProjectFormValues): ProjectCreateInput {
  return {
    name: values.name.trim(),
    location: emptyToNull(values.location),
    customer: emptyToNull(values.customer),
    city: emptyToNull(values.city),
    utility: emptyToNull(values.utility),
    program: emptyToNull(values.program),
    phase: emptyToNull(values.phase),
    status: emptyToNull(values.status),
    project_stage: emptyToNull(values.project_stage),
    priority: emptyToNull(values.priority),
    target_construction_start: emptyToNull(values.target_construction_start),
    target_cod: emptyToNull(values.target_cod),
    internal_owner: emptyToNull(values.internal_owner),
    summary: emptyToNull(values.summary),
  }
}

function toInitialChargerGroupInput(
  values: ProjectFormValues,
  connectors: ConnectorFormValues[]
): InitialChargerGroupInput | undefined {
  if (
    !values.enable_initial_charger_group ||
    !hasMeaningfulInitialGroup(values)
  ) {
    return undefined
  }

  return {
    chargerGroup: {
      charger_model: emptyToNull(values.initial_charger_model),
      charger_category: emptyToNull(values.initial_charger_category),
      power_rating_kw: numericToNull(values.initial_power_rating_kw),
      charger_count: numericToNull(values.initial_charger_count),
      port_count: numericToNull(values.initial_port_count),
      port_configuration: emptyToNull(values.initial_port_configuration),
      notes: emptyToNull(values.initial_notes),
    },
    connectors: connectors
      .filter(hasMeaningfulConnector)
      .map((connector) => ({
        connector_type: emptyToNull(connector.connector_type),
        connector_count_per_charger: numericToNull(
          connector.connector_count_per_charger
        ),
        total_connector_count: numericToNull(connector.total_connector_count),
        notes: emptyToNull(connector.notes),
      })),
  }
}

export function ProjectForm({
  project,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ProjectFormProps) {
  const idPrefix = useId()
  const isCreate = !project
  const [values, setValues] = useState<ProjectFormValues>(() =>
    getInitialValues(project)
  )
  const [connectors, setConnectors] = useState<ConnectorFormValues[]>(() => [
    getInitialConnector(),
  ])
  const suggestedInitialPortCount = getExpectedPortCount({
    chargerCount: numericToNull(values.initial_charger_count),
    portConfiguration: values.initial_port_configuration,
  })
  const enteredInitialPortCount = numericToNull(values.initial_port_count)
  const initialPortCountMismatch =
    suggestedInitialPortCount !== null &&
    enteredInitialPortCount !== null &&
    suggestedInitialPortCount !== enteredInitialPortCount

  function updateValue(name: keyof ProjectFormValues, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function updateConnector(
    key: string,
    name: keyof Omit<ConnectorFormValues, "key">,
    value: string
  ) {
    setConnectors((current) =>
      current.map((connector) =>
        connector.key === key ? { ...connector, [name]: value } : connector
      )
    )
  }

  function addConnector() {
    setConnectors((current) => [...current, getInitialConnector()])
  }

  function removeConnector(key: string) {
    setConnectors((current) =>
      current.length > 1
        ? current.filter((connector) => connector.key !== key)
        : current
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      project: toProjectInput(values),
      initialChargerGroup: isCreate
        ? toInitialChargerGroupInput(values, connectors)
        : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Project Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {projectInfoFields.map((field) => {
            const fieldId = `${idPrefix}-${field.name}`

            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={fieldId}>{field.label}</Label>
                {field.options ? (
                  <Select
                    id={fieldId}
                    name={field.name}
                    required={field.required}
                    value={values[field.name]}
                    onChange={(event) =>
                      updateValue(field.name, event.target.value)
                    }
                  >
                    <option value="">Not set</option>
                    {values[field.name] &&
                      !(field.options as readonly string[]).includes(
                        values[field.name]
                      ) && (
                        <option value={values[field.name]}>
                          Current: {values[field.name]}
                        </option>
                      )}
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={fieldId}
                    name={field.name}
                    type={field.type ?? "text"}
                    required={field.required}
                    value={values[field.name]}
                    onChange={(event) =>
                      updateValue(field.name, event.target.value)
                    }
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-summary`}>Summary</Label>
          <Textarea
            id={`${idPrefix}-summary`}
            name="summary"
            value={values.summary}
            onChange={(event) => updateValue("summary", event.target.value)}
            placeholder="Brief project context, scope, constraints, or next milestone."
          />
        </div>
      </section>

      {isCreate && (
        <section className="space-y-4 border-t pt-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Initial Charger Group</h3>
            <p className="text-sm text-muted-foreground">
              Optional. You can add more charger groups after creating the
              project.
            </p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={values.enable_initial_charger_group}
                onChange={(event) =>
                  updateValue(
                    "enable_initial_charger_group",
                    event.target.checked
                  )
                }
              />
              Add an initial charger group
            </label>
          </div>

          {values.enable_initial_charger_group && (
            <div className="space-y-5 rounded-lg border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-initial_charger_model`}>
                    Charger Model / Product Name
                  </Label>
                  <Input
                    id={`${idPrefix}-initial_charger_model`}
                    name="initial_charger_model"
                    value={values.initial_charger_model}
                    onChange={(event) =>
                      updateValue("initial_charger_model", event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-initial_charger_category`}>
                    Charger Category
                  </Label>
                  <Select
                    id={`${idPrefix}-initial_charger_category`}
                    name="initial_charger_category"
                    value={values.initial_charger_category}
                    onChange={(event) =>
                      updateValue("initial_charger_category", event.target.value)
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
                  id={`${idPrefix}-initial_power_rating_kw`}
                  label="Rated Power per Charger (kW)"
                  name="initial_power_rating_kw"
                  value={values.initial_power_rating_kw}
                  step="0.1"
                  onChange={(value) =>
                    updateValue("initial_power_rating_kw", value)
                  }
                />
                <NumberField
                  id={`${idPrefix}-initial_charger_count`}
                  label="Physical Chargers"
                  name="initial_charger_count"
                  value={values.initial_charger_count}
                  onChange={(value) =>
                    updateValue("initial_charger_count", value)
                  }
                />
                <NumberField
                  id={`${idPrefix}-initial_port_count`}
                  label="Total Ports"
                  name="initial_port_count"
                  value={values.initial_port_count}
                  helperText={
                    suggestedInitialPortCount !== null
                      ? `Suggested total ports: ${suggestedInitialPortCount}`
                      : undefined
                  }
                  warningText={
                    initialPortCountMismatch
                      ? "Entered total ports does not match the selected port configuration."
                      : undefined
                  }
                  onChange={(value) => updateValue("initial_port_count", value)}
                />

                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-initial_port_configuration`}>
                    Port Configuration
                  </Label>
                  <Select
                    id={`${idPrefix}-initial_port_configuration`}
                    name="initial_port_configuration"
                    value={values.initial_port_configuration}
                    onChange={(event) =>
                      updateValue(
                        "initial_port_configuration",
                        event.target.value
                      )
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
                <Label htmlFor={`${idPrefix}-initial_notes`}>Notes</Label>
                <Textarea
                  id={`${idPrefix}-initial_notes`}
                  name="initial_notes"
                  value={values.initial_notes}
                  onChange={(event) =>
                    updateValue("initial_notes", event.target.value)
                  }
                  placeholder="Optional charger details, procurement context, or design notes."
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold">Connector Details</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addConnector}
                  >
                    <Plus />
                    Add connector
                  </Button>
                </div>

                {connectors.map((connector, index) => {
                  const initialChargerCount = numericToNull(
                    values.initial_charger_count
                  )
                  const connectorCountPerCharger = numericToNull(
                    connector.connector_count_per_charger
                  )
                  const suggestedConnectorTotal =
                    initialChargerCount !== null &&
                    connectorCountPerCharger !== null
                      ? initialChargerCount * connectorCountPerCharger
                      : null

                  return (
                    <div key={connector.key} className="rounded-lg border p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          Connector {index + 1}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnector(connector.key)}
                          disabled={connectors.length === 1}
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${idPrefix}-${connector.key}-type`}>
                            Connector Type
                          </Label>
                          <Select
                            id={`${idPrefix}-${connector.key}-type`}
                            name="connector_type"
                            value={connector.connector_type}
                            onChange={(event) =>
                              updateConnector(
                                connector.key,
                                "connector_type",
                                event.target.value
                              )
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
                          id={`${idPrefix}-${connector.key}-per-charger`}
                          label="Per Charger"
                          name="connector_count_per_charger"
                          value={connector.connector_count_per_charger}
                          onChange={(value) =>
                            updateConnector(
                              connector.key,
                              "connector_count_per_charger",
                              value
                            )
                          }
                        />
                        <NumberField
                          id={`${idPrefix}-${connector.key}-total`}
                          label="Total Connectors"
                          name="total_connector_count"
                          value={connector.total_connector_count}
                          helperText={
                            suggestedConnectorTotal !== null
                              ? `Suggested total: ${suggestedConnectorTotal}`
                              : undefined
                          }
                          onChange={(value) =>
                            updateConnector(
                              connector.key,
                              "total_connector_count",
                              value
                            )
                          }
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`${idPrefix}-${connector.key}-notes`}>
                          Notes
                        </Label>
                        <Textarea
                          id={`${idPrefix}-${connector.key}-notes`}
                          name="connector_notes"
                          value={connector.notes}
                          onChange={(event) =>
                            updateConnector(
                              connector.key,
                              "notes",
                              event.target.value
                            )
                          }
                          placeholder="Optional connector detail."
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

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
        <Button type="submit" disabled={isSubmitting || !values.name.trim()}>
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
