import { Bot, FileSearch, ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const plannedWorkflows = [
  {
    title: "Document analysis",
    description:
      "Summaries, key terms, extracted action items, and extracted risks from project documents.",
    icon: FileSearch,
  },
  {
    title: "Project health review",
    description:
      "AI-assisted review of action age, risk severity, document status, and upcoming milestones.",
    icon: Bot,
  },
  {
    title: "Human approval loop",
    description:
      "All AI outputs remain logged and require user approval before becoming project data.",
    icon: ShieldCheck,
  },
]

export default function AiWorkspacePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Workspace"
        title="AI workspace placeholder"
        description="Future project-centered AI analysis surface. No AI features are implemented yet; the schema only prepares logging and approval fields."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {plannedWorkflows.map((workflow) => {
          const Icon = workflow.icon

          return (
            <Card key={workflow.title}>
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <CardTitle>{workflow.title}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Not implemented</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
