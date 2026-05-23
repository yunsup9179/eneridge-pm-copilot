import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Project } from "@/lib/data/projects"
import type { Database } from "@/lib/supabase/types"

export type Risk = Database["public"]["Tables"]["risks"]["Row"]
export type RiskCreateInput = Database["public"]["Tables"]["risks"]["Insert"]
export type RiskUpdateInput = Database["public"]["Tables"]["risks"]["Update"]

export type RiskWithProject = Risk & {
  project: Pick<Project, "id" | "name"> | null
}

export type RiskDataErrorCode = "missing_config" | "query_failed" | "not_found"

export class RiskDataError extends Error {
  code: RiskDataErrorCode

  constructor(message: string, code: RiskDataErrorCode = "query_failed") {
    super(message)
    this.name = "RiskDataError"
    this.code = code
  }
}

export function isMissingRiskConfigError(
  error: unknown
): error is RiskDataError {
  return error instanceof RiskDataError && error.code === "missing_config"
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new RiskDataError(getSupabaseConfigMessage(), "missing_config")
  }

  return createSupabaseBrowserClient()
}

async function attachProjects(risks: Risk[]): Promise<RiskWithProject[]> {
  const projectIds = Array.from(
    new Set(
      risks
        .map((risk) => risk.project_id)
        .filter((projectId): projectId is string => Boolean(projectId))
    )
  )

  if (projectIds.length === 0) {
    return risks.map((risk) => ({
      ...risk,
      project: null,
    }))
  }

  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", projectIds)

  if (error) {
    throw new RiskDataError(error.message)
  }

  const projectsById = new Map(
    (data ?? []).map((project) => [project.id, project])
  )

  return risks.map((risk) => ({
    ...risk,
    project: risk.project_id ? projectsById.get(risk.project_id) ?? null : null,
  }))
}

export async function getRisks() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("risks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new RiskDataError(error.message)
  }

  return attachProjects(data ?? [])
}

export async function getRisksByProjectId(projectId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("risks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new RiskDataError(error.message)
  }

  return data ?? []
}

export async function getRiskById(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("risks")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new RiskDataError(error.message)
  }

  if (!data) {
    throw new RiskDataError("Risk not found.", "not_found")
  }

  return data
}

export async function createRisk(input: RiskCreateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("risks")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new RiskDataError(error.message)
  }

  return data
}

export async function updateRisk(id: string, input: RiskUpdateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("risks")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new RiskDataError(error.message)
  }

  return data
}

export async function deleteRisk(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.from("risks").delete().eq("id", id)

  if (error) {
    throw new RiskDataError(error.message)
  }
}

export async function closeRisk(id: string) {
  return updateRisk(id, {
    status: "Closed",
  })
}
