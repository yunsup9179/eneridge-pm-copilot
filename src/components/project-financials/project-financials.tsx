"use client"

import { useCallback, useEffect, useState } from "react"
import { DollarSign, Pencil } from "lucide-react"

import { ProjectFinancialFormSheet } from "@/components/project-financials/project-financial-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getProjectFinancialByProjectId,
  isMissingProjectFinancialConfigError,
  upsertProjectFinancialByProjectId,
  type ProjectFinancial,
  type ProjectFinancialUpdateInput,
} from "@/lib/data/project-financials"
import type { Project } from "@/lib/data/projects"

type LoadState = "loading" | "ready" | "error"

export function ProjectFinancials({ project }: { project: Project }) {
  const [financial, setFinancial] = useState<ProjectFinancial | null>(null)
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadFinancial = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadState("loading")
      setLoadError(null)
    }

    try {
      const data = await getProjectFinancialByProjectId(project.id)
      setFinancial(data)
      setLoadState("ready")
    } catch (error) {
      setLoadError(getErrorMessage(error))
      setLoadState("error")
    }
  }, [project.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFinancial()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadFinancial])

  async function handleSubmit(input: ProjectFinancialUpdateInput) {
    setIsSaving(true)
    setMutationError(null)

    try {
      const data = await upsertProjectFinancialByProjectId(project.id, input)
      setFinancial(data)
      setEditOpen(false)
    } catch (error) {
      setMutationError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Project Financials</CardTitle>
            <CardDescription>
              Cost, rebate, grant, contribution, and reimbursement tracking.
            </CardDescription>
          </div>
          <ProjectFinancialFormSheet
            open={editOpen}
            title={financial ? "Edit project financials" : "Add project financials"}
            description={`Update financial tracking for ${project.name}.`}
            submitLabel="Save financials"
            financial={financial}
            isSubmitting={isSaving}
            error={mutationError}
            trigger={
              <Button variant={financial ? "outline" : "default"}>
                <Pencil />
                {financial ? "Edit Financials" : "Add Financials"}
              </Button>
            }
            onOpenChange={(open) => {
              setEditOpen(open)
              if (open) {
                setMutationError(null)
              }
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mutationError && !editOpen && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {mutationError}
          </div>
        )}

        {loadState === "loading" && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-20 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Financials failed to load</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void loadFinancial()}
            >
              Retry
            </Button>
          </div>
        )}

        {loadState === "ready" && !financial && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <Badge variant="outline">No financials</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Add project financials when cost, rebate, grant, or reimbursement
              details are available.
            </p>
          </div>
        )}

        {loadState === "ready" && financial && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FinancialMetric
                label="Estimated Total Cost"
                value={formatCurrency(financial.estimated_total_cost)}
              />
              <FinancialMetric
                label="Actual Total Cost"
                value={formatCurrency(financial.actual_total_cost)}
              />
              <FinancialMetric
                label="Rebate Amount"
                value={formatCurrency(financial.rebate_amount)}
              />
              <FinancialMetric
                label="Grant Amount"
                value={formatCurrency(financial.grant_amount)}
              />
            </div>

            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-4">
              <Meta
                label="Equipment Cost"
                value={formatCurrency(financial.equipment_cost)}
              />
              <Meta
                label="Installation Cost"
                value={formatCurrency(financial.installation_cost)}
              />
              <Meta
                label="Utility Cost"
                value={formatCurrency(financial.utility_cost)}
              />
              <Meta
                label="Soft Cost"
                value={formatCurrency(financial.soft_cost)}
              />
              <Meta
                label="Rebate Applicable"
                value={financial.rebate_applicable ? "Yes" : "No"}
              />
              <Meta
                label="Rebate Program"
                value={financial.rebate_program ?? "Not set"}
              />
              <Meta
                label="Match Share"
                value={formatCurrency(financial.match_share_amount)}
              />
              <Meta
                label="Customer Contribution"
                value={formatCurrency(financial.customer_contribution)}
              />
              <Meta
                label="Eneridge Out of Pocket"
                value={formatCurrency(financial.eneridge_out_of_pocket)}
              />
              <Meta
                label="Reimbursement Status"
                value={financial.reimbursement_status ?? "Not set"}
              />
              <Meta
                label="Reimbursement Received"
                value={formatCurrency(financial.reimbursement_received)}
              />
              <Meta
                label="Retention Amount"
                value={formatCurrency(financial.retention_amount)}
              />
            </div>

            {financial.notes && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="mt-1 leading-6">{financial.notes}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function FinancialMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <DollarSign className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  )
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Not set"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getErrorMessage(error: unknown) {
  if (isMissingProjectFinancialConfigError(error)) {
    return error.message
  }

  return error instanceof Error
    ? error.message
    : "Unexpected project financial error."
}
