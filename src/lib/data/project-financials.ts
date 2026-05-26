import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type ProjectFinancial =
  Database["public"]["Tables"]["project_financials"]["Row"]
export type ProjectFinancialCreateInput =
  Database["public"]["Tables"]["project_financials"]["Insert"]
export type ProjectFinancialUpdateInput =
  Database["public"]["Tables"]["project_financials"]["Update"]

export type ProjectFinancialDataErrorCode =
  | "missing_config"
  | "query_failed"
  | "not_found"

export class ProjectFinancialDataError extends Error {
  code: ProjectFinancialDataErrorCode

  constructor(
    message: string,
    code: ProjectFinancialDataErrorCode = "query_failed"
  ) {
    super(message)
    this.name = "ProjectFinancialDataError"
    this.code = code
  }
}

export function isMissingProjectFinancialConfigError(
  error: unknown
): error is ProjectFinancialDataError {
  return (
    error instanceof ProjectFinancialDataError &&
    error.code === "missing_config"
  )
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new ProjectFinancialDataError(
      getSupabaseConfigMessage(),
      "missing_config"
    )
  }

  return createSupabaseBrowserClient()
}

export async function getProjectFinancialByProjectId(projectId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_financials")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    throw new ProjectFinancialDataError(error.message)
  }

  return data?.[0] ?? null
}

export async function getProjectFinancials() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_financials")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new ProjectFinancialDataError(error.message)
  }

  return data ?? []
}

export async function createProjectFinancial(
  input: ProjectFinancialCreateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_financials")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new ProjectFinancialDataError(error.message)
  }

  return data
}

export async function updateProjectFinancial(
  id: string,
  input: ProjectFinancialUpdateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_financials")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new ProjectFinancialDataError(error.message)
  }

  return data
}

export async function upsertProjectFinancialByProjectId(
  projectId: string,
  input: ProjectFinancialUpdateInput
) {
  const existingFinancial = await getProjectFinancialByProjectId(projectId)
  const payload = {
    ...input,
    project_id: projectId,
  }

  if (existingFinancial) {
    return updateProjectFinancial(existingFinancial.id, payload)
  }

  return createProjectFinancial(payload)
}

export async function deleteProjectFinancial(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase
    .from("project_financials")
    .delete()
    .eq("id", id)

  if (error) {
    throw new ProjectFinancialDataError(error.message)
  }
}
