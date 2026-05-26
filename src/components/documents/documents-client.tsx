"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { DocumentCard } from "@/components/documents/document-card"
import {
  type ProjectDocumentFormSubmitInput,
} from "@/components/documents/document-form"
import { DocumentFormSheet } from "@/components/documents/document-form-sheet"
import {
  documentStatuses,
  documentTypes,
} from "@/components/documents/document-options"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  createDocument,
  deleteDocument,
  getDocuments,
  isMissingDocumentBucketError,
  isMissingDocumentConfigError,
  removeProjectDocumentFile,
  updateDocument,
  uploadProjectDocumentFile,
  type ProjectDocument,
  type ProjectDocumentCreateInput,
  type ProjectDocumentWithProject,
} from "@/lib/data/documents"
import {
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
} from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function DocumentsClient() {
  const [documents, setDocuments] = useState<ProjectDocumentWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingDocument, setEditingDocument] =
    useState<ProjectDocument | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const [projectData, documentData] = await Promise.all([
        getProjects(),
        getDocuments(),
      ])
      setProjects(projectData)
      setDocuments(documentData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadData])

  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const matchesStatus =
          statusFilter === "All" || document.status === statusFilter
        const matchesType =
          typeFilter === "All" || document.document_type === typeFilter

        return matchesStatus && matchesType
      }),
    [documents, statusFilter, typeFilter]
  )

  async function refreshDocuments() {
    const data = await getDocuments()
    setDocuments(data)
  }

  async function handleCreateDocument(input: ProjectDocumentFormSubmitInput) {
    if (!input.file || !input.document.project_id) {
      setMutationError("Select a project and file before creating a document.")
      return
    }

    setIsSaving(true)
    setMutationError(null)

    let uploadedStoragePath: string | null = null

    try {
      const uploaded = await uploadProjectDocumentFile(
        input.file,
        input.document.project_id
      )
      uploadedStoragePath = uploaded.storagePath
      await createDocument(toCreatePayload(input.document, uploaded))
      await refreshDocuments()
      setCreateOpen(false)
    } catch (error) {
      if (uploadedStoragePath) {
        await cleanupUploadedFile(uploadedStoragePath)
      }
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateDocument(input: ProjectDocumentFormSubmitInput) {
    if (!editingDocument) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    let uploadedStoragePath: string | null = null

    try {
      const payload: ProjectDocumentCreateInput = {
        ...input.document,
        project_id: editingDocument.project_id,
      }

      if (input.file && editingDocument.project_id) {
        const uploaded = await uploadProjectDocumentFile(
          input.file,
          editingDocument.project_id
        )
        uploadedStoragePath = uploaded.storagePath
        Object.assign(payload, toFilePayload(input.document, uploaded))
      }

      await updateDocument(editingDocument.id, payload)

      if (uploadedStoragePath && editingDocument.storage_path) {
        try {
          await removeProjectDocumentFile(editingDocument.storage_path)
        } catch (storageError) {
          setMutationError(
            `Document updated, but the previous file was not removed: ${getErrorMessage(storageError)}`
          )
        }
      }

      await refreshDocuments()
      setEditOpen(false)
      setEditingDocument(null)
    } catch (error) {
      if (uploadedStoragePath) {
        await cleanupUploadedFile(uploadedStoragePath)
      }
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteDocument(document: ProjectDocument) {
    const confirmed = window.confirm(`Delete document "${document.file_name}"?`)

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      const result = await deleteDocument(document.id)
      await refreshDocuments()
      if (result.storageRemovalError) {
        setMutationError(
          `Document row deleted, but the file was not removed: ${result.storageRemovalError}`
        )
      }
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  function openEdit(document: ProjectDocument) {
    setEditingDocument(document)
    setMutationError(null)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Document library"
        description="Live project document library for drawings, quotes, agreements, permits, invoices, reimbursement records, and review status."
        actions={
          <DocumentFormSheet
            open={createOpen}
            title="Upload document"
            description="Upload a file and store project-linked document metadata."
            submitLabel="Create document"
            projects={projects}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button disabled={projects.length === 0}>
                <Plus />
                New Document
              </Button>
            }
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateDocument}
          />
        }
      />

      <DocumentFormSheet
        open={editOpen}
        title="Edit document"
        description="Update document metadata or replace the stored file."
        submitLabel="Save changes"
        projects={projects}
        document={editingDocument ?? undefined}
        isSubmitting={isSaving}
        error={mutationError}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setEditingDocument(null)
          }
          if (open) {
            setMutationError(null)
          }
        }}
        onSubmit={handleUpdateDocument}
      />

      {mutationError && !createOpen && !editOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {loadState === "loading" && <DocumentsLoadingState />}

      {loadState === "error" && (
        <DocumentsErrorState
          message={loadError ?? "Unable to load documents."}
          onRetry={() => void loadData()}
        />
      )}

      {loadState === "ready" && (
        <>
          <DocumentFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
          />

          {documents.length === 0 ? (
            <DocumentsEmptyState
              hasProjects={projects.length > 0}
              onCreate={() => setCreateOpen(true)}
            />
          ) : filteredDocuments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No documents match these filters</CardTitle>
                <CardDescription>
                  Adjust the type or status filter to see more records.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  showProject
                  onEdit={openEdit}
                  onDelete={handleDeleteDocument}
                  onAnalyzed={refreshDocuments}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DocumentFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: {
  statusFilter: string
  typeFilter: string
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
}) {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="document-status-filter">Status</Label>
          <Select
            id="document-status-filter"
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="All">All statuses</option>
            {documentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="document-type-filter">Document Type</Label>
          <Select
            id="document-type-filter"
            value={typeFilter}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="All">All types</option>
            {documentTypes.map((documentType) => (
              <option key={documentType} value={documentType}>
                {documentType}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentsLoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-32 rounded-lg bg-muted" />
      ))}
    </div>
  )
}

function DocumentsErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  const isMissingConfig = message.includes("NEXT_PUBLIC_SUPABASE")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isMissingConfig
            ? "Supabase is not configured"
            : "Documents failed to load"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

function DocumentsEmptyState({
  hasProjects,
  onCreate,
}: {
  hasProjects: boolean
  onCreate: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No documents yet</CardTitle>
        <CardDescription>
          {hasProjects
            ? "Upload the first project document."
            : "Create a project before uploading documents."}
        </CardDescription>
      </CardHeader>
      {hasProjects && (
        <CardContent>
          <Button onClick={onCreate}>
            <Plus />
            New Document
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

function toCreatePayload(
  document: ProjectDocumentCreateInput,
  uploaded: {
    fileName: string
    fileType: string | null
    storagePath: string
    storageUrl: string | null
  }
): ProjectDocumentCreateInput {
  return {
    ...document,
    ...toFilePayload(document, uploaded),
  }
}

function toFilePayload(
  document: ProjectDocumentCreateInput,
  uploaded: {
    fileName: string
    fileType: string | null
    storagePath: string
    storageUrl: string | null
  }
): ProjectDocumentCreateInput {
  return {
    file_name: document.file_name || uploaded.fileName,
    file_type: document.file_type ?? uploaded.fileType,
    storage_path: uploaded.storagePath,
    storage_url: uploaded.storageUrl,
    uploaded_at: new Date().toISOString(),
  }
}

async function cleanupUploadedFile(storagePath: string) {
  try {
    await removeProjectDocumentFile(storagePath)
  } catch {
    // The original operation already failed; leave cleanup failures non-blocking.
  }
}

function getErrorMessage(error: unknown) {
  if (
    isMissingDocumentConfigError(error) ||
    isMissingDocumentBucketError(error) ||
    isMissingSupabaseConfigError(error)
  ) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected document error."
}
