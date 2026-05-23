import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Project } from "@/lib/data/projects"
import type { Database } from "@/lib/supabase/types"

export type ActionItem = Database["public"]["Tables"]["action_items"]["Row"]
export type ActionItemCreateInput =
  Database["public"]["Tables"]["action_items"]["Insert"]
export type ActionItemUpdateInput =
  Database["public"]["Tables"]["action_items"]["Update"]

export type ActionItemWithProject = ActionItem & {
  project: Pick<Project, "id" | "name"> | null
}

export type ActionItemDataErrorCode =
  | "missing_config"
  | "query_failed"
  | "not_found"

export class ActionItemDataError extends Error {
  code: ActionItemDataErrorCode

  constructor(
    message: string,
    code: ActionItemDataErrorCode = "query_failed"
  ) {
    super(message)
    this.name = "ActionItemDataError"
    this.code = code
  }
}

export function isMissingActionItemConfigError(
  error: unknown
): error is ActionItemDataError {
  return (
    error instanceof ActionItemDataError && error.code === "missing_config"
  )
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new ActionItemDataError(
      getSupabaseConfigMessage(),
      "missing_config"
    )
  }

  return createSupabaseBrowserClient()
}

async function attachProjects(
  actionItems: ActionItem[]
): Promise<ActionItemWithProject[]> {
  const projectIds = Array.from(
    new Set(
      actionItems
        .map((item) => item.project_id)
        .filter((projectId): projectId is string => Boolean(projectId))
    )
  )

  if (projectIds.length === 0) {
    return actionItems.map((item) => ({
      ...item,
      project: null,
    }))
  }

  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", projectIds)

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  const projectsById = new Map(
    (data ?? []).map((project) => [project.id, project])
  )

  return actionItems.map((item) => ({
    ...item,
    project: item.project_id ? projectsById.get(item.project_id) ?? null : null,
  }))
}

export async function getActionItems() {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("action_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  return attachProjects(data ?? [])
}

export async function getActionItemsByProjectId(projectId: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("action_items")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true, nullsFirst: false })

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  return data ?? []
}

export async function getActionItemById(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("action_items")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  if (!data) {
    throw new ActionItemDataError("Action item not found.", "not_found")
  }

  return data
}

export async function createActionItem(input: ActionItemCreateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("action_items")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  return data
}

export async function updateActionItem(
  id: string,
  input: ActionItemUpdateInput
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("action_items")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new ActionItemDataError(error.message)
  }

  return data
}

export async function deleteActionItem(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.from("action_items").delete().eq("id", id)

  if (error) {
    throw new ActionItemDataError(error.message)
  }
}

export async function completeActionItem(id: string) {
  return updateActionItem(id, {
    status: "Completed",
    completed_at: new Date().toISOString(),
  })
}
