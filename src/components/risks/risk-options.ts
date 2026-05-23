export const riskCategories = [
  "Utility Delay",
  "Permit Delay",
  "Grant Compliance",
  "Cost Overrun",
  "Design Conflict",
  "Contract Risk",
  "Customer Delay",
  "Construction Risk",
  "ADA / Accessibility",
  "Weights & Measures / RSA",
  "Funding / Reimbursement",
  "Other",
] as const

export const riskImpactValues = ["Low", "Medium", "High", "Critical"] as const

export const riskLikelihoodValues = ["Low", "Medium", "High"] as const

export const riskSeverityValues = ["Low", "Medium", "High", "Critical"] as const

export const riskStatuses = ["Open", "Monitoring", "Mitigating", "Closed"] as const

export type RiskCategory = (typeof riskCategories)[number]
export type RiskImpact = (typeof riskImpactValues)[number]
export type RiskLikelihood = (typeof riskLikelihoodValues)[number]
export type RiskSeverity = (typeof riskSeverityValues)[number]
export type RiskStatus = (typeof riskStatuses)[number]
