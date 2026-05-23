import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  focusAreas: string[]
  nextSteps: string[]
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  focusAreas,
  nextSteps,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace outline</CardTitle>
            <CardDescription>
              Initial surfaces for the Eneridge project teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => (
              <div key={area} className="rounded-lg border bg-muted/40 p-3">
                <Badge variant="outline" className="mb-3">
                  Planned
                </Badge>
                <p className="text-sm font-medium">{area}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build queue</CardTitle>
            <CardDescription>
              Placeholder items to convert into connected workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-medium text-accent-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
