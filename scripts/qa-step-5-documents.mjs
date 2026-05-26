import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

const DOCUMENT_BUCKET = "project-documents"

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

function isMissingBucketError(error) {
  return /bucket not found|resource was not found|not found/i.test(
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
  const marker = `QA_STEP_5_${Date.now()}`
  const created = {
    projectId: null,
    documentId: null,
    storagePath: null,
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

  async function safeRemoveStorage(path) {
    if (!path) {
      return
    }

    const { error } = await supabase.storage.from(DOCUMENT_BUCKET).remove([path])
    if (error) {
      console.error(`Cleanup failed for storage/${path}: ${summarizeSupabaseError(error)}`)
    }
  }

  async function cleanup() {
    await safeDelete("documents", created.documentId)
    await safeRemoveStorage(created.storagePath)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 5 Documents - ${marker}`,
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

    const storagePath = `${project.id}/${Date.now()}-qa-step-5-document.txt`
    const fileBody = `Temporary QA document ${marker}\n`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(storagePath, new Blob([fileBody], { type: "text/plain" }), {
        contentType: "text/plain",
        upsert: false,
      })

    if (uploadError) {
      if (isMissingBucketError(uploadError)) {
        throw new Error(
          `Supabase Storage bucket "${DOCUMENT_BUCKET}" is missing or inaccessible. Apply supabase/step-5-documents-storage.sql before running Step 5 QA.`
        )
      }

      throw new Error(`Storage upload failed: ${summarizeSupabaseError(uploadError)}`)
    }
    created.storagePath = uploadData.path

    const document = await insert("documents", {
      project_id: project.id,
      file_name: "qa-step-5-document.txt",
      file_type: "text/plain",
      document_type: "Meeting Note",
      version: "QA v1",
      storage_path: created.storagePath,
      storage_url: null,
      status: "Uploaded",
    })
    created.documentId = document.id

    const rereadDocument = await readById("documents", document.id)
    assertEqual(rereadDocument.project_id, project.id, "Document project_id readback")
    assertEqual(rereadDocument.storage_path, created.storagePath, "Document storage path readback")

    const updatedDocument = await update("documents", document.id, {
      status: "Reviewed",
      version: "QA v2",
    })
    assertEqual(updatedDocument.status, "Reviewed", "Document status update readback")
    assertEqual(updatedDocument.version, "QA v2", "Document version update readback")

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(created.storagePath, 60)
    if (signedUrlError) {
      throw new Error(`Signed URL failed: ${summarizeSupabaseError(signedUrlError)}`)
    }
    if (!signedUrlData?.signedUrl) {
      throw new Error("Signed URL was not returned")
    }

    await safeDelete("documents", created.documentId)
    created.documentId = null
    await safeRemoveStorage(created.storagePath)
    created.storagePath = null
    await safeDelete("projects", created.projectId)
    created.projectId = null

    console.log("QA Step 5 document checks passed.")
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 5 RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 5 RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
