import { PlaceholderPage } from "@/components/placeholder-page"

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Settings"
      title="Workspace settings"
      description="Manage workspace defaults, project taxonomy, Supabase readiness, and future access controls."
      focusAreas={[
        "Workspace metadata and EV charging project categories",
        "Project phase, status, priority, and risk taxonomy management",
        "Supabase environment and schema readiness checks",
        "Role and permission surfaces for later authentication work",
      ]}
      nextSteps={[
        "Add environment validation for configured Supabase keys.",
        "Define workspace settings tables and seed data.",
        "Introduce authentication after the core data model is set.",
      ]}
    />
  )
}
