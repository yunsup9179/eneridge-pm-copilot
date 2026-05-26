"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { ContactCard } from "@/components/contacts/contact-card"
import { ContactFormSheet } from "@/components/contacts/contact-form-sheet"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createContact,
  deleteContact,
  getContacts,
  isMissingContactConfigError,
  updateContact,
  type Contact,
  type ContactCreateInput,
  type ContactWithProjects,
} from "@/lib/data/contacts"

type LoadState = "loading" | "ready" | "error"

export function ContactsClient() {
  const [contacts, setContacts] = useState<ContactWithProjects[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadContacts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getContacts()
      setContacts(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadContacts()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadContacts])

  const filteredContacts = useMemo(() => {
    const needle = search.trim().toLowerCase()

    if (!needle) {
      return contacts
    }

    return contacts.filter((contact) =>
      [
        contact.name,
        contact.company,
        contact.role,
        contact.email,
        contact.phone,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle))
    )
  }, [contacts, search])

  async function refreshContacts() {
    const data = await getContacts()
    setContacts(data)
  }

  async function handleCreateContact(input: ContactCreateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      await createContact(input)
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

  async function handleDeleteContact(contact: Contact) {
    const confirmed = window.confirm(
      `Delete contact "${contact.name}"? This will also remove project contact links.`
    )

    if (!confirmed) {
      return
    }

    setMutationError(null)

    try {
      await deleteContact(contact.id)
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contacts"
        title="Contact directory"
        description="Live stakeholder directory for customers, utilities, vendors, contractors, city contacts, grant managers, and internal owners."
        actions={
          <ContactFormSheet
            open={createOpen}
            title="Create contact"
            description="Add a stakeholder to the shared contact directory."
            submitLabel="Create contact"
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
            onSubmit={handleCreateContact}
          />
        }
      />

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

      {mutationError && !createOpen && !editOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {loadState === "loading" && <ContactsLoadingState />}

      {loadState === "error" && (
        <ContactsErrorState
          message={loadError ?? "Unable to load contacts."}
          onRetry={() => void loadContacts()}
        />
      )}

      {loadState === "ready" && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="contact-search">Search contacts</Label>
                <Input
                  id="contact-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, company, role, email, or phone"
                />
              </div>
            </CardContent>
          </Card>

          {contacts.length === 0 ? (
            <ContactsEmptyState onCreate={() => setCreateOpen(true)} />
          ) : filteredContacts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No contacts match this search</CardTitle>
                <CardDescription>
                  Adjust the search text to see more records.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  showProjects
                  onEdit={openEdit}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ContactsLoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-32 rounded-lg bg-muted" />
      ))}
    </div>
  )
}

function ContactsErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  const isMissingConfig = message.includes("NEXT_PUBLIC_SUPABASE")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isMissingConfig
            ? "Supabase is not configured"
            : "Contacts failed to load"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

function ContactsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No contacts yet</CardTitle>
        <CardDescription>
          Add the first stakeholder to the contact directory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate}>
          <Plus />
          New Contact
        </Button>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (isMissingContactConfigError(error)) {
    return error.message
  }

  return error instanceof Error ? error.message : "Unexpected contact error."
}
