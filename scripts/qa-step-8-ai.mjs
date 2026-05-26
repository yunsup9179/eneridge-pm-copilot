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
    resolve(process.cwd(), "src/app/api/ai/analyze-document/route.ts"),
    "utf8"
  )
  assertIncludes(routeSource, "OPENAI_API_KEY is missing", "Missing-key guard")
  assertIncludes(routeSource, "ai_analysis_logs", "AI log insert path")
  assertIncludes(routeSource, "OPENAI_API_KEY", "Server OpenAI env var")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const marker = `QA_STEP_8_${Date.now()}`
  const created = {
    projectId: null,
    documentId: null,
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
    await safeDelete("ai_analysis_logs", created.logId)
    await safeDelete("documents", created.documentId)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 8 AI - ${marker}`,
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

    const document = await insert("documents", {
      project_id: project.id,
      file_name: `qa-step-8-${marker}.txt`,
      file_type: "text/plain",
      document_type: "Meeting Note",
      version: "QA v1",
      status: "Uploaded",
    })
    created.documentId = document.id

    const mockOutput = {
      executive_summary: `Mock AI summary ${marker}`,
      key_details: ["Mock key detail"],
      suggested_action_items: ["Mock suggested action"],
      suggested_risks: ["Mock suggested risk"],
      important_dates: [{ date: "2026-05-24", description: "Mock date" }],
      questions_to_ask: ["Mock question"],
      confidence: 0.7,
    }

    const log = await insert("ai_analysis_logs", {
      project_id: project.id,
      document_id: document.id,
      agent_type: "document_analysis",
      input_type: "qa_mock",
      input_content: `Temporary QA record ${marker}`,
      output: mockOutput,
      confidence: mockOutput.confidence,
      user_approved: false,
    })
    created.logId = log.id

    const updatedDocument = await update("documents", document.id, {
      ai_summary: mockOutput.executive_summary,
      key_terms: mockOutput.key_details,
      action_items_extracted: mockOutput.suggested_action_items,
      risks_extracted: mockOutput.suggested_risks,
      status: "Needs Review",
    })
    assertEqual(
      updatedDocument.ai_summary,
      mockOutput.executive_summary,
      "Document AI summary update"
    )

    const rereadLog = await readById("ai_analysis_logs", log.id)
    assertEqual(rereadLog.project_id, project.id, "AI log project_id readback")
    assertEqual(rereadLog.document_id, document.id, "AI log document_id readback")
    assertEqual(rereadLog.agent_type, "document_analysis", "AI log agent_type readback")

    await safeDelete("ai_analysis_logs", created.logId)
    created.logId = null
    await safeDelete("documents", created.documentId)
    created.documentId = null
    await safeDelete("projects", created.projectId)
    created.projectId = null

    console.log("QA Step 8 AI foundation checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 8 RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 8 RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
