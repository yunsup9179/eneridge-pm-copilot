"use client"

import type { ReactNode } from "react"

import { ActionItemForm } from "@/components/action-items/action-item-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type {
  ActionItem,
  ActionItemCreateInput,
} from "@/lib/data/action-items"
import type { Project } from "@/lib/data/projects"

type ActionItemFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  projects: Project[]
  lockedProjectId?: string
  isSubmitting?: boolean
  error?: string | null
  actionItem?: ActionItem
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ActionItemCreateInput) => void
}

export function ActionItemFormSheet({
  open,
  title,
  description,
  submitLabel,
  projects,
  lockedProjectId,
  isSubmitting,
  error,
  actionItem,
  trigger,
  onOpenChange,
  onSubmit,
}: ActionItemFormSheetProps) {
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
          <ActionItemForm
            key={`${actionItem?.id ?? "new"}-${lockedProjectId ?? "global"}-${open ? "open" : "closed"}`}
            actionItem={actionItem}
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
