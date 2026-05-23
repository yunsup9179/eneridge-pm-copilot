export const actionItemStatuses = [
  "Open",
  "In Progress",
  "Waiting on External Party",
  "Completed",
  "Blocked",
] as const

export const actionItemPriorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const

export type ActionItemStatus = (typeof actionItemStatuses)[number]
export type ActionItemPriority = (typeof actionItemPriorities)[number]
