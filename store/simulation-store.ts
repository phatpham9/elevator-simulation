import { create } from "zustand"
import type { Elevator, Passenger, Request, Lobby, Config, SimEvent, Metrics } from "@/lib/types"
import { DEFAULT_CONFIG } from "@/lib/presets"
import { SeededRNG } from "@/lib/utils/rng"
import { assignRequestsBatch } from "@/lib/simulation/assignment"

interface SimulationState {
  // Core state
  config: Config
  elevators: Elevator[]
  lobbies: Lobby[]
  passengers: Passenger[]
  events: SimEvent[]
  metrics: Metrics

  // Simulation control
  isRunning: boolean
  simTime: number
  speed: number
  rng: SeededRNG

  // Batch processing
  batchBuffer: Request[]
  lastBatchTime: number

  // Actions
  setConfig: (config: Partial<Config>) => void
  start: () => void
  pause: () => void
  reset: () => void
  setSpeed: (speed: number) => void
  tick: () => void
  addManualRequest: (floor: number, dest: number) => void
  spawnBurst: (floor: number, count: number) => void
  toggleDoor: (elevatorId: string) => void
}

function createInitialElevators(config: Config): Elevator[] {
  const elevators: Elevator[] = []
  for (let i = 0; i < config.elevators; i++) {
    elevators.push({
      id: `E${i + 1}`,
      currentFloor: 0,
      targetDirection: "idle",
      queue: [],
      passengers: [],
      capacity: config.capacityPerElevator,
      load: 0,
      doorState: "closed",
      doorTimerMs: 0,
      speedFloorsPerSec: config.speedFloorsPerSec,
      energyKwh: 0,
      mode: "normal",
      zone: config.zoningEnabled && config.zones ? config.zones[i] : undefined,
    })
  }
  return elevators
}

