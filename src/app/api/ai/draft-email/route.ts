import { NextResponse } from "next/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { Json, Database } from "@/lib/supabase/types"

type DraftEmailRequest = {
  project_id?: string
  recipient_type?: string
  purpose?: string
  user_notes?: string
  selected_document_ids?: string[]
}

type EmailDraft = {
  subject: string
  body: string
  confidence: number
}

const emailDraftSchema = {
  type: "object",
  additionalProperties: false,
  required: ["subject", "body", "confidence"],
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
}

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY

  if (!openAiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing. Add it to .env.local and restart the development server before generating email drafts.",
      },
      { status: 503 }
    )
  }

  const body = (await request.json()) as DraftEmailRequest
  const projectId = body.project_id
  const recipientType = body.recipient_type
  const purpose = body.purpose

  if (!projectId || !recipientType || !purpose) {
    return NextResponse.json(
      { error: "project_id, recipient_type, and purpose are required." },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 503 }
    )
  }

  const context = await loadProjectEmailContext({
    supabase,
    projectId,
    selectedDocumentIds: body.selected_document_ids ?? [],
  })

  if (!context.project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 })
  }

  const inputContent = buildEmailPrompt({
    context,
    recipientType,
    purpose,
    userNotes: body.user_notes,
  })

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMAIL_DRAFT_MODEL ?? "gpt-4.1-mini",
      instructions:
        "Draft polite, formal, concise Eneridge business emails for EV charging infrastructure project delivery. Use a clear next action. Do not invent facts; if context is missing, ask a concise question in the body.",
      input: inputContent,
      text: {
        format: {
          type: "json_schema",
          name: "eneridge_email_draft",
          strict: true,
          schema: emailDraftSchema,
        },
      },
    }),
  })

  const aiPayload = await aiResponse.json()

  if (!aiResponse.ok) {
    return NextResponse.json(
      {
        error: aiPayload?.error?.message ?? "OpenAI email draft failed.",
      },
      { status: aiResponse.status }
    )
  }

  const draft = parseEmailDraft(aiPayload)

  const { error: logError } = await supabase.from("ai_analysis_logs").insert({
    project_id: projectId,
    document_id: (body.selected_document_ids ?? [])[0] ?? null,
    agent_type: "email_draft",
    input_type: "project_context_email",
    input_content: inputContent,
    output: draft as unknown as Json,
    confidence: draft.confidence,
    user_approved: false,
  })

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 })
  }

  return NextResponse.json({ draft })
}

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

async function loadProjectEmailContext({
  supabase,
  projectId,
  selectedDocumentIds,
}: {
  supabase: SupabaseClient<Database>
  projectId: string
  selectedDocumentIds: string[]
}) {
  const [
    { data: project },
    { data: actionItems },
    { data: risks },
    { data: chargerGroups },
    { data: documents },
    { data: projectContacts },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
    supabase.from("action_items").select("*").eq("project_id", projectId),
    supabase.from("risks").select("*").eq("project_id", projectId),
    supabase
      .from("project_charger_groups")
      .select("*")
      .eq("project_id", projectId),
    selectedDocumentIds.length > 0
      ? supabase
          .from("documents")
          .select("*")
          .eq("project_id", projectId)
          .in("id", selectedDocumentIds)
      : supabase.from("documents").select("*").eq("project_id", projectId),
    supabase.from("project_contacts").select("*").eq("project_id", projectId),
  ])

  const chargerConnectors =
    chargerGroups && chargerGroups.length > 0
      ? await supabase
          .from("project_charger_connectors")
          .select("*")
          .in(
            "charger_group_id",
            chargerGroups.map((group) => group.id)
          )
      : { data: [] }

  const contacts =
    projectContacts && projectContacts.length > 0
      ? await supabase
          .from("contacts")
          .select("*")
          .in(
            "id",
            projectContacts.map((link) => link.contact_id)
          )
      : { data: [] }

  return {
    project,
    actionItems: actionItems ?? [],
    risks: risks ?? [],
    chargerGroups: chargerGroups ?? [],
    chargerConnectors: chargerConnectors.data ?? [],
    documents: documents ?? [],
    projectContacts: projectContacts ?? [],
    contacts: contacts.data ?? [],
  }
}

function buildEmailPrompt({
  context,
  recipientType,
  purpose,
  userNotes,
}: {
  context: Awaited<ReturnType<typeof loadProjectEmailContext>>
  recipientType: string
  purpose: string
  userNotes?: string
}) {
  const openActionItems = context.actionItems.filter(
    (item) => item.status !== "Completed"
  )
  const openHighRisks = context.risks.filter(
    (risk) =>
      risk.status !== "Closed" &&
      (risk.severity === "High" || risk.severity === "Critical")
  )

  return [
    `Recipient type: ${recipientType}`,
    `Purpose: ${purpose}`,
    userNotes?.trim() ? `User notes:\n${userNotes.trim()}` : null,
    `Project:\n${JSON.stringify(context.project, null, 2)}`,
    `Open action items:\n${JSON.stringify(openActionItems, null, 2)}`,
    `Open/high risks:\n${JSON.stringify(openHighRisks, null, 2)}`,
    `Charger groups:\n${JSON.stringify(context.chargerGroups, null, 2)}`,
    `Charger connectors:\n${JSON.stringify(context.chargerConnectors, null, 2)}`,
    `Documents:\n${JSON.stringify(context.documents, null, 2)}`,
    `Project contacts:\n${JSON.stringify(context.projectContacts, null, 2)}`,
    `Contacts:\n${JSON.stringify(context.contacts, null, 2)}`,
    "Draft a subject and body only. The body should be ready to send after human review and should include a clear next action.",
  ]
    .filter((item): item is string => Boolean(item))
    .join("\n\n")
}

function parseEmailDraft(payload: unknown): EmailDraft {
  const outputText = getOutputText(payload)
  const parsed = JSON.parse(outputText) as EmailDraft

  return {
    subject: parsed.subject ?? "",
    body: parsed.body ?? "",
    confidence:
      typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
  }
}

function getOutputText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text
  }

  if (!payload || typeof payload !== "object" || !("output" in payload)) {
    throw new Error("OpenAI response did not include output text.")
  }

  const output = payload.output

  if (!Array.isArray(output)) {
    throw new Error("OpenAI response output was not readable.")
  }

  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item)) {
      continue
    }

    const content = item.content

    if (!Array.isArray(content)) {
      continue
    }

    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text
      }
    }
  }

  throw new Error("OpenAI response did not include parseable text.")
}
