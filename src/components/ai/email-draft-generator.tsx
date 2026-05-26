"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Copy, MailPlus } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  getDocuments,
  isMissingDocumentConfigError,
  type ProjectDocumentWithProject,
} from "@/lib/data/documents"
import {
  getProjects,
  isMissingSupabaseConfigError,
  type Project,
} from "@/lib/data/projects"

const recipientTypes = [
  "City",
  "Utility",
  "Contractor",
  "Engineer",
  "Customer",
  "Vendor",
  "Grant Manager",
  "Internal Team",
  "Investor / Partner",
]

const purposes = [
  "Follow-up",
  "Clarification",
  "Quote Request",
  "Design Revision",
  "Grant Inquiry",
  "Meeting Request",
  "Status Update",
  "Risk Escalation",
  "Document Request",
]

type LoadState = "loading" | "ready" | "error"

type EmailDraft = {
  subject: string
  body: string
  confidence: number
}

export function EmailDraftGenerator() {
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<ProjectDocumentWithProject[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState("")
  const [recipientType, setRecipientType] = useState("Utility")
  const [purpose, setPurpose] = useState("Follow-up")
  const [userNotes, setUserNotes] = useState("")
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [draft, setDraft] = useState<EmailDraft | null>(null)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const loadData = useCallback(async () => {
    setLoadState("loading")
    setLoadError(null)

    try {
      const [projectData, documentData] = await Promise.all([
        getProjects(),
        getDocuments(),
      ])
      setProjects(projectData)
      setDocuments(documentData)
      setProjectId((current) => current || projectData[0]?.id || "")
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadData])

  const projectDocuments = useMemo(
    () => documents.filter((document) => document.project_id === projectId),
    [documents, projectId]
  )

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId]
    )
  }

  async function handleGenerateDraft() {
    setDraftError(null)
    setDraft(null)

    if (!projectId) {
      setDraftError("Select a project before generating an email draft.")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          recipient_type: recipientType,
          purpose,
          user_notes: userNotes,
          selected_document_ids: selectedDocumentIds,
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error ?? "Email draft generation failed.")
      }

      setDraft(payload.draft)
    } catch (error) {
      setDraftError(
        error instanceof Error
          ? error.message
          : "Email draft generation failed."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyDraft() {
    if (!draft) {
      return
    }

    await navigator.clipboard.writeText(
      `Subject: ${draft.subject}\n\n${draft.body}`
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Workspace"
        title="Email Draft Generator"
        description="Generate polite, concise Eneridge project emails using live project context. Drafts are review-only and are not sent automatically."
      />

      {loadState === "loading" && (
        <div className="h-40 rounded-lg bg-muted" />
      )}

      {loadState === "error" && (
        <Card>
          <CardHeader>
            <CardTitle>AI workspace failed to load</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void loadData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loadState === "ready" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Draft Settings</CardTitle>
              <CardDescription>
                Select the project, recipient, purpose, and optional source
                documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-project">Project</Label>
                <Select
                  id="email-project"
                  value={projectId}
                  onChange={(event) => {
                    setProjectId(event.target.value)
                    setSelectedDocumentIds([])
                  }}
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <OptionSelect
                  id="email-recipient"
                  label="Recipient Type"
                  value={recipientType}
                  options={recipientTypes}
                  onChange={setRecipientType}
                />
                <OptionSelect
                  id="email-purpose"
                  label="Purpose"
                  value={purpose}
                  options={purposes}
                  onChange={setPurpose}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-notes">User Notes</Label>
                <Textarea
                  id="email-notes"
                  value={userNotes}
                  onChange={(event) => setUserNotes(event.target.value)}
                  placeholder="Add specific asks, dates, tone notes, or context to include."
                />
              </div>

              <div className="space-y-2">
                <Label>Selected Documents</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                  {projectDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No documents are linked to this project yet.
                    </p>
                  ) : (
                    projectDocuments.map((document) => (
                      <label
                        key={document.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocumentIds.includes(document.id)}
                          onChange={() => toggleDocument(document.id)}
                        />
                        <span>
                          {document.file_name}
                          <span className="block text-xs text-muted-foreground">
                            {document.document_type ?? "Document"} ·{" "}
                            {document.status ?? "Status not set"}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {draftError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {draftError}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleGenerateDraft}
                disabled={isGenerating || !projectId}
              >
                <MailPlus />
                {isGenerating ? "Generating..." : "Generate Draft"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Draft Output</CardTitle>
                  <CardDescription>
                    Review before sending. The app does not send email.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={copyDraft}
                  disabled={!draft}
                >
                  <Copy />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {draft ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="mt-1 font-semibold">{draft.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Body</p>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-sm leading-6">
                      {draft.body}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Confidence {Math.round(draft.confidence * 100)}%
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Generate a draft to preview the subject and body here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function OptionSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (isMissingDocumentConfigError(error) || isMissingSupabaseConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected AI workspace error."
}
