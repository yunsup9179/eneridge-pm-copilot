"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Copy,
  ExternalLink,
  FileText,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getProjectDocumentSignedUrl,
  type ProjectDocument,
  type ProjectDocumentWithProject,
} from "@/lib/data/documents"

type DocumentCardProps = {
  document: ProjectDocument | ProjectDocumentWithProject
  showProject?: boolean
  onEdit: (document: ProjectDocument) => void
  onDelete: (document: ProjectDocument) => void
  onAnalyzed?: () => void
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

export function DocumentCard({
  document,
  showProject = false,
  onEdit,
  onDelete,
  onAnalyzed,
}: DocumentCardProps) {
  const project = "project" in document ? document.project : null
  const [fileError, setFileError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AiDocumentAnalysis | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function handleOpenFile() {
    setFileError(null)

    if (!document.storage_path) {
      setFileError("This document does not have a storage file path.")
      return
    }

    setIsOpening(true)

    try {
      const signedUrl = await getProjectDocumentSignedUrl(
        document.storage_path
      )
      window.open(signedUrl, "_blank", "noopener,noreferrer")
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Unable to open file."
      )
    } finally {
      setIsOpening(false)
    }
  }

  async function handleAnalyzeDocument() {
    setAnalysisError(null)

    if (!document.project_id) {
      setAnalysisError("This document is not linked to a project.")
      return
    }

    const textContent = window.prompt(
      "Optional: paste document text or notes for AI review. Leave blank to analyze metadata only."
    )

    if (textContent === null) {
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: document.id,
          project_id: document.project_id,
          text_content: textContent,
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error ?? "Document analysis failed.")
      }

      setAnalysis(payload.analysis)
      onAnalyzed?.()
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Document analysis failed."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="truncate text-sm font-semibold">
              {document.file_name}
            </h3>
            <Badge variant="outline">
              {document.document_type ?? "Type not set"}
            </Badge>
            <StatusBadge status={document.status} />
          </div>
          {showProject && (
            <p className="text-xs text-muted-foreground">
              Project:{" "}
              {project && document.project_id ? (
                <Link
                  href={`/projects/${document.project_id}`}
                  className="font-medium hover:text-foreground"
                >
                  {project.name}
                </Link>
              ) : (
                "Not linked"
              )}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFile}
            disabled={isOpening || !document.storage_path}
          >
            <ExternalLink />
            {isOpening ? "Opening..." : "Open"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeDocument}
            disabled={isAnalyzing}
          >
            <Sparkles />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(document)}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(document)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Version" value={document.version} />
        <Meta label="File Type" value={document.file_type} />
        <Meta label="Uploaded" value={formatDate(document.uploaded_at)} />
        <Meta label="Storage Path" value={document.storage_path} />
      </div>

      {document.ai_summary && (
        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground">AI Summary</p>
          <p className="mt-1 leading-6">{document.ai_summary}</p>
        </div>
      )}

      {analysis && <AnalysisPanel analysis={analysis} />}

      {fileError && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {fileError}
        </div>
      )}

      {analysisError && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {analysisError}
        </div>
      )}
    </div>
  )
}

function AnalysisPanel({ analysis }: { analysis: AiDocumentAnalysis }) {
  const copyText = [
    `Executive summary: ${analysis.executive_summary}`,
    formatList("Key details", analysis.key_details),
    formatList("Suggested action items", analysis.suggested_action_items),
    formatList("Suggested risks", analysis.suggested_risks),
    formatList(
      "Important dates",
      analysis.important_dates.map((item) => `${item.date}: ${item.description}`)
    ),
    formatList("Questions to ask", analysis.questions_to_ask),
    `Confidence: ${Math.round(analysis.confidence * 100)}%`,
  ].join("\n\n")

  async function copyAnalysis() {
    await navigator.clipboard.writeText(copyText)
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">AI Analysis Result</p>
          <p className="text-xs text-muted-foreground">
            Review suggestions before turning them into action items or risks.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copyAnalysis}>
          <Copy />
          Copy
        </Button>
      </div>
      <p className="leading-6">{analysis.executive_summary}</p>
      <AnalysisList title="Key Details" items={analysis.key_details} />
      <AnalysisList
        title="Suggested Action Items"
        items={analysis.suggested_action_items}
      />
      <AnalysisList title="Suggested Risks" items={analysis.suggested_risks} />
      <AnalysisList
        title="Important Dates"
        items={analysis.important_dates.map(
          (item) => `${item.date}: ${item.description}`
        )}
      />
      <AnalysisList
        title="Questions To Ask"
        items={analysis.questions_to_ask}
      />
      <Badge variant="secondary">
        Confidence {Math.round(analysis.confidence * 100)}%
      </Badge>
    </div>
  )
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value ?? "Not set"}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const variant =
    status === "Needs Review"
      ? "destructive"
      : status === "Reviewed"
        ? "secondary"
        : "outline"

  return <Badge variant={variant}>{status ?? "Uploaded"}</Badge>
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set"
  }

  return new Date(value).toLocaleDateString()
}

function formatList(title: string, items: string[]) {
  return `${title}:\n${items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None"}`
}
