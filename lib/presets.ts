import type { Config } from "./types"

export const DEFAULT_CONFIG: Config = {
  floors: 20,
  elevators: 4,
  capacityPerElevator: 12,
  speedFloorsPerSec: 1.5,
  doorOpenCloseMs: 1000,
  doorDwellMs: 1500,
  batchWindowMs: 1500,
  tickMs: 200,
  weights: {
    wWait: 1,
    wRide: 0.5,
    wStops: 0.3,
    wEnergy: 0.1,
    penaltyOverload: 100,
    penaltyReversal: 5,
    penaltySLABreach: 20,
  },
  SLA: { maxWaitMsP95: 60000 },
  zoningEnabled: false,
  arrivalRates: Array(20).fill(0.2),
  randomSeed: 42,
  maxSimPeople: 1000,
  energyPerFloorKwh: 0.05,
}

export const UP_PEAK_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  arrivalRates: [
    2.0, // Floor 0 (lobby) - high traffic
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
  ],
  demandMatrix: Array(20)
    .fill(null)
    .map((_, i) => {
      if (i === 0) {
        // From lobby, uniform to upper floors
        return Array(20)
          .fill(0)
          .map((_, j) => (j === 0 ? 0 : 1 / 19))
      }
      // From other floors, mostly to lobby
      return Array(20)
        .fill(0)
        .map((_, j) => (j === 0 ? 0.8 : 0.2 / 19))
    }),
}

export const DOWN_PEAK_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  arrivalRates: [
    0.1, // Floor 0
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1, // Floor 10
    1.5,
    1.5,
    1.5,
    1.5,
    1.5,
    1.5,
    1.5,
    1.5,
    1.5, // Floors 11-19 high traffic
  ],
  demandMatrix: Array(20)
    .fill(null)
    .map((_, i) => {
      if (i >= 11) {
        // From upper floors, mostly to lobby
        return Array(20)
          .fill(0)
          .map((_, j) => (j === 0 ? 0.9 : 0.1 / 19))
      }
      return Array(20)
        .fill(0)
        .map((_, j) => (j === i ? 0 : 1 / 19))
    }),
}

export const INTERFLOOR_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  arrivalRates: Array(20).fill(0.5),
  demandMatrix: Array(20)
    .fill(null)
    .map((_, i) =>
      Array(20)
        .fill(0)
        .map((_, j) => (j === i ? 0 : 1 / 19)),
    ),
}
