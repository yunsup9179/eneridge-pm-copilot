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

function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`${label}: expected to find ${expected}`)
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

  const routeSource = readFileSync(
    resolve(process.cwd(), "src/app/api/ai/draft-email/route.ts"),
    "utf8"
  )
  const pageSource = readFileSync(
    resolve(process.cwd(), "src/app/ai-workspace/page.tsx"),
    "utf8"
  )
  const componentSource = readFileSync(
    resolve(process.cwd(), "src/components/ai/email-draft-generator.tsx"),
    "utf8"
  )

  assertIncludes(routeSource, "OPENAI_API_KEY is missing", "Missing-key guard")
  assertIncludes(routeSource, "ai_analysis_logs", "AI log insert path")
  assertIncludes(routeSource, "email_draft", "Email draft agent type")
  assertIncludes(routeSource, "OPENAI_EMAIL_DRAFT_MODEL", "Email draft model env var")
  assertIncludes(pageSource, "EmailDraftGenerator", "AI workspace generator page")
  assertIncludes(componentSource, "Copy", "Copy-to-clipboard UI")
  assertIncludes(componentSource, "Investor / Partner", "Recipient type options")
  assertIncludes(componentSource, "Risk Escalation", "Purpose options")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const marker = `QA_STEP_9_${Date.now()}`
  const created = {
    projectId: null,
    actionItemId: null,
    riskId: null,
    chargerGroupId: null,
    connectorId: null,
    documentId: null,
    contactId: null,
    logId: null,
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
    await safeDelete("ai_analysis_logs", created.logId)
    await safeUnlink(created.projectId, created.contactId)
    await safeDelete("documents", created.documentId)
    await safeDelete("project_charger_connectors", created.connectorId)
    await safeDelete("project_charger_groups", created.chargerGroupId)
    await safeDelete("risks", created.riskId)
    await safeDelete("action_items", created.actionItemId)
    await safeDelete("contacts", created.contactId)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 9 Email - ${marker}`,
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

    const actionItem = await insert("action_items", {
      project_id: project.id,
      title: `QA Temporary Action - ${marker}`,
      description: "Temporary action item for email draft context.",
      priority: "High",
      status: "Open",
      notes: `Temporary QA record ${marker}`,
    })
    created.actionItemId = actionItem.id

    const risk = await insert("risks", {
      project_id: project.id,
      category: "Utility",
      description: `QA Temporary Risk - ${marker}`,
      impact: "Potential schedule delay.",
      likelihood: "Medium",
      severity: "High",
      mitigation_plan: "Follow up with utility reviewer.",
      status: "Open",
    })
    created.riskId = risk.id

    const chargerGroup = await insert("project_charger_groups", {
      project_id: project.id,
      charger_model: "QA Email Context DCFC",
      charger_category: "DCFC",
      power_rating_kw: 180,
      charger_count: 2,
      port_count: 4,
      port_configuration: "Dual Port",
      notes: `Temporary QA record ${marker}`,
    })
    created.chargerGroupId = chargerGroup.id

    const connector = await insert("project_charger_connectors", {
      charger_group_id: chargerGroup.id,
      connector_type: "NACS / J3400",
      connector_count_per_charger: 1,
      total_connector_count: 2,
      notes: `Temporary QA record ${marker}`,
    })
    created.connectorId = connector.id

    const document = await insert("documents", {
      project_id: project.id,
      file_name: `qa-step-9-${marker}.txt`,
      file_type: "text/plain",
      document_type: "Permit",
      version: "QA v1",
      status: "Needs Review",
    })
    created.documentId = document.id

    const contact = await insert("contacts", {
      name: `QA Temporary Contact - ${marker}`,
      company: "QA Utility",
      role: "Utility Reviewer",
      email: `qa-step-9-${marker}@example.com`,
      notes: `Temporary QA record ${marker}`,
      communication_style: "Concise and formal",
    })
    created.contactId = contact.id

    const { error: linkError } = await supabase.from("project_contacts").insert({
      project_id: project.id,
      contact_id: contact.id,
      relationship_type: "Utility",
    })
    if (linkError) {
      throw new Error(`Project contact link failed: ${summarizeSupabaseError(linkError)}`)
    }

    const mockDraft = {
      subject: `QA Email Draft ${marker}`,
      body: "Hello,\n\nThis is a temporary QA email draft.\n\nThank you,",
      confidence: 0.75,
    }
    const log = await insert("ai_analysis_logs", {
      project_id: project.id,
      document_id: document.id,
      agent_type: "email_draft",
      input_type: "project_context_email",
      input_content: `Temporary QA email context ${marker}`,
      output: mockDraft,
      confidence: mockDraft.confidence,
      user_approved: false,
    })
    created.logId = log.id

    const rereadLog = await readById("ai_analysis_logs", log.id)
    assertEqual(rereadLog.project_id, project.id, "AI log project_id readback")
    assertEqual(rereadLog.document_id, document.id, "AI log document_id readback")
    assertEqual(rereadLog.agent_type, "email_draft", "AI log agent_type readback")

    await safeDelete("ai_analysis_logs", created.logId)
    created.logId = null
    await safeUnlink(created.projectId, created.contactId)
    await safeDelete("documents", created.documentId)
    created.documentId = null
    await safeDelete("project_charger_connectors", created.connectorId)
    created.connectorId = null
    await safeDelete("project_charger_groups", created.chargerGroupId)
    created.chargerGroupId = null
    await safeDelete("risks", created.riskId)
    created.riskId = null
    await safeDelete("action_items", created.actionItemId)
    created.actionItemId = null
    await safeDelete("contacts", created.contactId)
    created.contactId = null
    await safeDelete("projects", created.projectId)
    created.projectId = null

    console.log("QA Step 9 email draft checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 9 RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 9 RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
