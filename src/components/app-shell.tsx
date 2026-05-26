"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { Menu, Plus, Zap } from "lucide-react"

import { navigationItems } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
            <div className="rounded-lg border border-sidebar-border bg-background/80 p-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                Live Supabase workspace
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Project delivery records are managed from the main navigation.
              </p>
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

          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm font-medium">
              Internal project delivery workspace
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Use the navigation to manage projects, actions, risks, documents,
              contacts, reports, and AI tools.
            </p>
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
