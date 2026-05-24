"use client"

import type { ReactNode } from "react"

import { ProjectChargerGroupForm } from "@/components/project-chargers/project-charger-group-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Project } from "@/lib/data/projects"
import type {
  ProjectChargerGroup,
  ProjectChargerGroupCreateInput,
} from "@/lib/data/project-chargers"

type ProjectChargerGroupFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  project: Project
  chargerGroup?: ProjectChargerGroup
  isSubmitting?: boolean
  error?: string | null
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ProjectChargerGroupCreateInput) => void
}

export function ProjectChargerGroupFormSheet({
  open,
  title,
  description,
  submitLabel,
  project,
  chargerGroup,
  isSubmitting,
  error,
  trigger,
  onOpenChange,
  onSubmit,
}: ProjectChargerGroupFormSheetProps) {
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
          <ProjectChargerGroupForm
            key={`${chargerGroup?.id ?? "new"}-${project.id}-${open ? "open" : "closed"}`}
            project={project}
            chargerGroup={chargerGroup}
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

