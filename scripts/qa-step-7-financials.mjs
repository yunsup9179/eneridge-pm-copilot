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

function assertNumberEqual(actual, expected, label) {
  if (Number(actual) !== expected) {
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

function isMissingFinancialsTableError(error) {
  return /project_financials|schema cache|does not exist|not found/i.test(
    summarizeSupabaseError(error)
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
  const marker = `QA_STEP_7_${Date.now()}`
  const created = {
    projectId: null,
    financialId: null,
  }

  async function insert(table, payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select("*")
      .single()
    if (error) {
      if (table === "project_financials" && isMissingFinancialsTableError(error)) {
        throw new Error(
          "project_financials is missing in live Supabase. Apply supabase/step-7-project-financials.sql before running Step 7 QA."
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

  async function cleanup() {
    await safeDelete("project_financials", created.financialId)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 7 Financials - ${marker}`,
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

    const financial = await insert("project_financials", {
      project_id: project.id,
      estimated_total_cost: 125000.5,
      actual_total_cost: 121500.25,
      equipment_cost: 76000,
      installation_cost: 33000,
      utility_cost: 8500,
      soft_cost: 4000,
      rebate_applicable: true,
      rebate_program: "QA Rebate Program",
      rebate_amount: 25000,
      grant_amount: 10000,
      match_share_amount: 5000,
      customer_contribution: 60000,
      eneridge_out_of_pocket: 21500.25,
      reimbursement_status: "Submitted",
      reimbursement_received: 0,
      retention_amount: 2500,
      notes: `Temporary QA record ${marker}`,
    })
    created.financialId = financial.id

    const rereadFinancial = await readById("project_financials", financial.id)
    assertEqual(rereadFinancial.project_id, project.id, "Financial project_id readback")
    assertNumberEqual(
      rereadFinancial.estimated_total_cost,
      125000.5,
      "Estimated total cost decimal readback"
    )

    const updatedFinancial = await update("project_financials", financial.id, {
      reimbursement_status: "Received",
      reimbursement_received: 25000,
      notes: `Temporary QA record ${marker} - updated`,
    })
    assertEqual(
      updatedFinancial.reimbursement_status,
      "Received",
      "Financial reimbursement status update"
    )
    assertNumberEqual(
      updatedFinancial.reimbursement_received,
      25000,
      "Financial reimbursement received update"
    )

    await safeDelete("project_financials", created.financialId)
    created.financialId = null
    await safeDelete("projects", created.projectId)
    created.projectId = null

    console.log("QA Step 7 financial checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 7 RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 7 RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
