"use client"

import type { ReactNode } from "react"

import {
  DocumentForm,
  type ProjectDocumentFormSubmitInput,
} from "@/components/documents/document-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { ProjectDocument } from "@/lib/data/documents"
import type { Project } from "@/lib/data/projects"

type DocumentFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  projects: Project[]
  lockedProjectId?: string
  isSubmitting?: boolean
  error?: string | null
  document?: ProjectDocument
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ProjectDocumentFormSubmitInput) => void
}

export function DocumentFormSheet({
  open,
  title,
  description,
  submitLabel,
  projects,
  lockedProjectId,
  isSubmitting,
  error,
  document,
  trigger,
  onOpenChange,
  onSubmit,
}: DocumentFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-3xl"
      >
        <SheetHeader className="border-b text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <DocumentForm
            key={`${document?.id ?? "new"}-${lockedProjectId ?? "global"}-${open ? "open" : "closed"}`}
            document={document}
            projects={projects}
            lockedProjectId={lockedProjectId}
            submitLabel={submitLabel}
            isSubmitting={isSubmitting}
            error={error}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
