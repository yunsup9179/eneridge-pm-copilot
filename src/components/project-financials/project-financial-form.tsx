"use client"

import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  ProjectFinancial,
  ProjectFinancialUpdateInput,
} from "@/lib/data/project-financials"

type ProjectFinancialFormValues = {
  estimated_total_cost: string
  actual_total_cost: string
  equipment_cost: string
  installation_cost: string
  utility_cost: string
  soft_cost: string
  rebate_applicable: boolean
  rebate_program: string
  rebate_amount: string
  grant_amount: string
  match_share_amount: string
  customer_contribution: string
  eneridge_out_of_pocket: string
  reimbursement_status: string
  reimbursement_received: string
  retention_amount: string
  notes: string
}

type ProjectFinancialFormProps = {
  financial?: ProjectFinancial | null
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectFinancialUpdateInput) => void
}

function getInitialValues(
  financial?: ProjectFinancial | null
): ProjectFinancialFormValues {
  return {
    estimated_total_cost: formatInputNumber(financial?.estimated_total_cost),
    actual_total_cost: formatInputNumber(financial?.actual_total_cost),
    equipment_cost: formatInputNumber(financial?.equipment_cost),
    installation_cost: formatInputNumber(financial?.installation_cost),
    utility_cost: formatInputNumber(financial?.utility_cost),
    soft_cost: formatInputNumber(financial?.soft_cost),
    rebate_applicable: financial?.rebate_applicable ?? false,
    rebate_program: financial?.rebate_program ?? "",
    rebate_amount: formatInputNumber(financial?.rebate_amount),
    grant_amount: formatInputNumber(financial?.grant_amount),
    match_share_amount: formatInputNumber(financial?.match_share_amount),
    customer_contribution: formatInputNumber(financial?.customer_contribution),
    eneridge_out_of_pocket: formatInputNumber(financial?.eneridge_out_of_pocket),
    reimbursement_status: financial?.reimbursement_status ?? "",
    reimbursement_received: formatInputNumber(financial?.reimbursement_received),
    retention_amount: formatInputNumber(financial?.retention_amount),
    notes: financial?.notes ?? "",
  }
}

function toFinancialInput(
  values: ProjectFinancialFormValues
): ProjectFinancialUpdateInput {
  return {
    estimated_total_cost: toNumberOrNull(values.estimated_total_cost),
    actual_total_cost: toNumberOrNull(values.actual_total_cost),
    equipment_cost: toNumberOrNull(values.equipment_cost),
    installation_cost: toNumberOrNull(values.installation_cost),
    utility_cost: toNumberOrNull(values.utility_cost),
    soft_cost: toNumberOrNull(values.soft_cost),
    rebate_applicable: values.rebate_applicable,
    rebate_program: emptyToNull(values.rebate_program),
    rebate_amount: toNumberOrNull(values.rebate_amount),
    grant_amount: toNumberOrNull(values.grant_amount),
    match_share_amount: toNumberOrNull(values.match_share_amount),
    customer_contribution: toNumberOrNull(values.customer_contribution),
    eneridge_out_of_pocket: toNumberOrNull(values.eneridge_out_of_pocket),
    reimbursement_status: emptyToNull(values.reimbursement_status),
    reimbursement_received: toNumberOrNull(values.reimbursement_received),
    retention_amount: toNumberOrNull(values.retention_amount),
    notes: emptyToNull(values.notes),
  }
}

