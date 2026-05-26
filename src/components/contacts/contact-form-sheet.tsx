"use client"

import type { ReactNode } from "react"

import { ContactForm } from "@/components/contacts/contact-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Contact, ContactCreateInput } from "@/lib/data/contacts"

type ContactFormSheetProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  isSubmitting?: boolean
  error?: string | null
  contact?: Contact
  trigger?: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ContactCreateInput) => void
}

export function ContactFormSheet({
  open,
  title,
  description,
  submitLabel,
  isSubmitting,
  error,
  contact,
  trigger,
  onOpenChange,
  onSubmit,
}: ContactFormSheetProps) {
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
          <ContactForm
            key={`${contact?.id ?? "new"}-${open ? "open" : "closed"}`}
            contact={contact}
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
