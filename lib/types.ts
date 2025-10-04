export type Direction = "up" | "down" | "idle"
export type DoorState = "open" | "opening" | "closing" | "closed"
export type Priority = "normal" | "vip" | "accessible"
export type ElevatorMode = "normal" | "upPeak" | "downPeak" | "interfloor"

export interface Passenger {
  id: string
  origin: number
  dest: number
  createdAt: number
  pickedAt?: number
  droppedAt?: number
  priority?: Priority
}

export interface Request {
  id: string
  origin: number
  dest: number
  createdAt: number
  priority?: Priority
}

export interface Elevator {
  id: string
  currentFloor: number
  targetDirection: Direction
  queue: number[]
  passengers: Passenger[]
  capacity: number
  load: number
  doorState: DoorState
  doorTimerMs: number
  speedFloorsPerSec: number
  accelFloorsPerSec2?: number
  energyKwh: number
  mode: ElevatorMode
  zone?: [number, number]
}

export interface Lobby {
  floor: number
  pendingRequests: Request[]
}

export interface Config {
  floors: number
  elevators: number
  capacityPerElevator: number
  speedFloorsPerSec: number
  doorOpenCloseMs: number
  doorDwellMs: number
  batchWindowMs: number
  tickMs: number
  weights: {
    wWait: number
    wRide: number
    wStops: number
    wEnergy: number
    penaltyOverload: number
    penaltyReversal: number
    penaltySLABreach: number
  }
  SLA: { maxWaitMsP95: number }
  zoningEnabled: boolean
  zones?: Array<[number, number]>
  arrivalRates: number[]
  demandMatrix?: number[][]
  randomSeed?: number
  maxSimPeople?: number
  energyPerFloorKwh?: number
}

export interface SimEvent {
  id: string
  type: "Arrival" | "Assign" | "DoorOpen" | "DoorClose" | "Pickup" | "Dropoff"
  timestamp: number
  elevatorId?: string
  floor?: number
  passengerId?: string
  details?: string
}

export interface Metrics {
  waitTimes: number[]
  rideTimes: number[]
  totalStops: number
  totalTrips: number
  overloadCount: number
  completedPassengers: Passenger[]
}