export function ProjectFinancialForm({
  financial,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ProjectFinancialFormProps) {
  const idPrefix = useId()
  const [values, setValues] = useState<ProjectFinancialFormValues>(() =>
    getInitialValues(financial)
  )

  function updateValue(
    name: keyof ProjectFinancialFormValues,
    value: string | boolean
  ) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toFinancialInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField
          id={`${idPrefix}-estimated_total_cost`}
          label="Estimated Total Cost"
          name="estimated_total_cost"
          value={values.estimated_total_cost}
          onChange={(value) => updateValue("estimated_total_cost", value)}
        />
        <MoneyField
          id={`${idPrefix}-actual_total_cost`}
          label="Actual Total Cost"
          name="actual_total_cost"
          value={values.actual_total_cost}
          onChange={(value) => updateValue("actual_total_cost", value)}
        />
        <MoneyField
          id={`${idPrefix}-equipment_cost`}
          label="Equipment Cost"
          name="equipment_cost"
          value={values.equipment_cost}
          onChange={(value) => updateValue("equipment_cost", value)}
        />
        <MoneyField
          id={`${idPrefix}-installation_cost`}
          label="Installation Cost"
          name="installation_cost"
          value={values.installation_cost}
          onChange={(value) => updateValue("installation_cost", value)}
        />
        <MoneyField
          id={`${idPrefix}-utility_cost`}
          label="Utility Cost"
          name="utility_cost"
          value={values.utility_cost}
          onChange={(value) => updateValue("utility_cost", value)}
        />
        <MoneyField
          id={`${idPrefix}-soft_cost`}
          label="Soft Cost"
          name="soft_cost"
          value={values.soft_cost}
          onChange={(value) => updateValue("soft_cost", value)}
        />
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={values.rebate_applicable}
            onChange={(event) =>
              updateValue("rebate_applicable", event.target.checked)
            }
          />
          Rebate Applicable
        </label>
        <TextField
          id={`${idPrefix}-rebate_program`}
          label="Rebate Program"
          name="rebate_program"
          value={values.rebate_program}
          onChange={(value) => updateValue("rebate_program", value)}
        />
        <MoneyField
          id={`${idPrefix}-rebate_amount`}
          label="Rebate Amount"
          name="rebate_amount"
          value={values.rebate_amount}
          onChange={(value) => updateValue("rebate_amount", value)}
        />
        <MoneyField
          id={`${idPrefix}-grant_amount`}
          label="Grant Amount"
          name="grant_amount"
          value={values.grant_amount}
          onChange={(value) => updateValue("grant_amount", value)}
        />
        <MoneyField
          id={`${idPrefix}-match_share_amount`}
          label="Match Share"
          name="match_share_amount"
          value={values.match_share_amount}
          onChange={(value) => updateValue("match_share_amount", value)}
        />
        <MoneyField
          id={`${idPrefix}-customer_contribution`}
          label="Customer Contribution"
          name="customer_contribution"
          value={values.customer_contribution}
          onChange={(value) => updateValue("customer_contribution", value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField
          id={`${idPrefix}-eneridge_out_of_pocket`}
          label="Eneridge Out of Pocket"
          name="eneridge_out_of_pocket"
          value={values.eneridge_out_of_pocket}
          onChange={(value) => updateValue("eneridge_out_of_pocket", value)}
        />
        <TextField
          id={`${idPrefix}-reimbursement_status`}
          label="Reimbursement Status"
          name="reimbursement_status"
          value={values.reimbursement_status}
          onChange={(value) => updateValue("reimbursement_status", value)}
        />
        <MoneyField
          id={`${idPrefix}-reimbursement_received`}
          label="Reimbursement Received"
          name="reimbursement_received"
          value={values.reimbursement_received}
          onChange={(value) => updateValue("reimbursement_received", value)}
        />
        <MoneyField
          id={`${idPrefix}-retention_amount`}
          label="Retention Amount"
          name="retention_amount"
          value={values.retention_amount}
          onChange={(value) => updateValue("retention_amount", value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
          placeholder="Financial assumptions, reimbursement context, or grant notes."
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function MoneyField({
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
    <TextField
      id={id}
      label={label}
      name={name}
      type="number"
      step="0.01"
      value={value}
      onChange={onChange}
    />
  )
}

function TextField({
  id,
  label,
  name,
  type = "text",
  step,
  value,
  onChange,
}: {
  id: string
  label: string
  name: string
  type?: string
  step?: string
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
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function formatInputNumber(value?: number | null) {
  return value === null || value === undefined ? "" : value.toString()
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? Number(trimmed) : null
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
