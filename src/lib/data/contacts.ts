import {
  createSupabaseBrowserClient,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import type { Project } from "@/lib/data/projects"
import type { Database } from "@/lib/supabase/types"

export type Contact = Database["public"]["Tables"]["contacts"]["Row"]
export type ContactCreateInput =
  Database["public"]["Tables"]["contacts"]["Insert"]
export type ContactUpdateInput =
  Database["public"]["Tables"]["contacts"]["Update"]
export type ProjectContact =
  Database["public"]["Tables"]["project_contacts"]["Row"]

export type ContactProjectLink = ProjectContact & {
  project: Pick<Project, "id" | "name"> | null
}

export type ContactWithProjects = Contact & {
  projectLinks: ContactProjectLink[]
}

export type ProjectContactWithContact = ProjectContact & {
  contact: Contact
}

export type ContactDataErrorCode =
  | "missing_config"
  | "query_failed"
  | "not_found"

export class ContactDataError extends Error {
  code: ContactDataErrorCode

  constructor(message: string, code: ContactDataErrorCode = "query_failed") {
    super(message)
    this.name = "ContactDataError"
    this.code = code
  }
}

export function isMissingContactConfigError(
  error: unknown
): error is ContactDataError {
  return error instanceof ContactDataError && error.code === "missing_config"
}

function getSupabaseClientOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new ContactDataError(getSupabaseConfigMessage(), "missing_config")
  }

  return createSupabaseBrowserClient()
}

export async function getContacts(): Promise<ContactWithProjects[]> {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    throw new ContactDataError(error.message)
  }

  return attachProjectLinks(data ?? [])
}

export async function getContactById(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new ContactDataError(error.message)
  }

  if (!data) {
    throw new ContactDataError("Contact not found.", "not_found")
  }

  return data
}

export async function createContact(input: ContactCreateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("contacts")
    .insert(input)
    .select("*")
    .single()

  if (error) {
    throw new ContactDataError(error.message)
  }

  return data
}

export async function updateContact(id: string, input: ContactUpdateInput) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("contacts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new ContactDataError(error.message)
  }

  return data
}

export async function deleteContact(id: string) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) {
    throw new ContactDataError(error.message)
  }
}

export async function getContactsByProjectId(
  projectId: string
): Promise<ProjectContactWithContact[]> {
  const supabase = getSupabaseClientOrThrow()
  const { data: links, error: linksError } = await supabase
    .from("project_contacts")
    .select("*")
    .eq("project_id", projectId)

  if (linksError) {
    throw new ContactDataError(linksError.message)
  }

  if (!links || links.length === 0) {
    return []
  }

  const contactIds = links.map((link) => link.contact_id)
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .in("id", contactIds)
    .order("name", { ascending: true })

  if (contactsError) {
    throw new ContactDataError(contactsError.message)
  }

  const linksByContactId = new Map(
    links.map((link) => [link.contact_id, link])
  )

  return (contacts ?? [])
    .map((contact) => ({
      ...(linksByContactId.get(contact.id) as ProjectContact),
      contact,
    }))
    .filter((link) => Boolean(link.project_id))
}

export async function linkContactToProject(
  projectId: string,
  contactId: string,
  relationshipType: string | null
) {
  const supabase = getSupabaseClientOrThrow()
  const { data, error } = await supabase
    .from("project_contacts")
    .upsert(
      {
        project_id: projectId,
        contact_id: contactId,
        relationship_type: relationshipType,
      },
      { onConflict: "project_id,contact_id" }
    )
    .select("*")
    .single()

  if (error) {
    throw new ContactDataError(error.message)
  }

  return data
}

export async function unlinkContactFromProject(
  projectId: string,
  contactId: string
) {
  const supabase = getSupabaseClientOrThrow()
  const { error } = await supabase
    .from("project_contacts")
    .delete()
    .eq("project_id", projectId)
    .eq("contact_id", contactId)

  if (error) {
    throw new ContactDataError(error.message)
  }
}

async function attachProjectLinks(
  contacts: Contact[]
): Promise<ContactWithProjects[]> {
  if (contacts.length === 0) {
    return []
  }

  const supabase = getSupabaseClientOrThrow()
  const contactIds = contacts.map((contact) => contact.id)
  const { data: links, error: linksError } = await supabase
    .from("project_contacts")
    .select("*")
    .in("contact_id", contactIds)

  if (linksError) {
    throw new ContactDataError(linksError.message)
  }

  const projectIds = Array.from(
    new Set((links ?? []).map((link) => link.project_id))
  )
  const projectsById = new Map<string, Pick<Project, "id" | "name">>()

  if (projectIds.length > 0) {
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", projectIds)

    if (projectsError) {
      throw new ContactDataError(projectsError.message)
    }

    for (const project of projects ?? []) {
      projectsById.set(project.id, project)
    }
  }

  const linksByContactId = new Map<string, ContactProjectLink[]>()

  for (const link of links ?? []) {
    const current = linksByContactId.get(link.contact_id) ?? []
    current.push({
      ...link,
      project: projectsById.get(link.project_id) ?? null,
    })
    linksByContactId.set(link.contact_id, current)
  }

  return contacts.map((contact) => ({
    ...contact,
    projectLinks: linksByContactId.get(contact.id) ?? [],
  }))
}
