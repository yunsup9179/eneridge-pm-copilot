import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type ProjectChargerGroup =
  Database["public"]["Tables"]["project_charger_groups"]["Row"]
export type ProjectChargerGroupCreateInput =
  Database["public"]["Tables"]["project_charger_groups"]["Insert"]
export type ProjectChargerGroupUpdateInput =
  Database["public"]["Tables"]["project_charger_groups"]["Update"]

export type ProjectChargerConnector =
  Database["public"]["Tables"]["project_charger_connectors"]["Row"]
export type ProjectChargerConnectorCreateInput =
  Database["public"]["Tables"]["project_charger_connectors"]["Insert"]
export type ProjectChargerConnectorUpdateInput =
  Database["public"]["Tables"]["project_charger_connectors"]["Update"]

export type ProjectChargerGroupWithConnectors = ProjectChargerGroup & {
  connectors: ProjectChargerConnector[]
}

export type ProjectChargerDataErrorCode =
  | "missing_config"
  | "query_failed"
  | "not_found"

export class ProjectChargerDataError extends Error {
  code: ProjectChargerDataErrorCode

  constructor(
    message: string,
    code: ProjectChargerDataErrorCode = "query_failed"
  ) {
    super(message)
    this.name = "ProjectChargerDataError"
    this.code = code
  }
}

export function isMissingProjectChargerConfigError(
  error: unknown
): error is ProjectChargerDataError {
  return (
    error instanceof ProjectChargerDataError && error.code === "missing_config"
  )
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new ProjectChargerDataError(
      getSupabaseConfigMessage(),
      "missing_config"
    )
  }

  return createSupabaseBrowserClient()
}

export async function getProjectChargerGroups() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_groups")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data ?? []
}

export async function getProjectChargerGroupsByProjectId(projectId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_groups")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data ?? []
}

export async function getProjectChargerGroupById(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_groups")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  if (!data) {
    throw new ProjectChargerDataError("Charger group not found.", "not_found")
  }

  return data
}

export async function createProjectChargerGroup(
  input: ProjectChargerGroupCreateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_groups")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data
}

export async function updateProjectChargerGroup(
  id: string,
  input: ProjectChargerGroupUpdateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_groups")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data
}

export async function deleteProjectChargerGroup(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase
    .from("project_charger_groups")
    .delete()
    .eq("id", id)

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }
}

export async function getConnectorsByChargerGroupId(chargerGroupId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_connectors")
    .select("*")
    .eq("charger_group_id", chargerGroupId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data ?? []
}

export async function createProjectChargerConnector(
  input: ProjectChargerConnectorCreateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_connectors")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data
}

export async function updateProjectChargerConnector(
  id: string,
  input: ProjectChargerConnectorUpdateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_connectors")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  return data
}

export async function deleteProjectChargerConnector(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase
    .from("project_charger_connectors")
    .delete()
    .eq("id", id)

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }
}

export async function getProjectChargerGroupsWithConnectorsByProjectId(
  projectId: string
): Promise<ProjectChargerGroupWithConnectors[]> {
  const groups = await getProjectChargerGroupsByProjectId(projectId)

  if (groups.length === 0) {
    return []
  }

  const groupIds = groups.map((group) => group.id)
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_charger_connectors")
    .select("*")
    .in("charger_group_id", groupIds)
    .order("created_at", { ascending: true })

  if (error) {
    throw new ProjectChargerDataError(error.message)
  }

  const connectorsByGroupId = new Map<string, ProjectChargerConnector[]>()

  for (const connector of data ?? []) {
    const current = connectorsByGroupId.get(connector.charger_group_id ?? "") ?? []
    current.push(connector)
    connectorsByGroupId.set(connector.charger_group_id ?? "", current)
  }

  return groups.map((group) => ({
    ...group,
    connectors: connectorsByGroupId.get(group.id) ?? [],
  }))
}

