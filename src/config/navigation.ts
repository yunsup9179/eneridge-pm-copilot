import type { LucideIcon } from "lucide-react"
import {
  Bot,
  ChartBar,
  ClipboardList,
  ContactRound,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldAlert,
} from "lucide-react"

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Actions",
    href: "/actions",
    icon: ClipboardList,
  },
  {
    label: "Risks",
    href: "/risks",
    icon: ShieldAlert,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: ContactRound,
  },
  {
    label: "AI Workspace",
    href: "/ai-workspace",
    icon: Bot,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: ChartBar,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]
