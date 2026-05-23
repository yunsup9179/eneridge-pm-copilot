import Link from "next/link"
import { FileText } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjectName, sampleDocuments } from "@/lib/sample-data"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Document library"
        description="Project-linked document library for site plans, utility packages, permits, contracts, and later AI extraction results."
      />

      <Card>
        <CardHeader>
          <CardTitle>Document placeholders</CardTitle>
          <CardDescription>
            Files are not uploaded yet. These rows show the metadata shape for
            the `documents` table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleDocuments.map((document) => (
            <div
              key={document.id}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_12rem_9rem]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <h2 className="truncate text-sm font-semibold">
                    {document.fileName}
                  </h2>
                </div>
                <Link
                  href={`/projects/${document.projectId}`}
                  className="mt-1 block truncate text-xs text-muted-foreground hover:text-foreground"
                >
                  {getProjectName(document.projectId)}
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium">{document.documentType}</p>
                <p className="text-xs text-muted-foreground">
                  {document.version}
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                <Badge variant="secondary">{document.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
