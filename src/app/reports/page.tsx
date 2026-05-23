import { PlaceholderPage } from "@/components/placeholder-page"

export default function ReportsPage() {
  return (
    <PlaceholderPage
      eyebrow="Reports"
      title="Project reporting"
      description="Prepare project-centered PMO snapshots for schedule, action aging, risk exposure, document readiness, and delivery accountability."
      focusAreas={[
        "Portfolio rollups across projects, actions, risks, and documents",
        "Project health summaries by phase, status, and priority",
        "Export-ready reporting views for customer and PMO meetings",
        "Saved reporting presets for recurring operating cadence",
      ]}
      nextSteps={[
        "Agree on MVP reporting metrics and chart definitions.",
        "Create Supabase views for project rollup calculations.",
        "Add export workflows after source data exists.",
      ]}
    />
  )
}
