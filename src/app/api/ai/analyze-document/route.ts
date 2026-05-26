import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import type { Json, Database } from "@/lib/supabase/types"

type AnalyzeDocumentRequest = {
  document_id?: string
  project_id?: string
  text_content?: string
  notes?: string
}

type AiDocumentAnalysis = {
  executive_summary: string
  key_details: string[]
  suggested_action_items: string[]
  suggested_risks: string[]
  important_dates: {
    date: string
    description: string
  }[]
  questions_to_ask: string[]
  confidence: number
}

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "executive_summary",
    "key_details",
    "suggested_action_items",
    "suggested_risks",
    "important_dates",
    "questions_to_ask",
    "confidence",
  ],
  properties: {
    executive_summary: { type: "string" },
    key_details: { type: "array", items: { type: "string" } },
    suggested_action_items: { type: "array", items: { type: "string" } },
    suggested_risks: { type: "array", items: { type: "string" } },
    important_dates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "description"],
        properties: {
          date: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    questions_to_ask: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
}

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY

  if (!openAiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing. Add it to .env.local and restart the development server before running document analysis.",
      },
      { status: 503 }
    )
  }

  const body = (await request.json()) as AnalyzeDocumentRequest
  const documentId = body.document_id
  const projectId = body.project_id

  if (!documentId || !projectId) {
    return NextResponse.json(
      { error: "document_id and project_id are required." },
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

  const [{ data: document, error: documentError }, { data: project }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("project_id", projectId)
        .maybeSingle(),
      supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
    ])

  if (documentError) {
    return NextResponse.json({ error: documentError.message }, { status: 500 })
  }

  if (!document) {
    return NextResponse.json(
      { error: "Document not found for this project." },
      { status: 404 }
    )
  }

  const inputContent = buildInputContent({
    document,
    projectName: project?.name ?? "Unknown project",
    textContent: body.text_content,
    notes: body.notes,
  })

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_DOCUMENT_ANALYSIS_MODEL ?? "gpt-4.1-mini",
      instructions:
        "You analyze EV charging infrastructure project documents for Eneridge PM Copilot. Return concise, review-ready project management outputs. Do not invent facts; use questions_to_ask when information is missing.",
      input: inputContent,
      text: {
        format: {
          type: "json_schema",
          name: "eneridge_document_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
    }),
  })

  const aiPayload = await aiResponse.json()

  if (!aiResponse.ok) {
    return NextResponse.json(
      {
        error:
          aiPayload?.error?.message ?? "OpenAI document analysis failed.",
      },
      { status: aiResponse.status }
    )
  }

  const analysis = parseAnalysis(aiPayload)

  const { error: logError } = await supabase.from("ai_analysis_logs").insert({
    project_id: projectId,
    document_id: documentId,
    agent_type: "document_analysis",
    input_type: "document_text_or_metadata",
    input_content: inputContent,
    output: analysis as unknown as Json,
    confidence: analysis.confidence,
    user_approved: false,
  })

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      ai_summary: analysis.executive_summary,
      key_terms: analysis.key_details as unknown as Json,
      action_items_extracted: analysis.suggested_action_items as unknown as Json,
      risks_extracted: analysis.suggested_risks as unknown as Json,
      status: document.status === "Uploaded" ? "Needs Review" : document.status,
    })
    .eq("id", documentId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ analysis })
}

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

function buildInputContent({
  document,
  projectName,
  textContent,
  notes,
}: {
  document: Database["public"]["Tables"]["documents"]["Row"]
  projectName: string
  textContent?: string
  notes?: string
}) {
  const userProvidedText = [textContent, notes]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join("\n\n")

  return [
    `Project: ${projectName}`,
    `Document ID: ${document.id}`,
    `Document file name: ${document.file_name}`,
    `Document type: ${document.document_type ?? "Not set"}`,
    `Version: ${document.version ?? "Not set"}`,
    `Status: ${document.status ?? "Not set"}`,
    userProvidedText
      ? `User-provided document text or notes:\n${userProvidedText}`
      : "No full document text was provided. Analyze the available document metadata only and ask for missing details where needed.",
  ].join("\n")
}

function parseAnalysis(payload: unknown): AiDocumentAnalysis {
  const outputText = getOutputText(payload)
  const parsed = JSON.parse(outputText) as AiDocumentAnalysis

  return {
    executive_summary: parsed.executive_summary ?? "",
    key_details: parsed.key_details ?? [],
    suggested_action_items: parsed.suggested_action_items ?? [],
    suggested_risks: parsed.suggested_risks ?? [],
    important_dates: parsed.important_dates ?? [],
    questions_to_ask: parsed.questions_to_ask ?? [],
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
