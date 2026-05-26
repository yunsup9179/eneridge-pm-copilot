import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectCreateInput =
  Database["public"]["Tables"]["projects"]["Insert"]
export type ProjectUpdateInput =
  Database["public"]["Tables"]["projects"]["Update"]

export type ProjectDataErrorCode =
  | "missing_config"
  | "query_failed"
  | "not_found"

export class ProjectDataError extends Error {
  code: ProjectDataErrorCode

  constructor(message: string, code: ProjectDataErrorCode = "query_failed") {
    super(message)
    this.name = "ProjectDataError"
    this.code = code
  }
}

export function isMissingSupabaseConfigError(
  error: unknown
): error is ProjectDataError {
  return error instanceof ProjectDataError && error.code === "missing_config"
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new ProjectDataError(getSupabaseConfigMessage(), "missing_config")
  }

  return createSupabaseBrowserClient()
}

function isMissingProjectStageColumnError(message: string) {
  return (
    message.includes("project_stage") &&
    (message.includes("schema cache") ||
      message.includes("column") ||
      message.includes("Could not find"))
  )
}

function withoutProjectStage<T extends ProjectCreateInput | ProjectUpdateInput>(
  input: T
) {
  const fallbackInput = { ...input }
  delete fallbackInput.project_stage
  return fallbackInput
}

export async function getProjects() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new ProjectDataError(error.message)
  }

  return data ?? []
}

export async function getProjectById(id: string) {
  if (!isUuid(id)) {
    throw new ProjectDataError("Project not found.", "not_found")
  }

  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new ProjectDataError(error.message)
  }

  if (!data) {
    throw new ProjectDataError("Project not found.", "not_found")
  }

  return data
}

export async function createProject(input: ProjectCreateInput) {
  const supabase = getSupabaseClientOrThrow()
  let { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select("*")
    .single()

  if (error && isMissingProjectStageColumnError(error.message)) {
    const fallbackInput = withoutProjectStage(input)
    const retry = await supabase
      .from("projects")
      .insert(fallbackInput)
      .select("*")
      .single()

    data = retry.data
    error = retry.error
  }

  if (error) {
    throw new ProjectDataError(error.message)
  }

  if (!data) {
    throw new ProjectDataError("Project was not returned after create.")
  }

  return data
}

export async function updateProject(id: string, input: ProjectUpdateInput) {
  const supabase = getSupabaseClientOrThrow()
  let { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error && isMissingProjectStageColumnError(error.message)) {
    const fallbackInput = withoutProjectStage(input)
    const retry = await supabase
      .from("projects")
      .update(fallbackInput)
      .eq("id", id)
      .select("*")
      .single()

    data = retry.data
    error = retry.error
  }

  if (error) {
    throw new ProjectDataError(error.message)
  }

  if (!data) {
    throw new ProjectDataError("Project was not returned after update.")
  }

  return data
}

export async function deleteProject(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    throw new ProjectDataError(error.message)
  }
}