function createInitialLobbies(floors: number): Lobby[] {
  return Array.from({ length: floors }, (_, i) => ({
    floor: i,
    pendingRequests: [],
  }))
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  config: DEFAULT_CONFIG,
  elevators: createInitialElevators(DEFAULT_CONFIG),
  lobbies: createInitialLobbies(DEFAULT_CONFIG.floors),
  passengers: [],
  events: [],
  metrics: {
    waitTimes: [],
    rideTimes: [],
    totalStops: 0,
    totalTrips: 0,
    overloadCount: 0,
    completedPassengers: [],
  },
  isRunning: false,
  simTime: 0,
  speed: 1,
  rng: new SeededRNG(DEFAULT_CONFIG.randomSeed),
  batchBuffer: [],
  lastBatchTime: 0,

  setConfig: (newConfig) => {
    const config = { ...get().config, ...newConfig }
    set({
      config,
      elevators: createInitialElevators(config),
      lobbies: createInitialLobbies(config.floors),
    })
  },

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),

  reset: () => {
    const { config } = get()
    const rng = new SeededRNG(config.randomSeed)
    set({
      elevators: createInitialElevators(config),
      lobbies: createInitialLobbies(config.floors),
      passengers: [],
      events: [],
      metrics: {
        waitTimes: [],
        rideTimes: [],
        totalStops: 0,
        totalTrips: 0,
        overloadCount: 0,
        completedPassengers: [],
      },
      isRunning: false,
      simTime: 0,
      rng,
      batchBuffer: [],
      lastBatchTime: 0,
    })
  },

  setSpeed: (speed) => set({ speed }),

  addManualRequest: (floor, dest) => {
    const { simTime, batchBuffer, lobbies } = get()
    const request: Request = {
      id: `R${Date.now()}-${Math.random()}`,
      origin: floor,
      dest,
      createdAt: simTime,
      priority: "normal",
    }

    const newLobbies = [...lobbies]
    newLobbies[floor].pendingRequests.push(request)

    set({
      batchBuffer: [...batchBuffer, request],
      lobbies: newLobbies,
      events: [
        ...get().events,
        {
          id: `EV${Date.now()}`,
          type: "Arrival",
          timestamp: simTime,
          floor,
          passengerId: request.id,
          details: `Request from floor ${floor} to ${dest}`,
        },
      ],
    })
  },

  spawnBurst: (floor, count) => {
    const { config, simTime, rng } = get()
    for (let i = 0; i < count; i++) {
      let dest = rng.nextInt(0, config.floors - 1)
      while (dest === floor) {
        dest = rng.nextInt(0, config.floors - 1)
      }
      get().addManualRequest(floor, dest)
    }
  },

  toggleDoor: (elevatorId) => {
    const { elevators } = get()
    const newElevators = elevators.map((e) => {
      if (e.id === elevatorId && e.doorState === "closed") {
        return { ...e, doorState: "opening" as const, doorTimerMs: 0 }
      }
      if (e.id === elevatorId && e.doorState === "open") {
        return { ...e, doorState: "closing" as const, doorTimerMs: 0 }
      }
      return e
    })
    set({ elevators: newElevators })
  },

  tick: () => {
    const state = get()
    const { config, elevators, lobbies, passengers, simTime, rng, batchBuffer, lastBatchTime, events, metrics } = state

    const deltaMs = config.tickMs
    const newSimTime = simTime + deltaMs
    let newEvents = [...events]
    const newMetrics = { ...metrics }

    // 1. Spawn new arrivals (Poisson process)
    const newPassengers = [...passengers]
    const newLobbies = lobbies.map((lobby) => ({ ...lobby, pendingRequests: [...lobby.pendingRequests] }))
    let newBatchBuffer = [...batchBuffer]

    if (passengers.length < (config.maxSimPeople || 1000)) {
      for (let floor = 0; floor < config.floors; floor++) {
        const lambda = (config.arrivalRates[floor] * deltaMs) / 1000
        const arrivals = rng.poisson(lambda)

        for (let i = 0; i < arrivals; i++) {
          let dest = floor

          if (config.demandMatrix && config.demandMatrix[floor]) {
            const rand = rng.next()
            let cumulative = 0
            for (let d = 0; d < config.floors; d++) {
              cumulative += config.demandMatrix[floor][d]
              if (rand <= cumulative) {
                dest = d
                break
              }
            }
          } else {
            dest = rng.nextInt(0, config.floors - 1)
            while (dest === floor) {
              dest = rng.nextInt(0, config.floors - 1)
            }
          }

          const passenger: Passenger = {
            id: `P${newSimTime}-${floor}-${i}`,
            origin: floor,
            dest,
            createdAt: newSimTime,
            priority: "normal",
          }

          const request: Request = {
            id: passenger.id,
            origin: floor,
            dest,
            createdAt: newSimTime,
            priority: "normal",
          }

          newPassengers.push(passenger)
          newLobbies[floor].pendingRequests.push(request)
          newBatchBuffer.push(request)

          newEvents.push({
            id: `EV${newSimTime}-${floor}-${i}`,
            type: "Arrival",
            timestamp: newSimTime,
            floor,
            passengerId: passenger.id,
            details: `Passenger ${passenger.id} arrived at floor ${floor}, going to ${dest}`,
          })
        }
      }
    }

    // 2. Process batch assignments
    let newElevators = elevators.map((e) => ({
      ...e,
      passengers: [...e.passengers],
      queue: [...e.queue],
    }))

    if (newSimTime - lastBatchTime >= config.batchWindowMs && newBatchBuffer.length > 0) {
      const assignments = assignRequestsBatch(newBatchBuffer, newElevators, config, newSimTime)

      assignments.forEach((elevatorId, requestId) => {
        const request = newBatchBuffer.find((r) => r.id === requestId)
        if (!request) return

        const elevatorIndex = newElevators.findIndex((e) => e.id === elevatorId)
        if (elevatorIndex === -1) return

        const elevator = newElevators[elevatorIndex]

        // Add stops to queue
        if (!elevator.queue.includes(request.origin)) {
          elevator.queue.push(request.origin)
        }
        if (!elevator.queue.includes(request.dest)) {
          elevator.queue.push(request.dest)
        }

        // Sort queue based on direction
        elevator.queue.sort((a, b) => {
          if (elevator.targetDirection === "up") return a - b
          if (elevator.targetDirection === "down") return b - a
          return Math.abs(a - elevator.currentFloor) - Math.abs(b - elevator.currentFloor)
        })

        // Remove from lobby
        const lobbyIndex = newLobbies.findIndex((l) => l.floor === request.origin)
        if (lobbyIndex !== -1) {
          newLobbies[lobbyIndex].pendingRequests = newLobbies[lobbyIndex].pendingRequests.filter(
            (r) => r.id !== requestId,
          )
        }

        newEvents.push({
          id: `EV${newSimTime}-assign-${requestId}`,
          type: "Assign",
          timestamp: newSimTime,
          elevatorId,
          floor: request.origin,
          passengerId: requestId,
          details: `Assigned to ${elevatorId}`,
        })
      })

      newBatchBuffer = []
      set({ lastBatchTime: newSimTime })
    }

    // 3. Move elevators and handle doors
    newElevators = newElevators.map((elevator) => {
      const e = { ...elevator }

      // Handle door states
      if (e.doorState === "opening" || e.doorState === "closing") {
        e.doorTimerMs += deltaMs
        if (e.doorTimerMs >= config.doorOpenCloseMs) {
          e.doorState = e.doorState === "opening" ? "open" : "closed"
          e.doorTimerMs = 0

          newEvents.push({
            id: `EV${newSimTime}-door-${e.id}`,
            type: e.doorState === "open" ? "DoorOpen" : "DoorClose",
            timestamp: newSimTime,
            elevatorId: e.id,
            floor: Math.round(e.currentFloor),
            details: `${e.id} door ${e.doorState} at floor ${Math.round(e.currentFloor)}`,
          })
        }
        return e
      }

      if (e.doorState === "open") {
        e.doorTimerMs += deltaMs

        // Handle passenger boarding/alighting at current floor
        const currentFloorRounded = Math.round(e.currentFloor)

        // Alight passengers
        const alighting = e.passengers.filter((p) => p.dest === currentFloorRounded)
        alighting.forEach((p) => {
          const passenger = newPassengers.find((np) => np.id === p.id)
          if (passenger && !passenger.droppedAt) {
            passenger.droppedAt = newSimTime
            const waitTime = (passenger.pickedAt || newSimTime) - passenger.createdAt
            const rideTime = newSimTime - (passenger.pickedAt || newSimTime)
            newMetrics.waitTimes.push(waitTime)
            newMetrics.rideTimes.push(rideTime)
            newMetrics.completedPassengers.push(passenger)
            newMetrics.totalTrips++

            newEvents.push({
              id: `EV${newSimTime}-dropoff-${p.id}`,
              type: "Dropoff",
              timestamp: newSimTime,
              elevatorId: e.id,
              floor: currentFloorRounded,
              passengerId: p.id,
              details: `Passenger ${p.id} dropped off at floor ${currentFloorRounded}`,
            })
          }
        })
        e.passengers = e.passengers.filter((p) => p.dest !== currentFloorRounded)
        e.load = e.passengers.length

        // Board passengers
        const waiting = newPassengers.filter((p) => p.origin === currentFloorRounded && !p.pickedAt && !p.droppedAt)
        waiting.forEach((p) => {
          if (e.load < e.capacity && e.queue.includes(p.dest)) {
            e.passengers.push(p)
            e.load++
            p.pickedAt = newSimTime

            newEvents.push({
              id: `EV${newSimTime}-pickup-${p.id}`,
              type: "Pickup",
              timestamp: newSimTime,
              elevatorId: e.id,
              floor: currentFloorRounded,
              passengerId: p.id,
              details: `Passenger ${p.id} boarded ${e.id} at floor ${currentFloorRounded}`,
            })
          }
        })

        if (e.doorTimerMs >= config.doorDwellMs) {
          e.doorState = "closing"
          e.doorTimerMs = 0

          // Remove current floor from queue
          e.queue = e.queue.filter((f) => f !== currentFloorRounded)
          newMetrics.totalStops++
        }
        return e
      }

      // Move elevator
      if (e.queue.length > 0 && e.doorState === "closed") {
        const nextStop = e.queue[0]
        const distance = nextStop - e.currentFloor
        const direction = distance > 0 ? "up" : distance < 0 ? "down" : "idle"
        e.targetDirection = direction

        if (Math.abs(distance) < 0.01) {
          // Reached stop
          e.currentFloor = nextStop
          e.doorState = "opening"
          e.doorTimerMs = 0
          e.targetDirection = "idle"
        } else {
          // Move towards stop
          const moveDistance = (e.speedFloorsPerSec * deltaMs) / 1000
          if (Math.abs(distance) <= moveDistance) {
            e.currentFloor = nextStop
          } else {
            e.currentFloor += direction === "up" ? moveDistance : -moveDistance
          }

          // Update energy
          e.energyKwh += moveDistance * (config.energyPerFloorKwh || 0.05)
        }
      } else if (e.queue.length === 0) {
        e.targetDirection = "idle"
      }

      return e
    })

    // Limit events to last 1000
    if (newEvents.length > 1000) {
      newEvents = newEvents.slice(-1000)
    }

    set({
      simTime: newSimTime,
      elevators: newElevators,
      lobbies: newLobbies,
      passengers: newPassengers,
      batchBuffer: newBatchBuffer,
      events: newEvents,
      metrics: newMetrics,
    })
  },
}))
