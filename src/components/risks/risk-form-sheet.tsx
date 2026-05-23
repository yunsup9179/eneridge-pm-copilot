"use client"

import type { ReactNode } from "react"

import { RiskForm } from "@/components/risks/risk-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Project } from "@/lib/data/projects"
import type { Risk, RiskCreateInput } from "@/lib/data/risks"

type RiskFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  projects: Project[]
  lockedProjectId?: string
  isSubmitting?: boolean
  error?: string | null
  risk?: Risk
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: RiskCreateInput) => void
}

export function RiskFormSheet({
  open,
  title,
  description,
  submitLabel,
  projects,
  lockedProjectId,
  isSubmitting,
  error,
  risk,
  trigger,
  onOpenChange,
  onSubmit,
}: RiskFormSheetProps) {
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
          <RiskForm
            key={`${risk?.id ?? "new"}-${lockedProjectId ?? "global"}-${open ? "open" : "closed"}`}
            risk={risk}
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
