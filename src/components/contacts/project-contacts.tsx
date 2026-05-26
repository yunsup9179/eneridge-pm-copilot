"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Link2, Plus } from "lucide-react"

import { ContactCard } from "@/components/contacts/contact-card"
import { ContactFormSheet } from "@/components/contacts/contact-form-sheet"
import { projectContactRelationshipTypes } from "@/components/contacts/contact-options"
import { Badge } from "@/components/ui/badge"
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
import {
  createContact,
  getContacts,
  getContactsByProjectId,
  isMissingContactConfigError,
  linkContactToProject,
  unlinkContactFromProject,
  updateContact,
  type Contact,
  type ContactCreateInput,
  type ContactWithProjects,
  type ProjectContactWithContact,
} from "@/lib/data/contacts"
import type { Project } from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectContacts({ project }: { project: Project }) {
  const [projectContacts, setProjectContacts] = useState<
    ProjectContactWithContact[]
  >([])
  const [allContacts, setAllContacts] = useState<ContactWithProjects[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [selectedContactId, setSelectedContactId] = useState("")
  const [relationshipType, setRelationshipType] = useState("Customer")
  const [newContactRelationshipType, setNewContactRelationshipType] =
    useState("Customer")
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadContacts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const [projectContactData, allContactData] = await Promise.all([
        getContactsByProjectId(project.id),
        getContacts(),
      ])
      setProjectContacts(projectContactData)
      setAllContacts(allContactData)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadContacts()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadContacts])

  const linkedContactIds = useMemo(
    () => new Set(projectContacts.map((link) => link.contact_id)),
    [projectContacts]
  )
  const availableContacts = allContacts.filter(
    (contact) => !linkedContactIds.has(contact.id)
  )

  async function refreshContacts() {
    const [projectContactData, allContactData] = await Promise.all([
      getContactsByProjectId(project.id),
      getContacts(),
    ])
    setProjectContacts(projectContactData)
    setAllContacts(allContactData)
  }

  async function handleLinkExisting() {
    if (!selectedContactId) {
      setMutationError("Select a contact before linking.")
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await linkContactToProject(
        project.id,
        selectedContactId,
        relationshipType
      )
      await refreshContacts()
      setSelectedContactId("")
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateAndLinkContact(input: ContactCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      const contact = await createContact(input)
      await linkContactToProject(
        project.id,
        contact.id,
        newContactRelationshipType
      )
      await refreshContacts()
      setCreateOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateContact(input: ContactCreateInput) {
    if (!editingContact) {
      return
    }

    setIsSaving(true)
    setMutationError(null)

    try {
      await updateContact(editingContact.id, input)
      await refreshContacts()
      setEditOpen(false)
      setEditingContact(null)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUnlinkContact(contact: Contact) {
    const confirmed = window.confirm(
      `Unlink contact "${contact.name}" from this project?`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await unlinkContactFromProject(project.id, contact.id)
      await refreshContacts()
    } catch (error) {
      setMutationError(getErrorMessage(error))
    }
  }

  function openEdit(contact: Contact) {
    setEditingContact(contact)
    setMutationError(null)
    setEditOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              Project stakeholders and relationship roles.
            </CardDescription>
          </div>
          <ContactFormSheet
            open={createOpen}
            title="Create and link contact"
            description={`Create a new stakeholder and link them to ${project.name}.`}
            submitLabel="Create and link contact"
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button>
                <Plus />
                New Contact
              </Button>
            }
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleCreateAndLinkContact}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ContactFormSheet
          open={editOpen}
          title="Edit contact"
          description="Update this stakeholder record."
          submitLabel="Save changes"
          contact={editingContact ?? undefined}
          isSubmitting={isSaving}
          error={mutationError}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) {
              setEditingContact(null)
            }
            if (open) {
              setMutationError(null)
            }
          }}
          onSubmit={handleUpdateContact}
        />

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <div className="space-y-2">
            <Label htmlFor="project-contact-select">Link existing contact</Label>
            <Select
              id="project-contact-select"
              value={selectedContactId}
              onChange={(event) => setSelectedContactId(event.target.value)}
              disabled={availableContacts.length === 0}
            >
              <option value="">
                {availableContacts.length === 0
                  ? "No unlinked contacts"
                  : "Select contact"}
              </option>
              {availableContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                  {contact.company ? ` - ${contact.company}` : ""}
                </option>
              ))}
            </Select>
          </div>
          <RelationshipSelect
            id="project-contact-relationship"
            label="Relationship"
            value={relationshipType}
            onChange={setRelationshipType}
          />
          <div className="flex items-end">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleLinkExisting}
              disabled={isSaving || !selectedContactId}
            >
              <Link2 />
              Link
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <RelationshipSelect
            id="new-project-contact-relationship"
            label="Relationship for new contacts"
            value={newContactRelationshipType}
            onChange={setNewContactRelationshipType}
          />
          <div className="flex items-end text-sm text-muted-foreground">
            New contacts created from this section are linked immediately.
          </div>
        </div>

        {mutationError && !createOpen && !editOpen && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {mutationError}
          </div>
        )}

        {loadState === "loading" && (
          <div className="space-y-3">
            {[0, 1].map((item) => (
              <div key={item} className="h-28 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Contacts failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadContacts()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && projectContacts.length === 0 && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No project contacts</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Link an existing contact or create a new stakeholder for this
              project.
            </p>
          </div>
        )}

        {loadState === "ready" &&
          projectContacts.map((link) => (
            <ContactCard
              key={`${link.project_id}-${link.contact_id}`}
              contact={link}
              projectRelationshipType={link.relationship_type}
              onEdit={openEdit}
              onUnlink={handleUnlinkContact}
            />
          ))}
      </CardContent>
    </Card>
  )
}

function RelationshipSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
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
        {projectContactRelationshipTypes.map((relationshipType) => (
          <option key={relationshipType} value={relationshipType}>
            {relationshipType}
          </option>
        ))}
      </Select>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (isMissingContactConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected contact error."
}
