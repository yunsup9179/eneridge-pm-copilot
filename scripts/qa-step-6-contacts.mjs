import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  const content = readFileSync(envPath, "utf8")

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const index = trimmed.indexOf("=")
    if (index === -1) {
      continue
    }

    const key = trimmed.slice(0, index)
    const value = trimmed.slice(index + 1)
    process.env[key] = process.env[key] ?? value
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`)
  }
}

function summarizeSupabaseError(error) {
  if (!error) {
    return "Unknown Supabase error"
  }

  return [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" | ")
}

async function run() {
  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const marker = `QA_STEP_6_${Date.now()}`
  const created = {
    projectId: null,
    contactId: null,
  }

  async function insert(table, payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select("*")
      .single()
    if (error) {
      throw new Error(`Insert failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function update(table, id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single()
    if (error) {
      throw new Error(`Update failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function readById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single()
    if (error) {
      throw new Error(`Read failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function upsertProjectContact(projectId, contactId, relationshipType) {
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
      throw new Error(`Project contact upsert failed: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function readProjectContact(projectId, contactId) {
    const { data, error } = await supabase
      .from("project_contacts")
      .select("*")
      .eq("project_id", projectId)
      .eq("contact_id", contactId)
      .single()
    if (error) {
      throw new Error(`Project contact read failed: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function safeDelete(table, id) {
    if (!id) {
      return
    }

    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) {
      console.error(`Cleanup failed for ${table}/${id}: ${summarizeSupabaseError(error)}`)
    }
  }

  async function safeUnlink(projectId, contactId) {
    if (!projectId || !contactId) {
      return
    }

    const { error } = await supabase
      .from("project_contacts")
      .delete()
      .eq("project_id", projectId)
      .eq("contact_id", contactId)
    if (error) {
      console.error(`Cleanup failed for project_contacts: ${summarizeSupabaseError(error)}`)
    }
  }

  async function cleanup() {
    await safeUnlink(created.projectId, created.contactId)
    await safeDelete("contacts", created.contactId)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 6 Contacts - ${marker}`,
      location: "QA Test Location",
      customer: "QA Temporary Customer",
      city: "QA City",
      utility: "QA Utility",
      phase: "QA",
      status: "Active",
      priority: "Low",
      summary: `Temporary QA record ${marker}`,
    })
    created.projectId = project.id

    const contact = await insert("contacts", {
      name: `QA Temporary Contact - ${marker}`,
      company: "QA Temporary Company",
      role: "QA Stakeholder",
      email: `qa-step-6-${marker}@example.com`,
      phone: "555-0100",
      notes: `Temporary QA record ${marker}`,
      communication_style: "QA test communication style",
      last_contacted_at: new Date().toISOString(),
    })
    created.contactId = contact.id

    const rereadContact = await readById("contacts", contact.id)
    assertEqual(rereadContact.name, contact.name, "Contact name readback")

    const linked = await upsertProjectContact(project.id, contact.id, "Utility")
    assertEqual(linked.relationship_type, "Utility", "Project contact link relationship")

    const rereadLink = await readProjectContact(project.id, contact.id)
    assertEqual(rereadLink.project_id, project.id, "Project contact project_id readback")
    assertEqual(rereadLink.contact_id, contact.id, "Project contact contact_id readback")

    const updatedContact = await update("contacts", contact.id, {
      role: "QA Stakeholder Updated",
      notes: `Temporary QA record ${marker} - updated`,
    })
    assertEqual(updatedContact.role, "QA Stakeholder Updated", "Contact update readback")

    const updatedLink = await upsertProjectContact(project.id, contact.id, "Engineer")
    assertEqual(updatedLink.relationship_type, "Engineer", "Project contact relationship update")

    await safeUnlink(project.id, contact.id)
    const { data: deletedLink, error: deletedLinkError } = await supabase
      .from("project_contacts")
      .select("*")
      .eq("project_id", project.id)
      .eq("contact_id", contact.id)
      .maybeSingle()
    if (deletedLinkError) {
      throw new Error(`Project contact unlink verification failed: ${summarizeSupabaseError(deletedLinkError)}`)
    }
    assertEqual(deletedLink, null, "Project contact unlink readback")

    await safeDelete("contacts", created.contactId)
    created.contactId = null
    await safeDelete("projects", created.projectId)
    created.projectId = null

    console.log("QA Step 6 contact checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 6 RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 6 RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
