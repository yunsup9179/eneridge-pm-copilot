import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Project } from "@/lib/data/projects"
import type { Database } from "@/lib/supabase/types"

export const PROJECT_DOCUMENTS_BUCKET = "project-documents"

export type ProjectDocument =
  Database["public"]["Tables"]["documents"]["Row"]
export type ProjectDocumentCreateInput =
  Database["public"]["Tables"]["documents"]["Insert"]
export type ProjectDocumentUpdateInput =
  Database["public"]["Tables"]["documents"]["Update"]

export type ProjectDocumentWithProject = ProjectDocument & {
  project: Pick<Project, "id" | "name"> | null
}

export type UploadedProjectDocumentFile = {
  fileName: string
  fileType: string | null
  storagePath: string
  storageUrl: string | null
}

export type DocumentDeleteResult = {
  storageRemovalError: string | null
}

export type DocumentDataErrorCode =
  | "missing_config"
  | "missing_bucket"
  | "query_failed"
  | "not_found"

export class DocumentDataError extends Error {
  code: DocumentDataErrorCode

  constructor(message: string, code: DocumentDataErrorCode = "query_failed") {
    super(message)
    this.name = "DocumentDataError"
    this.code = code
  }
}

export function isMissingDocumentConfigError(
  error: unknown
): error is DocumentDataError {
  return error instanceof DocumentDataError && error.code === "missing_config"
}

export function isMissingDocumentBucketError(
  error: unknown
): error is DocumentDataError {
  return error instanceof DocumentDataError && error.code === "missing_bucket"
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new DocumentDataError(getSupabaseConfigMessage(), "missing_config")
  }

  return createSupabaseBrowserClient()
}

async function attachProjects(
  documents: ProjectDocument[]
): Promise<ProjectDocumentWithProject[]> {
  const projectIds = Array.from(
    new Set(
      documents
        .map((document) => document.project_id)
        .filter((projectId): projectId is string => Boolean(projectId))
    )
  )

  if (projectIds.length === 0) {
    return documents.map((document) => ({
      ...document,
      project: null,
    }))
  }

  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", projectIds)

  if (error) {
    throw new DocumentDataError(error.message)
  }

  const projectsById = new Map(
    (data ?? []).map((project) => [project.id, project])
  )

  return documents.map((document) => ({
    ...document,
    project: document.project_id
      ? projectsById.get(document.project_id) ?? null
      : null,
  }))
}

export async function getDocuments() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false })

  if (error) {
    throw new DocumentDataError(error.message)
  }

  return attachProjects(data ?? [])
}

export async function getDocumentsByProjectId(projectId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("uploaded_at", { ascending: false })

  if (error) {
    throw new DocumentDataError(error.message)
  }

  return data ?? []
}

export async function getDocumentById(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new DocumentDataError(error.message)
  }

  if (!data) {
    throw new DocumentDataError("Document not found.", "not_found")
  }

  return data
}

export async function createDocument(input: ProjectDocumentCreateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("documents")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new DocumentDataError(error.message)
  }

  return data
}

export async function updateDocument(
  id: string,
  input: ProjectDocumentUpdateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("documents")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new DocumentDataError(error.message)
  }

  return data
}

export async function deleteDocument(
  id: string
): Promise<DocumentDeleteResult> {
  const document = await getDocumentById(id)
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.from("documents").delete().eq("id", id)

  if (error) {
    throw new DocumentDataError(error.message)
  }

  if (!document.storage_path) {
    return { storageRemovalError: null }
  }

  try {
    await removeProjectDocumentFile(document.storage_path)
    return { storageRemovalError: null }
  } catch (storageError) {
    return { storageRemovalError: getErrorMessage(storageError) }
  }
}

export async function uploadProjectDocumentFile(
  file: File,
  projectId: string
): Promise<UploadedProjectDocumentFile> {
  const supabase = getSupabaseClientOrThrow()
  const fileName = file.name
  const fileType = file.type || null
  const storagePath = `${projectId}/${Date.now()}-${toSafeFileName(fileName)}`
  const { data, error } = await supabase.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: fileType ?? "application/octet-stream",
      upsert: false,
    })

  if (error) {
    throw toStorageDataError(error)
  }

  return {
    fileName,
    fileType,
    storagePath: data.path,
    storageUrl: null,
  }
}

export async function removeProjectDocumentFile(storagePath: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .remove([storagePath])

  if (error) {
    throw toStorageDataError(error)
  }
}

export async function getProjectDocumentSignedUrl(storagePath: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 5)

  if (error) {
    throw toStorageDataError(error)
  }

  return data.signedUrl
}

function toSafeFileName(fileName: string) {
  const safeName = fileName
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return safeName || "document"
}

function toStorageDataError(error: { message?: string }) {
  const message = error.message ?? "Unexpected Supabase Storage error."

  if (isMissingBucketMessage(message)) {
    return new DocumentDataError(
      `Supabase Storage bucket "${PROJECT_DOCUMENTS_BUCKET}" is missing. Create the bucket and apply the Step 5 storage policies before uploading documents.`,
      "missing_bucket"
    )
  }

  return new DocumentDataError(message)
}

function isMissingBucketMessage(message: string) {
  return /bucket not found|resource was not found|not found/i.test(message)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected document error."
}
