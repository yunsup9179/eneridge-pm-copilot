"use client"

import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Contact, ContactCreateInput } from "@/lib/data/contacts"

type ContactFormValues = {
  name: string
  company: string
  role: string
  email: string
  phone: string
  notes: string
  communication_style: string
  last_contacted_at: string
}

type ContactFormProps = {
  contact?: Contact
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ContactCreateInput) => void
}

function getInitialValues(contact?: Contact): ContactFormValues {
  return {
    name: contact?.name ?? "",
    company: contact?.company ?? "",
    role: contact?.role ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    notes: contact?.notes ?? "",
    communication_style: contact?.communication_style ?? "",
    last_contacted_at: toDateTimeLocal(contact?.last_contacted_at ?? null),
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toContactInput(values: ContactFormValues): ContactCreateInput {
  return {
    name: values.name.trim(),
    company: emptyToNull(values.company),
    role: emptyToNull(values.role),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    notes: emptyToNull(values.notes),
    communication_style: emptyToNull(values.communication_style),
    last_contacted_at: values.last_contacted_at
      ? new Date(values.last_contacted_at).toISOString()
      : null,
  }
}

export function ContactForm({
  contact,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: ContactFormProps) {
  const idPrefix = useId()
  const [values, setValues] = useState<ContactFormValues>(() =>
    getInitialValues(contact)
  )

  function updateValue(name: keyof ContactFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(toContactInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-name`}
          label="Name"
          name="name"
          required
          value={values.name}
          onChange={(value) => updateValue("name", value)}
        />
        <TextField
          id={`${idPrefix}-company`}
          label="Company"
          name="company"
          value={values.company}
          onChange={(value) => updateValue("company", value)}
        />
        <TextField
          id={`${idPrefix}-role`}
          label="Role"
          name="role"
          value={values.role}
          onChange={(value) => updateValue("role", value)}
        />
        <TextField
          id={`${idPrefix}-email`}
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(value) => updateValue("email", value)}
        />
        <TextField
          id={`${idPrefix}-phone`}
          label="Phone"
          name="phone"
          value={values.phone}
          onChange={(value) => updateValue("phone", value)}
        />
        <TextField
          id={`${idPrefix}-last_contacted_at`}
          label="Last Contacted"
          name="last_contacted_at"
          type="datetime-local"
          value={values.last_contacted_at}
          onChange={(value) => updateValue("last_contacted_at", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-communication_style`}>
            Communication Style
          </Label>
          <Textarea
            id={`${idPrefix}-communication_style`}
            name="communication_style"
            value={values.communication_style}
            onChange={(event) =>
              updateValue("communication_style", event.target.value)
            }
            placeholder="Preferred cadence, tone, or channel."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            name="notes"
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Stakeholder context, reminders, or project history."
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
        <Button type="submit" disabled={isSubmitting || !values.name.trim()}>
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
  required = false,
  value,
  onChange,
}: {
  id: string
  label: string
  name: string
  type?: string
  required?: boolean
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
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return ""
  }

  return new Date(value).toISOString().slice(0, 16)
}
