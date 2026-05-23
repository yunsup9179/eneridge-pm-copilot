import Link from "next/link"
import { ContactRound, Mail } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjectName, sampleContacts } from "@/lib/sample-data"

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contacts"
        title="Contact directory"
        description="Stakeholder directory with many-to-many project relationships for customers, utilities, vendors, and authorities."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {sampleContacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <ContactRound className="size-4" />
              </span>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>
                {contact.role}, {contact.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                <span className="truncate">{contact.email}</span>
              </div>
              <Badge variant="secondary">{contact.relationshipType}</Badge>
              <div className="space-y-1 border-t pt-4">
                <p className="text-xs text-muted-foreground">Projects</p>
                {contact.projectIds.map((projectId) => (
                  <Link
                    key={projectId}
                    href={`/projects/${projectId}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {getProjectName(projectId)}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
