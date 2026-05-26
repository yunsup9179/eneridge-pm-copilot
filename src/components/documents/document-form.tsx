"use client"

import { useId, useState, type FormEvent } from "react"

import {
  documentStatuses,
  documentTypes,
} from "@/components/documents/document-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import type {
  ProjectDocument,
  ProjectDocumentCreateInput,
} from "@/lib/data/documents"
import type { Project } from "@/lib/data/projects"

export type ProjectDocumentFormSubmitInput = {
  document: ProjectDocumentCreateInput
  file: File | null
}

type DocumentFormValues = {
  project_id: string
  document_type: string
  version: string
  status: string
  file_name: string
  file_type: string
}

type DocumentFormProps = {
  document?: ProjectDocument
  projects: Project[]
  lockedProjectId?: string
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (input: ProjectDocumentFormSubmitInput) => void
}

function getInitialValues(
  document?: ProjectDocument,
  lockedProjectId?: string
): DocumentFormValues {
  return {
    project_id: lockedProjectId ?? document?.project_id ?? "",
    document_type: document?.document_type ?? "Drawing",
    version: document?.version ?? "",
    status: document?.status ?? "Uploaded",
    file_name: document?.file_name ?? "",
    file_type: document?.file_type ?? "",
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toDocumentInput(
  values: DocumentFormValues
): ProjectDocumentCreateInput {
  return {
    project_id: emptyToNull(values.project_id),
    document_type: emptyToNull(values.document_type),
    version: emptyToNull(values.version),
    status: emptyToNull(values.status),
    file_name: values.file_name.trim(),
    file_type: emptyToNull(values.file_type),
  }
}

export function DocumentForm({
  document,
  projects,
  lockedProjectId,
  submitLabel,
  isSubmitting = false,
  error,
  onCancel,
  onSubmit,
}: DocumentFormProps) {
  const idPrefix = useId()
  const lockedProject = lockedProjectId
    ? projects.find((project) => project.id === lockedProjectId)
    : null
  const [values, setValues] = useState<DocumentFormValues>(() =>
    getInitialValues(document, lockedProjectId)
  )
  const [file, setFile] = useState<File | null>(null)

  function updateValue(name: keyof DocumentFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile)

    if (selectedFile && !document) {
      setValues((current) => ({
        ...current,
        file_name: selectedFile.name,
        file_type: selectedFile.type || current.file_type,
      }))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      document: toDocumentInput(values),
      file,
    })
  }

  const isCreate = !document
  const canSubmit =
    Boolean(values.project_id) &&
    Boolean(values.file_name.trim()) &&
    (!isCreate || Boolean(file))

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
          <Label htmlFor={`${idPrefix}-file`}>File upload</Label>
          <Input
            id={`${idPrefix}-file`}
            name="file"
            type="file"
            required={isCreate}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          {document && (
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current file.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-document_type`}>Document Type</Label>
          <Select
            id={`${idPrefix}-document_type`}
            name="document_type"
            value={values.document_type}
            onChange={(event) =>
              updateValue("document_type", event.target.value)
            }
          >
            {documentTypes.map((documentType) => (
              <option key={documentType} value={documentType}>
                {documentType}
              </option>
            ))}
          </Select>
        </div>

        <TextField
          id={`${idPrefix}-version`}
          label="Version"
          name="version"
          value={values.version}
          onChange={(value) => updateValue("version", value)}
        />

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            value={values.status}
            onChange={(event) => updateValue("status", event.target.value)}
          >
            {documentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <TextField
          id={`${idPrefix}-file_name`}
          label="File Name"
          name="file_name"
          value={values.file_name}
          onChange={(value) => updateValue("file_name", value)}
        />
        <TextField
          id={`${idPrefix}-file_type`}
          label="File Type"
          name="file_type"
          value={values.file_type}
          onChange={(value) => updateValue("file_type", value)}
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
        <Button type="submit" disabled={isSubmitting || !canSubmit}>
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
