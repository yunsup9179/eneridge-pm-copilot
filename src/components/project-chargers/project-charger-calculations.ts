import type { ProjectChargerGroupWithConnectors } from "@/lib/data/project-chargers"

export function getExpectedPortCount({
  chargerCount,
  portConfiguration,
}: {
  chargerCount: number | null
  portConfiguration: string | null
}) {
  if (chargerCount === null) {
    return null
  }

  if (portConfiguration === "Single Port") {
    return chargerCount
  }

  if (portConfiguration === "Dual Port") {
    return chargerCount * 2
  }

  return null
}

export function getExpectedPortLabel({
  chargerCount,
  portConfiguration,
}: {
  chargerCount: number | null
  portConfiguration: string | null
}) {
  const expectedPorts = getExpectedPortCount({
    chargerCount,
    portConfiguration,
  })

  if (expectedPorts !== null) {
    return expectedPorts.toString()
  }

  if (portConfiguration === "Mixed") {
    return "Manual / mixed configuration"
  }

  if (portConfiguration === "Other") {
    return "Manual / other configuration"
  }

  return "Not available"
}

export function getConnectorTotal(group: ProjectChargerGroupWithConnectors) {
  const totals = group.connectors
    .map((connector) => connector.total_connector_count)
    .filter((count): count is number => count !== null)

  if (totals.length === 0) {
    return null
  }

  return totals.reduce((sum, count) => sum + count, 0)
}

export function getChargerGroupWarnings(group: ProjectChargerGroupWithConnectors) {
  const warnings: string[] = []
  const expectedPorts = getExpectedPortCount({
    chargerCount: group.charger_count,
    portConfiguration: group.port_configuration,
  })
  const connectorTotal = getConnectorTotal(group)

  if (
    expectedPorts !== null &&
    group.port_count !== null &&
    group.port_count !== expectedPorts
  ) {
    warnings.push("Entered total ports does not match the selected port configuration.")
  }

  if (
    connectorTotal !== null &&
    group.port_count !== null &&
    connectorTotal !== group.port_count
  ) {
    warnings.push("Connector totals do not match total ports.")
  }

  return warnings
}
