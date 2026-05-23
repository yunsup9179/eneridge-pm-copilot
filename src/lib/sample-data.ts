export type SampleProject = {
  id: string
  name: string
  location: string
  customer: string
  city: string
  utility: string
  program: string
  chargerType: string
  portCount: number
  phase: string
  status: string
  priority: string
  targetConstructionStart: string
  targetCod: string
  internalOwner: string
  summary: string
  progress: number
}

export type SampleActionItem = {
  id: string
  projectId: string
  title: string
  assignedTo: string
  externalParty: string
  dueDate: string
  priority: string
  status: string
  sourceType: string
}

export type SampleRisk = {
  id: string
  projectId: string
  category: string
  description: string
  severity: string
  owner: string
  status: string
  aiDetected: boolean
}

export type SampleDocument = {
  id: string
  projectId: string
  fileName: string
  documentType: string
  version: string
  status: string
  uploadedAt: string
}

export type SampleContact = {
  id: string
  name: string
  company: string
  role: string
  email: string
  relationshipType: string
  projectIds: string[]
}

export const sampleProjects: SampleProject[] = [
  {
    id: "ucsc-silicon-valley-campus",
    name: "UCSC Silicon Valley Campus",
    location: "Santa Clara, CA",
    customer: "UC Santa Cruz",
    city: "Santa Clara",
    utility: "Silicon Valley Power",
    program: "Campus fleet charging",
    chargerType: "DC fast charging",
    portCount: 12,
    phase: "Design",
    status: "Active",
    priority: "High",
    targetConstructionStart: "2026-07-15",
    targetCod: "2026-10-30",
    internalOwner: "Maya Patel",
    summary:
      "Campus electrification project preparing charger layout, utility coordination, and construction readiness package.",
    progress: 58,
  },
  {
    id: "hyundai-glovis",
    name: "Hyundai Glovis",
    location: "Richmond, CA",
    customer: "Hyundai Glovis",
    city: "Richmond",
    utility: "PG&E",
    program: "Logistics depot electrification",
    chargerType: "High-power DCFC",
    portCount: 18,
    phase: "Utility coordination",
    status: "At risk",
    priority: "Critical",
    targetConstructionStart: "2026-08-05",
    targetCod: "2026-12-18",
    internalOwner: "Jordan Kim",
    summary:
      "Fleet depot charging build with utility service upgrade dependencies and vendor submittals in review.",
    progress: 42,
  },
  {
    id: "cabrillo-pavilion-chill-2",
    name: "Cabrillo Pavilion / CHiLL-2",
    location: "Santa Barbara, CA",
    customer: "City of Santa Barbara",
    city: "Santa Barbara",
    utility: "Southern California Edison",
    program: "Public charging",
    chargerType: "Level 2 + DCFC",
    portCount: 8,
    phase: "Permitting",
    status: "Blocked",
    priority: "Medium",
    targetConstructionStart: "2026-09-02",
    targetCod: "2027-01-22",
    internalOwner: "Elena Torres",
    summary:
      "Public site charging project awaiting permit comments and final coastal access coordination.",
    progress: 34,
  },
]

export const sampleActionItems: SampleActionItem[] = [
  {
    id: "action-utility-load-letter",
    projectId: "ucsc-silicon-valley-campus",
    title: "Confirm final utility load letter",
    assignedTo: "Maya Patel",
    externalParty: "Silicon Valley Power",
    dueDate: "2026-05-29",
    priority: "High",
    status: "Open",
    sourceType: "Email",
  },
  {
    id: "action-glovis-switchgear",
    projectId: "hyundai-glovis",
    title: "Resolve switchgear lead time options",
    assignedTo: "Jordan Kim",
    externalParty: "Electrical vendor",
    dueDate: "2026-06-03",
    priority: "Critical",
    status: "Open",
    sourceType: "Meeting",
  },
  {
    id: "action-cabrillo-permit-response",
    projectId: "cabrillo-pavilion-chill-2",
    title: "Draft response to permit comments",
    assignedTo: "Elena Torres",
    externalParty: "City planning",
    dueDate: "2026-06-07",
    priority: "Medium",
    status: "In progress",
    sourceType: "Permit package",
  },
]

export const sampleRisks: SampleRisk[] = [
  {
    id: "risk-glovis-service-upgrade",
    projectId: "hyundai-glovis",
    category: "Utility",
    description: "Service upgrade timing could push construction start.",
    severity: "High",
    owner: "Jordan Kim",
    status: "Open",
    aiDetected: false,
  },
  {
    id: "risk-ucsc-campus-access",
    projectId: "ucsc-silicon-valley-campus",
    category: "Site access",
    description: "Campus access windows may constrain trenching schedule.",
    severity: "Medium",
    owner: "Maya Patel",
    status: "Monitoring",
    aiDetected: false,
  },
  {
    id: "risk-cabrillo-permitting",
    projectId: "cabrillo-pavilion-chill-2",
    category: "Permitting",
    description: "Permit review comments may require layout changes.",
    severity: "High",
    owner: "Elena Torres",
    status: "Open",
    aiDetected: true,
  },
]

export const sampleDocuments: SampleDocument[] = [
  {
    id: "doc-ucsc-layout",
    projectId: "ucsc-silicon-valley-campus",
    fileName: "UCSC site layout v2.pdf",
    documentType: "Site plan",
    version: "v2",
    status: "In review",
    uploadedAt: "2026-05-20",
  },
  {
    id: "doc-glovis-utility",
    projectId: "hyundai-glovis",
    fileName: "Hyundai Glovis utility package.pdf",
    documentType: "Utility package",
    version: "v1",
    status: "Needs follow-up",
    uploadedAt: "2026-05-18",
  },
  {
    id: "doc-cabrillo-permit",
    projectId: "cabrillo-pavilion-chill-2",
    fileName: "Cabrillo Pavilion permit comments.docx",
    documentType: "Permit comments",
    version: "v1",
    status: "Action items extracted",
    uploadedAt: "2026-05-17",
  },
]

export const sampleContacts: SampleContact[] = [
  {
    id: "contact-amy-wong",
    name: "Amy Wong",
    company: "UC Santa Cruz",
    role: "Campus project sponsor",
    email: "amy.wong@example.com",
    relationshipType: "Customer sponsor",
    projectIds: ["ucsc-silicon-valley-campus"],
  },
  {
    id: "contact-daniel-cho",
    name: "Daniel Cho",
    company: "Hyundai Glovis",
    role: "Fleet operations lead",
    email: "daniel.cho@example.com",
    relationshipType: "Customer stakeholder",
    projectIds: ["hyundai-glovis"],
  },
  {
    id: "contact-sofia-martinez",
    name: "Sofia Martinez",
    company: "City of Santa Barbara",
    role: "Permitting coordinator",
    email: "sofia.martinez@example.com",
    relationshipType: "Authority having jurisdiction",
    projectIds: ["cabrillo-pavilion-chill-2"],
  },
]

export function getProjectById(projectId: string) {
  return sampleProjects.find((project) => project.id === projectId)
}

export function getProjectName(projectId: string) {
  return getProjectById(projectId)?.name ?? "Unassigned project"
}
