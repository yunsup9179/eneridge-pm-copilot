import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  const content = readFileSync(envPath, "utf8")

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const index = trimmed.indexOf("=")
    if (index === -1) {
      continue
    }

    const key = trimmed.slice(0, index)
    const value = trimmed.slice(index + 1)
    process.env[key] = process.env[key] ?? value
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`)
  }
}

function assertNumberEqual(actual, expected, label) {
  if (Number(actual) !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`)
  }
}

function summarizeSupabaseError(error) {
  if (!error) {
    return "Unknown Supabase error"
  }

  return [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" | ")
}

async function run() {
  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const marker = `QA_STEP_4C_${Date.now()}`
  const created = {
    projectId: null,
    actionItemId: null,
    riskId: null,
    chargerGroupIds: [],
    connectorIds: [],
  }

  async function insert(table, payload) {
    const { data, error } = await supabase.from(table).insert(payload).select("*").single()
    if (error) {
      throw new Error(`Insert failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function update(table, id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single()
    if (error) {
      throw new Error(`Update failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function readById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single()
    if (error) {
      throw new Error(`Read failed for ${table}: ${summarizeSupabaseError(error)}`)
    }
    return data
  }

  async function safeDelete(table, id) {
    if (!id) {
      return
    }

    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) {
      console.error(`Cleanup failed for ${table}/${id}: ${summarizeSupabaseError(error)}`)
    }
  }

  async function cleanup() {
    for (const id of [...created.connectorIds].reverse()) {
      await safeDelete("project_charger_connectors", id)
    }
    for (const id of [...created.chargerGroupIds].reverse()) {
      await safeDelete("project_charger_groups", id)
    }
    await safeDelete("risks", created.riskId)
    await safeDelete("action_items", created.actionItemId)
    await safeDelete("projects", created.projectId)
  }

  try {
    console.log(`QA marker: ${marker}`)

    const project = await insert("projects", {
      name: `QA Temporary Project - Step 4C - ${marker}`,
      location: "QA Test Location",
      customer: "QA Temporary Customer",
      city: "QA City",
      utility: "QA Utility",
      phase: "QA",
      status: "Active",
      priority: "Low",
      summary: `Temporary QA record ${marker}`,
    })
    created.projectId = project.id

    const actionItem = await insert("action_items", {
      project_id: project.id,
      title: `QA Temporary Action - ${marker}`,
      status: "Open",
      priority: "Medium",
      notes: `Temporary QA record ${marker}`,
    })
    created.actionItemId = actionItem.id

    const risk = await insert("risks", {
      project_id: project.id,
      category: "QA",
      description: `QA Temporary Risk - ${marker}`,
      severity: "Low",
      status: "Open",
      mitigation_plan: `Temporary QA record ${marker}`,
    })
    created.riskId = risk.id

    const chargerCases = [
      {
        group: {
          project_id: project.id,
          charger_category: "Level 2",
          charger_model: "QA Level 2 Dual Port",
          power_rating_kw: 19.2,
          charger_count: 3,
          port_count: 6,
          port_configuration: "Dual Port",
          notes: `QA test record ${marker}`,
        },
        connectors: [
          {
            connector_type: "J1772",
            connector_count_per_charger: 2,
            total_connector_count: 6,
            notes: `QA test record ${marker}`,
          },
        ],
      },
      {
        group: {
          project_id: project.id,
          charger_category: "DCFC",
          charger_model: "QA 180kW DCFC",
          power_rating_kw: 180,
          charger_count: 2,
          port_count: 4,
          port_configuration: "Dual Port",
          notes: `QA test record ${marker}`,
        },
        connectors: [
          {
            connector_type: "CCS1",
            connector_count_per_charger: 1,
            total_connector_count: 2,
            notes: `QA test record ${marker}`,
          },
          {
            connector_type: "NACS / J3400",
            connector_count_per_charger: 1,
            total_connector_count: 2,
            notes: `QA test record ${marker}`,
          },
        ],
      },
      {
        group: {
          project_id: project.id,
          charger_category: "Level 2",
          charger_model: "QA Level 2 Single Port",
          power_rating_kw: 7.2,
          charger_count: 1,
          port_count: 1,
          port_configuration: "Single Port",
          notes: `QA test record ${marker}`,
        },
        connectors: [
          {
            connector_type: "J1772",
            connector_count_per_charger: 1,
            total_connector_count: 1,
            notes: `QA test record ${marker}`,
          },
        ],
      },
      {
        group: {
          project_id: project.id,
          charger_category: "Level 2",
          charger_model: "QA Mixed Level 2",
          power_rating_kw: 11.5,
          charger_count: 4,
          port_count: 7,
          port_configuration: "Mixed",
          notes: "One single-port unit and three dual-port units represented as a mixed group",
        },
        connectors: [
          {
            connector_type: "J1772",
            connector_count_per_charger: null,
            total_connector_count: 7,
            notes: `QA test record ${marker}`,
          },
        ],
      },
    ]

    const createdGroups = []
    const createdConnectors = []

    for (const testCase of chargerCases) {
      const group = await insert("project_charger_groups", testCase.group)
      created.chargerGroupIds.push(group.id)
      createdGroups.push(group)

      for (const connectorPayload of testCase.connectors) {
        const connector = await insert("project_charger_connectors", {
          ...connectorPayload,
          charger_group_id: group.id,
        })
        created.connectorIds.push(connector.id)
        createdConnectors.push(connector)
      }
    }

    const rereadProject = await readById("projects", project.id)
    assertEqual(rereadProject.name, project.name, "Project name readback")

    const rereadAction = await readById("action_items", actionItem.id)
    assertEqual(rereadAction.project_id, project.id, "Action item project_id readback")

    const rereadRisk = await readById("risks", risk.id)
    assertEqual(rereadRisk.project_id, project.id, "Risk project_id readback")

    const decimalChecks = [
      [createdGroups[0].id, 19.2, "19.2 kW preserved"],
      [createdGroups[2].id, 7.2, "7.2 kW preserved"],
      [createdGroups[3].id, 11.5, "11.5 kW preserved"],
    ]

    for (const [id, expected, label] of decimalChecks) {
      const group = await readById("project_charger_groups", id)
      assertNumberEqual(group.power_rating_kw, expected, label)
    }

    const { data: groupsForProject, error: groupsError } = await supabase
      .from("project_charger_groups")
      .select("*")
      .eq("project_id", project.id)
    if (groupsError) {
      throw new Error(`Project charger group query failed: ${summarizeSupabaseError(groupsError)}`)
    }
    assertEqual(groupsForProject.length, 4, "Project charger group count")

    const { data: connectorsForGroups, error: connectorsError } = await supabase
      .from("project_charger_connectors")
      .select("*")
      .in("charger_group_id", created.chargerGroupIds)
    if (connectorsError) {
      throw new Error(`Connector query failed: ${summarizeSupabaseError(connectorsError)}`)
    }
    assertEqual(connectorsForGroups.length, 5, "Project connector row count")

    const updatedProject = await update("projects", project.id, {
      summary: `Temporary QA record ${marker} - updated`,
    })
    assertEqual(
      updatedProject.summary,
      `Temporary QA record ${marker} - updated`,
      "Project update readback"
    )

    const updatedAction = await update("action_items", actionItem.id, {
      status: "Completed",
      notes: `Temporary QA record ${marker} - updated`,
    })
    assertEqual(updatedAction.status, "Completed", "Action item update readback")

    const updatedRisk = await update("risks", risk.id, {
      severity: "Medium",
      status: "Monitoring",
    })
    assertEqual(updatedRisk.severity, "Medium", "Risk update readback")

    const updatedGroup = await update("project_charger_groups", createdGroups[0].id, {
      charger_model: "QA Level 2 Dual Port - Updated",
      power_rating_kw: 19.2,
    })
    assertEqual(
      updatedGroup.charger_model,
      "QA Level 2 Dual Port - Updated",
      "Charger group update readback"
    )
    assertNumberEqual(updatedGroup.power_rating_kw, 19.2, "Updated decimal kW preserved")

    const updatedConnector = await update(
      "project_charger_connectors",
      createdConnectors[0].id,
      {
        total_connector_count: 6,
        notes: `QA connector updated ${marker}`,
      }
    )
    assertEqual(
      updatedConnector.notes,
      `QA connector updated ${marker}`,
      "Connector update readback"
    )

    console.log("QA Step 4C CRUD checks passed.")
    console.log(`Created project: ${created.projectId}`)
    console.log(`Created action item: ${created.actionItemId}`)
    console.log(`Created risk: ${created.riskId}`)
    console.log(`Created charger groups: ${created.chargerGroupIds.length}`)
    console.log(`Created connector rows: ${created.connectorIds.length}`)
  } finally {
    await cleanup()
    console.log("QA cleanup completed for records created by this run.")
  }
}

run()
  .then(() => {
    console.log("QA STEP 4C RESULT: PASS")
  })
  .catch((error) => {
    console.error("QA STEP 4C RESULT: FAIL")
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })

