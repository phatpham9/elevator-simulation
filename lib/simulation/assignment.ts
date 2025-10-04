import type { Elevator, Request, Config } from "../types"
import { costFor } from "./cost"

export function assignRequestsBatch(
  requests: Request[],
  elevators: Elevator[],
  config: Config,
  simTime: number,
): Map<string, string> {
  const assignments = new Map<string, string>()

  for (const request of requests) {
    let bestElevator: Elevator | null = null
    let bestCost = Number.POSITIVE_INFINITY

    for (const elevator of elevators) {
      const cost = costFor(elevator, request, config, simTime)
      if (cost < bestCost) {
        bestCost = cost
        bestElevator = elevator
      }
    }

    if (bestElevator) {
      assignments.set(request.id, bestElevator.id)
    }
  }

  return assignments
}
