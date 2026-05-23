"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
  Zap,
} from "lucide-react"

import { navigationItems } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type AppShellProps = {
  children: ReactNode
}

const workspacePulse = [
  {
    label: "Active projects",
    value: "3",
    note: "MVP sample set",
    className: "bg-emerald-500",
  },
  {
    label: "Open actions",
    value: "7",
    note: "Project linked",
    className: "bg-amber-500",
  },
  {
    label: "AI readiness",
    value: "Schema",
    note: "Logs prepared",
    className: "bg-cyan-600",
  },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <BrandMark />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 px-4 py-5">
          <nav className="space-y-1">
            <NavigationLinks pathname={pathname} />
          </nav>
          <Separator />
          <div className="space-y-3">
            <p className="px-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Workspace
            </p>
            <div className="space-y-2">
              {workspacePulse.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-sidebar-border bg-background/80 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                    <span
                      className={cn("size-2 rounded-full", item.className)}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[19rem] p-0">
              <SheetHeader className="border-b text-left">
                <SheetTitle>Eneridge PM Copilot</SheetTitle>
                <SheetDescription>Internal project workspace</SheetDescription>
              </SheetHeader>
              <div className="px-3 py-4">
                <NavigationLinks
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <BrandMark compact />
          </div>

          <div className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2 md:flex">
            <Search className="size-4 text-muted-foreground" />
            <input
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search projects, actions, risks, documents, or contacts"
              type="search"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              asChild
            >
              <Link href="/projects">
                <Plus />
                New project
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2"
                  aria-label="Open account menu"
                >
                  <Avatar className="size-7">
                    <AvatarFallback>EP</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Eneridge PMO</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Workspace settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            Eneridge PM Copilot
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Internal delivery hub
          </span>
        </span>
      )}
    </Link>
  )
}

function NavigationLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-1">
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              "h-10 w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border"
            )}
          >
            <Link href={item.href} onClick={onNavigate}>
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
