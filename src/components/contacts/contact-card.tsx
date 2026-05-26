"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { ContactRound, Mail, Pencil, Phone, Trash2, Unlink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  Contact,
  ContactWithProjects,
  ProjectContactWithContact,
} from "@/lib/data/contacts"

type ContactCardProps = {
  contact: Contact | ContactWithProjects | ProjectContactWithContact
  showProjects?: boolean
  projectRelationshipType?: string | null
  onEdit: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onUnlink?: (contact: Contact) => void
}

export function ContactCard({
  contact,
  showProjects = false,
  projectRelationshipType,
  onEdit,
  onDelete,
  onUnlink,
}: ContactCardProps) {
  const resolvedContact = "contact" in contact ? contact.contact : contact
  const projectLinks = "projectLinks" in contact ? contact.projectLinks : []

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ContactRound className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{resolvedContact.name}</h3>
            {projectRelationshipType && (
              <Badge variant="secondary">{projectRelationshipType}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {[resolvedContact.role, resolvedContact.company]
              .filter(Boolean)
              .join(", ") || "Role not set"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(resolvedContact)}
          >
            <Pencil />
            Edit
          </Button>
          {onUnlink && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnlink(resolvedContact)}
            >
              <Unlink />
              Unlink
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(resolvedContact)}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Meta
          label="Email"
          value={resolvedContact.email}
          icon={<Mail className="size-4" />}
        />
        <Meta
          label="Phone"
          value={resolvedContact.phone}
          icon={<Phone className="size-4" />}
        />
        <Meta
          label="Last Contacted"
          value={formatDateTime(resolvedContact.last_contacted_at)}
        />
        <Meta
          label="Communication Style"
          value={resolvedContact.communication_style}
        />
      </div>

      {resolvedContact.notes && (
        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Notes</p>
          <p className="mt-1 leading-6">{resolvedContact.notes}</p>
        </div>
      )}

      {showProjects && projectLinks.length > 0 && (
        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Projects</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {projectLinks.map((link) => (
              <Badge key={`${link.project_id}-${link.contact_id}`} variant="outline">
                {link.project ? (
                  <Link href={`/projects/${link.project_id}`}>
                    {link.project.name}
                  </Link>
                ) : (
                  "Project"
                )}
                {link.relationship_type ? ` - ${link.relationship_type}` : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex min-w-0 items-center gap-1 font-medium">
        {icon}
        <span className="truncate">{value ?? "Not set"}</span>
      </p>
    </div>
  )
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set"
  }

  return new Date(value).toLocaleString()
}
