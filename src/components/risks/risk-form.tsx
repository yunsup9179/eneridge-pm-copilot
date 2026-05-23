"use client"

import { useId, useState, type FormEvent } from "react"

import {
  riskCategories,
  riskImpactValues,
  riskLikelihoodValues,
  riskSeverityValues,
  riskStatuses,
} from "@/components/risks/risk-options"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/lib/data/projects"
import type { Risk, RiskCreateInput } from "@/lib/data/risks"

type RiskFormValues = {
  project_id: string
  category: string
  description: string
  impact: string
  likelihood: string
  severity: string
  mitigation_plan: string
  owner: string
  status: string
  ai_detected: boolean
}

type RiskFormProps = {
  risk?: Risk
  projects: Project[]
  lockedProjectId?: string
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: RiskCreateInput) => void
}

function getInitialValues(risk?: Risk, lockedProjectId?: string): RiskFormValues {
  return {
    project_id: lockedProjectId ?? risk?.project_id ?? "",
    category: risk?.category ?? "Utility Delay",
    description: risk?.description ?? "",
    impact: risk?.impact ?? "Medium",
    likelihood: risk?.likelihood ?? "Medium",
    severity: risk?.severity ?? "Medium",
    mitigation_plan: risk?.mitigation_plan ?? "",
    owner: risk?.owner ?? "",
    status: risk?.status ?? "Open",
    ai_detected: risk?.ai_detected ?? false,
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toRiskInput(values: RiskFormValues): RiskCreateInput {
  return {
    project_id: emptyToNull(values.project_id),
    category: emptyToNull(values.category),
    description: values.description.trim(),
    impact: emptyToNull(values.impact),
    likelihood: emptyToNull(values.likelihood),
    severity: emptyToNull(values.severity),
    mitigation_plan: emptyToNull(values.mitigation_plan),
    owner: emptyToNull(values.owner),
    status: emptyToNull(values.status),
    ai_detected: values.ai_detected,
  }
}

export function RiskForm({
  risk,
  projects,
  lockedProjectId,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: RiskFormProps) {
  const idPrefix = useId()
  const lockedProject = lockedProjectId
    ? projects.find((project) => project.id === lockedProjectId)
    : null
  const [values, setValues] = useState<RiskFormValues>(() =>
    getInitialValues(risk, lockedProjectId)
  )

  function updateValue(name: keyof RiskFormValues, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toRiskInput(values))
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

        <SelectField
          id={`${idPrefix}-category`}
          label="Category"
          value={values.category}
          options={riskCategories}
          onChange={(value) => updateValue("category", value)}
        />

        <SelectField
          id={`${idPrefix}-impact`}
          label="Impact"
          value={values.impact}
          options={riskImpactValues}
          onChange={(value) => updateValue("impact", value)}
        />

        <SelectField
          id={`${idPrefix}-likelihood`}
          label="Likelihood"
          value={values.likelihood}
          options={riskLikelihoodValues}
          onChange={(value) => updateValue("likelihood", value)}
        />

        <SelectField
          id={`${idPrefix}-severity`}
          label="Severity"
          value={values.severity}
          options={riskSeverityValues}
          onChange={(value) => updateValue("severity", value)}
        />

        <SelectField
          id={`${idPrefix}-status`}
          label="Status"
          value={values.status}
          options={riskStatuses}
          onChange={(value) => updateValue("status", value)}
        />

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-owner`}>Owner</Label>
          <Input
            id={`${idPrefix}-owner`}
            name="owner"
            value={values.owner}
            onChange={(event) => updateValue("owner", event.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
          <Checkbox
            id={`${idPrefix}-ai_detected`}
            checked={values.ai_detected}
            onChange={(event) =>
              updateValue("ai_detected", event.target.checked)
            }
          />
          <Label htmlFor={`${idPrefix}-ai_detected`}>AI detected</Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-description`}>Description</Label>
          <Textarea
            id={`${idPrefix}-description`}
            name="description"
            required
            value={values.description}
            onChange={(event) =>
              updateValue("description", event.target.value)
            }
            placeholder="Describe the risk and what could go wrong."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-mitigation_plan`}>
            Mitigation plan
          </Label>
          <Textarea
            id={`${idPrefix}-mitigation_plan`}
            name="mitigation_plan"
            value={values.mitigation_plan}
            onChange={(event) =>
              updateValue("mitigation_plan", event.target.value)
            }
            placeholder="Owner actions, contingency, or monitoring plan."
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
          disabled={
            isSubmitting || !values.description.trim() || !values.project_id
          }
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  )
}
