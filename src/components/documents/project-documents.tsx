"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { DocumentCard } from "@/components/documents/document-card"
import {
  type ProjectDocumentFormSubmitInput,
} from "@/components/documents/document-form"
import { DocumentFormSheet } from "@/components/documents/document-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  createDocument,
  deleteDocument,
  getDocumentsByProjectId,
  isMissingDocumentBucketError,
  isMissingDocumentConfigError,
  removeProjectDocumentFile,
  updateDocument,
  uploadProjectDocumentFile,
  type ProjectDocument,
  type ProjectDocumentCreateInput,
} from "@/lib/data/documents"
import type { Project } from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectDocuments({ project }: { project: Project }) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingDocument, setEditingDocument] =
    useState<ProjectDocument | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadDocuments = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getDocumentsByProjectId(project.id)
      setDocuments(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadDocuments()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadDocuments])

  async function refreshDocuments() {
    const data = await getDocumentsByProjectId(project.id)
    setDocuments(data)
  }

  async function handleCreateDocument(input: ProjectDocumentFormSubmitInput) {
    if (!input.file) {
      setMutationError("Select a file before creating a document.")
      return
    }

    setIsSaving(true)
    setMutationError(null)

    let uploadedStoragePath: string | null = null

    try {
      const uploaded = await uploadProjectDocumentFile(input.file, project.id)
      uploadedStoragePath = uploaded.storagePath
      await createDocument({
        ...input.document,
        project_id: project.id,
        ...toFilePayload(input.document, uploaded),
      })
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
        project_id: project.id,
      }

      if (input.file) {
        const uploaded = await uploadProjectDocumentFile(input.file, project.id)
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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Project files, review status, and storage-backed metadata.
            </CardDescription>
          </div>
          <DocumentFormSheet
            open={createOpen}
            title="Upload project document"
            description={`Upload a document linked to ${project.name}.`}
            submitLabel="Create document"
            projects={[project]}
            lockedProjectId={project.id}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <DocumentFormSheet
          open={editOpen}
          title="Edit project document"
          description="Update document metadata or replace the stored file."
          submitLabel="Save changes"
          projects={[project]}
          lockedProjectId={project.id}
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

        {loadState === "loading" && (
          <div className="space-y-3">
            {[0, 1].map((item) => (
              <div key={item} className="h-28 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Documents failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadDocuments()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && documents.length === 0 && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No documents</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Upload the first document for this project.
            </p>
          </div>
        )}

        {loadState === "ready" &&
          documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={openEdit}
              onDelete={handleDeleteDocument}
              onAnalyzed={refreshDocuments}
            />
          ))}
      </CardContent>
    </Card>
  )
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
    isMissingDocumentBucketError(error)
  ) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected document error."
}
