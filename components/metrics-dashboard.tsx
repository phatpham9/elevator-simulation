"use client"

import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { useMemo } from "react"

export function MetricsDashboard() {
  const { metrics, elevators, passengers } = useSimulationStore()

  const stats = useMemo(() => {
    const { waitTimes, rideTimes, totalStops, totalTrips } = metrics

    const calculatePercentile = (arr: number[], percentile: number) => {
      if (arr.length === 0) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const index = Math.ceil((percentile / 100) * sorted.length) - 1
      return sorted[Math.max(0, index)]
    }

    const waitP50 = calculatePercentile(waitTimes, 50)
    const waitP90 = calculatePercentile(waitTimes, 90)
    const waitP95 = calculatePercentile(waitTimes, 95)

    const rideP50 = calculatePercentile(rideTimes, 50)
    const rideP90 = calculatePercentile(rideTimes, 90)
    const rideP95 = calculatePercentile(rideTimes, 95)

    const avgStopsPerTrip = totalTrips > 0 ? (totalStops / totalTrips).toFixed(2) : "0"

    const totalCapacity = elevators.reduce((sum, e) => sum + e.capacity, 0)
    const totalLoad = elevators.reduce((sum, e) => sum + e.load, 0)
    const utilization = totalCapacity > 0 ? ((totalLoad / totalCapacity) * 100).toFixed(1) : "0"

    const totalEnergy = elevators.reduce((sum, e) => sum + e.energyKwh, 0)

    const activePassengers = passengers.filter((p) => !p.droppedAt).length

    return {
      waitP50: (waitP50 / 1000).toFixed(1),
      waitP90: (waitP90 / 1000).toFixed(1),
      waitP95: (waitP95 / 1000).toFixed(1),
      rideP50: (rideP50 / 1000).toFixed(1),
      rideP90: (rideP90 / 1000).toFixed(1),
      rideP95: (rideP95 / 1000).toFixed(1),
      avgStopsPerTrip,
      utilization,
      totalEnergy: totalEnergy.toFixed(2),
      totalTrips,
      activePassengers,
    }
  }, [metrics, elevators, passengers])

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Key Metrics</h3>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Wait P50" value={`${stats.waitP50}s`} />
        <MetricCard label="Wait P90" value={`${stats.waitP90}s`} />
        <MetricCard label="Wait P95" value={`${stats.waitP95}s`} />
        <MetricCard label="Ride P50" value={`${stats.rideP50}s`} />
        <MetricCard label="Ride P90" value={`${stats.rideP90}s`} />
        <MetricCard label="Ride P95" value={`${stats.rideP95}s`} />
        <MetricCard label="Avg Stops" value={stats.avgStopsPerTrip} />
        <MetricCard label="Utilization" value={`${stats.utilization}%`} />
        <MetricCard label="Energy" value={`${stats.totalEnergy} kWh`} />
        <MetricCard label="Completed" value={stats.totalTrips.toString()} />
        <MetricCard label="Active" value={stats.activePassengers.toString()} />
      </div>
    </Card>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-secondary rounded-lg">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-mono font-semibold">{value}</div>
    </div>
  )
}
