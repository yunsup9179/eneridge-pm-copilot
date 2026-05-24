"use client"

import type { ReactNode } from "react"

import type { Project } from "@/lib/data/projects"
import { ProjectForm, type ProjectFormSubmitInput } from "@/components/projects/project-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type ProjectFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  project?: Project
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ProjectFormSubmitInput) => void
}

export function ProjectFormSheet({
  open,
  title,
  description,
  submitLabel,
  isSubmitting,
  error,
  project,
  trigger,
  onOpenChange,
  onSubmit,
}: ProjectFormSheetProps) {
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
          <ProjectForm
            key={`${project?.id ?? "new"}-${open ? "open" : "closed"}`}
            project={project}
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
