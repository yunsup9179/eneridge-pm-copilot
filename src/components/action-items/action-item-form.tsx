"use client"

import { useId, useState, type FormEvent } from "react"

import {
  actionItemPriorities,
  actionItemStatuses,
} from "@/components/action-items/action-item-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  ActionItem,
  ActionItemCreateInput,
} from "@/lib/data/action-items"
import type { Project } from "@/lib/data/projects"

type ActionItemFormValues = {
  project_id: string
  title: string
  description: string
  assigned_to: string
  external_party: string
  due_date: string
  follow_up_date: string
  priority: string
  status: string
  source_type: string
  source_reference: string
  notes: string
}

type ActionItemFormProps = {
  actionItem?: ActionItem
  projects: Project[]
  lockedProjectId?: string
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ActionItemCreateInput) => void
}

function getInitialValues(
  actionItem?: ActionItem,
  lockedProjectId?: string
): ActionItemFormValues {
  return {
    project_id: lockedProjectId ?? actionItem?.project_id ?? "",
    title: actionItem?.title ?? "",
    description: actionItem?.description ?? "",
    assigned_to: actionItem?.assigned_to ?? "",
    external_party: actionItem?.external_party ?? "",
    due_date: actionItem?.due_date ?? "",
    follow_up_date: actionItem?.follow_up_date ?? "",
    priority: actionItem?.priority ?? "Medium",
    status: actionItem?.status ?? "Open",
    source_type: actionItem?.source_type ?? "",
    source_reference: actionItem?.source_reference ?? "",
    notes: actionItem?.notes ?? "",
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toActionItemInput(values: ActionItemFormValues): ActionItemCreateInput {
  return {
    project_id: emptyToNull(values.project_id),
    title: values.title.trim(),
    description: emptyToNull(values.description),
    assigned_to: emptyToNull(values.assigned_to),
    external_party: emptyToNull(values.external_party),
    due_date: emptyToNull(values.due_date),
    follow_up_date: emptyToNull(values.follow_up_date),
    priority: emptyToNull(values.priority),
    status: emptyToNull(values.status),
    source_type: emptyToNull(values.source_type),
    source_reference: emptyToNull(values.source_reference),
    notes: emptyToNull(values.notes),
  }
}

export function ActionItemForm({
  actionItem,
  projects,
  lockedProjectId,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ActionItemFormProps) {
  const idPrefix = useId()
  const lockedProject = lockedProjectId
    ? projects.find((project) => project.id === lockedProjectId)
    : null
  const [values, setValues] = useState<ActionItemFormValues>(() =>
    getInitialValues(actionItem, lockedProjectId)
  )

  function updateValue(name: keyof ActionItemFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toActionItemInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {lockedProjectId ? (
          <div className="space-y-2">
            <Label>Project</Label>
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              {lockedProject?.name ?? "Current project"}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-project_id`}>Project</Label>
            <Select
              id={`${idPrefix}-project_id`}
              name="project_id"
              required
              value={values.project_id}
              onChange={(event) =>
                updateValue("project_id", event.target.value)
              }
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`}>Title</Label>
          <Input
            id={`${idPrefix}-title`}
            name="title"
            required
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
          />
        </div>

        <TextField
          id={`${idPrefix}-assigned_to`}
          label="Assigned to"
          name="assigned_to"
          value={values.assigned_to}
          onChange={(value) => updateValue("assigned_to", value)}
        />
        <TextField
          id={`${idPrefix}-external_party`}
          label="External party"
          name="external_party"
          value={values.external_party}
          onChange={(value) => updateValue("external_party", value)}
        />
        <TextField
          id={`${idPrefix}-due_date`}
          label="Due date"
          name="due_date"
          type="date"
          value={values.due_date}
          onChange={(value) => updateValue("due_date", value)}
        />
        <TextField
          id={`${idPrefix}-follow_up_date`}
          label="Follow-up date"
          name="follow_up_date"
          type="date"
          value={values.follow_up_date}
          onChange={(value) => updateValue("follow_up_date", value)}
        />

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-priority`}>Priority</Label>
          <Select
            id={`${idPrefix}-priority`}
            name="priority"
            value={values.priority}
            onChange={(event) => updateValue("priority", event.target.value)}
          >
            {actionItemPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            value={values.status}
            onChange={(event) => updateValue("status", event.target.value)}
          >
            {actionItemStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <TextField
          id={`${idPrefix}-source_type`}
          label="Source type"
          name="source_type"
          value={values.source_type}
          onChange={(value) => updateValue("source_type", value)}
        />
        <TextField
          id={`${idPrefix}-source_reference`}
          label="Source reference"
          name="source_reference"
          value={values.source_reference}
          onChange={(value) => updateValue("source_reference", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-description`}>Description</Label>
          <Textarea
            id={`${idPrefix}-description`}
            name="description"
            value={values.description}
            onChange={(event) =>
              updateValue("description", event.target.value)
            }
            placeholder="What needs to happen?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            name="notes"
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Follow-up context, dependencies, or decisions."
          />
        </div>
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
        <Button
          type="submit"
          disabled={isSubmitting || !values.title.trim() || !values.project_id}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function TextField({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
}: {
  id: string
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
