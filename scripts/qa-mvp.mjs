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

function isMissingTableError(error, tableName) {
  const summary = summarizeSupabaseError(error)
  return (
    error?.code === "42P01" ||
    summary.includes(`relation "public.${tableName}" does not exist`) ||
    summary.includes(`relation "${tableName}" does not exist`) ||
    summary.includes(`Could not find the table 'public.${tableName}'`)
  )
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
  const marker = `QA_MVP_${Date.now()}`
  const created = {
    projectId: null,
    actionItemId: null,
    riskId: null,
    chargerGroupId: null,
    connectorId: null,
    documentId: null,
    contactId: null,
    financialId: null,
    aiLogId: null,
  }

  async function insert(table, payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select("*")
      .single()
    if (error) {
      if (isMissingTableError(error, "project_financials")) {
        throw new Error(
          "project_financials is missing in live Supabase. Apply supabase/step-7-project-financials.sql before running MVP QA."
        )
      }

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
    await safeDelete("ai_analysis_logs", created.aiLogId)
    await safeDelete("project_financials", created.financialId)
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
      name: `QA Temporary Project - MVP - ${marker}`,
      location: "QA Test Location",
      customer: "QA Temporary Customer",
      city: "QA City",
      utility: "QA Utility",
      program: "QA Program",
      phase: "Design",
      status: "Active",
      priority: "High",
      target_construction_start: "2026-07-01",
      target_cod: "2026-09-01",
      internal_owner: "QA Owner",
      summary: `Temporary QA record ${marker}`,
    })
    created.projectId = project.id

    const updatedProject = await update("projects", project.id, {
      phase: "Construction",
      summary: `Temporary QA record ${marker} - updated`,
    })
    assertEqual(updatedProject.phase, "Construction", "Project update readback")

    const actionItem = await insert("action_items", {
      project_id: project.id,
      title: `QA Temporary Action - ${marker}`,
      description: "Temporary MVP action item.",
      assigned_to: "QA Owner",
      priority: "High",
      status: "Open",
      due_date: "2026-06-01",
      notes: `Temporary QA record ${marker}`,
    })
    created.actionItemId = actionItem.id

    const updatedAction = await update("action_items", actionItem.id, {
      status: "In Progress",
    })
    assertEqual(updatedAction.status, "In Progress", "Action item update readback")

    const risk = await insert("risks", {
      project_id: project.id,
      category: "Utility",
      description: `QA Temporary Risk - ${marker}`,
      impact: "Potential delay.",
      likelihood: "Medium",
      severity: "High",
      mitigation_plan: "Coordinate review.",
      owner: "QA Owner",
      status: "Open",
    })
    created.riskId = risk.id

    const updatedRisk = await update("risks", risk.id, {
      severity: "Critical",
    })
    assertEqual(updatedRisk.severity, "Critical", "Risk update readback")

    const chargerGroup = await insert("project_charger_groups", {
      project_id: project.id,
      charger_model: "QA MVP DCFC",
      charger_category: "DCFC",
      power_rating_kw: 180,
      charger_count: 2,
      port_count: 4,
      port_configuration: "Dual Port",
      notes: `Temporary QA record ${marker}`,
    })
    created.chargerGroupId = chargerGroup.id

    const updatedGroup = await update("project_charger_groups", chargerGroup.id, {
      power_rating_kw: 320,
    })
    assertEqual(updatedGroup.power_rating_kw, 320, "Charger group update readback")

    const connector = await insert("project_charger_connectors", {
      charger_group_id: chargerGroup.id,
      connector_type: "CCS1",
      connector_count_per_charger: 1,
      total_connector_count: 2,
      notes: `Temporary QA record ${marker}`,
    })
    created.connectorId = connector.id

    const updatedConnector = await update("project_charger_connectors", connector.id, {
      connector_type: "NACS / J3400",
    })
    assertEqual(
      updatedConnector.connector_type,
      "NACS / J3400",
      "Connector update readback"
    )

    const document = await insert("documents", {
      project_id: project.id,
      file_name: `qa-mvp-${marker}.txt`,
      file_type: "text/plain",
      document_type: "Meeting Note",
      version: "QA v1",
      status: "Uploaded",
    })
    created.documentId = document.id

    const updatedDocument = await update("documents", document.id, {
      status: "Needs Review",
      ai_summary: `Mock MVP summary ${marker}`,
    })
    assertEqual(updatedDocument.status, "Needs Review", "Document update readback")

    const contact = await insert("contacts", {
      name: `QA Temporary Contact - ${marker}`,
      company: "QA Company",
      role: "Engineer",
      email: `qa-mvp-${marker}@example.com`,
      phone: "555-0101",
      notes: `Temporary QA record ${marker}`,
    })
    created.contactId = contact.id

    const updatedContact = await update("contacts", contact.id, {
      role: "Utility Reviewer",
    })
    assertEqual(updatedContact.role, "Utility Reviewer", "Contact update readback")

    const { error: linkError } = await supabase.from("project_contacts").insert({
      project_id: project.id,
      contact_id: contact.id,
      relationship_type: "Utility",
    })
    if (linkError) {
      throw new Error(`Project contact link failed: ${summarizeSupabaseError(linkError)}`)
    }

    const financial = await insert("project_financials", {
      project_id: project.id,
      estimated_total_cost: 250000,
      actual_total_cost: 200000,
      equipment_cost: 120000,
      installation_cost: 70000,
      utility_cost: 25000,
      soft_cost: 15000,
      rebate_applicable: true,
      rebate_program: "QA Program",
      rebate_amount: 50000,
      grant_amount: 25000,
      match_share_amount: 10000,
      customer_contribution: 100000,
      eneridge_out_of_pocket: 65000,
      reimbursement_status: "Pending",
      reimbursement_received: 0,
      retention_amount: 5000,
      notes: `Temporary QA record ${marker}`,
    })
    created.financialId = financial.id

    const updatedFinancial = await update("project_financials", financial.id, {
      reimbursement_status: "Received",
      reimbursement_received: 50000,
    })
    assertEqual(
      updatedFinancial.reimbursement_status,
      "Received",
      "Financial update readback"
    )

    const aiLog = await insert("ai_analysis_logs", {
      project_id: project.id,
      document_id: document.id,
      agent_type: "mvp_qa",
      input_type: "qa_mock",
      input_content: `Temporary QA record ${marker}`,
      output: {
        summary: `Temporary MVP QA log ${marker}`,
      },
      confidence: 0.8,
      user_approved: false,
    })
    created.aiLogId = aiLog.id

    const rereadProject = await readById("projects", project.id)
    assertEqual(rereadProject.name, project.name, "Project readback")

    await safeDelete("ai_analysis_logs", created.aiLogId)
    created.aiLogId = null
    await safeDelete("project_financials", created.financialId)
    created.financialId = null
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

    console.log("MVP QA CRUD checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA MVP RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA MVP RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
