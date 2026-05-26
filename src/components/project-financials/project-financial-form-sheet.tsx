"use client"

import type { ReactNode } from "react"

import { ProjectFinancialForm } from "@/components/project-financials/project-financial-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type {
  ProjectFinancial,
  ProjectFinancialUpdateInput,
} from "@/lib/data/project-financials"

type ProjectFinancialFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  financial?: ProjectFinancial | null
  isSubmitting?: boolean
  error?: string | null
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ProjectFinancialUpdateInput) => void
}

export function ProjectFinancialFormSheet({
  open,
  title,
  description,
  submitLabel,
  financial,
  isSubmitting,
  error,
  trigger,
  onOpenChange,
  onSubmit,
}: ProjectFinancialFormSheetProps) {
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
          <ProjectFinancialForm
            key={`${financial?.id ?? "new"}-${open ? "open" : "closed"}`}
            financial={financial}
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
