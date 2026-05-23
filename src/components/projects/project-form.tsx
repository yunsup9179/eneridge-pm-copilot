"use client"

import { useId, useState, type FormEvent } from "react"

import type { Project, ProjectCreateInput } from "@/lib/data/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ProjectFormValues = {
  name: string
  location: string
  customer: string
  city: string
  utility: string
  program: string
  charger_type: string
  port_count: string
  phase: string
  status: string
  priority: string
  target_construction_start: string
  target_cod: string
  internal_owner: string
  summary: string
}

type ProjectFormProps = {
  project?: Project
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectCreateInput) => void
}

const textFields: Array<{
  name: keyof Omit<ProjectFormValues, "summary">
  label: string
  type?: string
  required?: boolean
}> = [
  { name: "name", label: "Project name", required: true },
  { name: "location", label: "Location" },
  { name: "customer", label: "Customer" },
  { name: "city", label: "City" },
  { name: "utility", label: "Utility" },
  { name: "program", label: "Program" },
  { name: "charger_type", label: "Charger type" },
  { name: "port_count", label: "Port count", type: "number" },
  { name: "phase", label: "Phase" },
  { name: "status", label: "Status" },
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
    charger_type: project?.charger_type ?? "",
    port_count: project?.port_count?.toString() ?? "",
    phase: project?.phase ?? "",
    status: project?.status ?? "",
    priority: project?.priority ?? "",
    target_construction_start: project?.target_construction_start ?? "",
    target_cod: project?.target_cod ?? "",
    internal_owner: project?.internal_owner ?? "",
    summary: project?.summary ?? "",
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toProjectInput(values: ProjectFormValues): ProjectCreateInput {
  const parsedPortCount = values.port_count
    ? Number.parseInt(values.port_count, 10)
    : null

  return {
    name: values.name.trim(),
    location: emptyToNull(values.location),
    customer: emptyToNull(values.customer),
    city: emptyToNull(values.city),
    utility: emptyToNull(values.utility),
    program: emptyToNull(values.program),
    charger_type: emptyToNull(values.charger_type),
    port_count: Number.isFinite(parsedPortCount) ? parsedPortCount : null,
    phase: emptyToNull(values.phase),
    status: emptyToNull(values.status),
    priority: emptyToNull(values.priority),
    target_construction_start: emptyToNull(values.target_construction_start),
    target_cod: emptyToNull(values.target_cod),
    internal_owner: emptyToNull(values.internal_owner),
    summary: emptyToNull(values.summary),
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
  const [values, setValues] = useState<ProjectFormValues>(() =>
    getInitialValues(project)
  )

  function updateValue(name: keyof ProjectFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toProjectInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {textFields.map((field) => {
          const fieldId = `${idPrefix}-${field.name}`

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={fieldId}>{field.label}</Label>
              <Input
                id={fieldId}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                min={field.name === "port_count" ? 0 : undefined}
                value={values[field.name]}
                onChange={(event) =>
                  updateValue(field.name, event.target.value)
                }
              />
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
