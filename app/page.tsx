"use client"

import { useEffect } from "react"
import { useSimulationStore } from "@/store/simulation-store"
import { BuildingVisualization } from "@/components/building-visualization"
import { SimulationControls } from "@/components/simulation-controls"
import { ConfigPanel } from "@/components/config-panel"
import { LobbyPanel } from "@/components/lobby-panel"
import { ElevatorControls } from "@/components/elevator-controls"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { EventLog } from "@/components/event-log"

export default function Home() {
  const { isRunning, tick, speed, config } = useSimulationStore()

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      tick()
    }, config.tickMs / speed)

    return () => clearInterval(interval)
  }, [isRunning, tick, speed, config.tickMs])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <header className="text-center py-4">
          <h1 className="text-3xl font-bold text-balance">Elevator Simulation Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">20-Floor Destination Dispatch System</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-4">
          {/* Left Column - Controls */}
          <div className="space-y-4">
            <SimulationControls />
            <ConfigPanel />
            <LobbyPanel />
          </div>

          {/* Center Column - Visualization */}
          <div className="space-y-4">
            <BuildingVisualization />
          </div>

          {/* Right Column - Metrics & Logs */}
          <div className="space-y-4">
            <MetricsDashboard />
            <ElevatorControls />
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  )
}
