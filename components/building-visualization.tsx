"use client"

import { useSimulationStore } from "@/store/simulation-store"
import { ElevatorShaft } from "./elevator-shaft"
import { Card } from "./ui/card"

export function BuildingVisualization() {
  const { elevators, config } = useSimulationStore()

  return (
    <Card className="p-6 h-full overflow-auto">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Building Visualization</h2>

        <div className="flex gap-8 items-end justify-center">
          {/* Floor labels */}
          <div className="flex flex-col-reverse gap-0">
            {Array.from({ length: config.floors }).map((_, i) => (
              <div key={i} className="h-10 flex items-center justify-end pr-2 text-xs font-mono text-muted-foreground">
                {i}
              </div>
            ))}
          </div>

          {/* Elevator shafts */}
          {elevators.map((elevator, idx) => (
            <ElevatorShaft key={elevator.id} elevator={elevator} floors={config.floors} shaftIndex={idx} />
          ))}
        </div>
      </div>
    </Card>
  )
}
