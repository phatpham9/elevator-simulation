import type { Elevator, Request, Config } from "../types"

export function estimateTimeToReach(elevator: Elevator, targetFloor: number, config: Config): number {
  const { queue, currentFloor, speedFloorsPerSec, doorOpenCloseMs, doorDwellMs } = elevator

  if (queue.length === 0) {
    const distance = Math.abs(targetFloor - currentFloor)
    return (distance / speedFloorsPerSec) * 1000
  }

  let time = 0
  let currentPos = currentFloor
  const queueCopy = [...queue]

  // Check if target is already in queue
  const targetIndex = queueCopy.indexOf(targetFloor)
  const stopsToTarget = targetIndex >= 0 ? targetIndex + 1 : queueCopy.length + 1

  for (let i = 0; i < stopsToTarget; i++) {
    const nextStop = i < queueCopy.length ? queueCopy[i] : targetFloor
    const distance = Math.abs(nextStop - currentPos)
    time += (distance / speedFloorsPerSec) * 1000
    time += doorOpenCloseMs + doorDwellMs
    currentPos = nextStop
  }

  return time
}

export function estimateRideTime(elevator: Elevator, origin: number, dest: number, config: Config): number {
  const distance = Math.abs(dest - origin)
  const travelTime = (distance / elevator.speedFloorsPerSec) * 1000

  // Estimate intermediate stops
  const avgStops = Math.min(elevator.queue.length, Math.abs(dest - origin) / 3)
  const stopTime = avgStops * (config.doorOpenCloseMs + config.doorDwellMs)

  return travelTime + stopTime
}

export function estimateAddedStops(elevator: Elevator, origin: number, dest: number): number {
  const { queue } = elevator
  let addedStops = 0

  if (!queue.includes(origin)) addedStops++
  if (!queue.includes(dest)) addedStops++

  return addedStops
}

export function estimateEnergy(elevator: Elevator, origin: number, dest: number, config: Config): number {
  const distance = Math.abs(dest - origin)
  return distance * (config.energyPerFloorKwh || 0.05)
}

export function costFor(elevator: Elevator, request: Request, config: Config, simTime: number): number {
  const { weights, SLA } = config
  const { origin, dest, createdAt } = request

  const etaWait = estimateTimeToReach(elevator, origin, config)
  const rideTime = estimateRideTime(elevator, origin, dest, config)
  const addedStops = estimateAddedStops(elevator, origin, dest)
  const energy = estimateEnergy(elevator, origin, dest, config)

  let cost =
    weights.wWait * etaWait +
    weights.wRide * rideTime +
    weights.wStops * addedStops * 1000 +
    weights.wEnergy * energy * 1000

  // Penalty: overload
  if (elevator.load >= elevator.capacity) {
    cost += weights.penaltyOverload * 1000
  }

  // Penalty: immediate reversal
  const currentDirection = elevator.targetDirection
  const requestDirection: "up" | "down" = dest > origin ? "up" : "down"
  if (currentDirection !== "idle" && currentDirection !== requestDirection && elevator.queue.length > 0) {
    cost += weights.penaltyReversal * 1000
  }

  // Penalty: SLA breach
  const totalWait = etaWait + (simTime - createdAt)
  if (totalWait > SLA.maxWaitMsP95) {
    cost += weights.penaltySLABreach * 1000
  }

  // Zoning constraint
  if (config.zoningEnabled && elevator.zone) {
    const [zoneMin, zoneMax] = elevator.zone
    if (origin < zoneMin || origin > zoneMax) {
      cost += 10000 // Heavy penalty for out-of-zone
    }
  }

  return cost
}
