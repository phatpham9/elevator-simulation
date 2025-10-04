"use client"

import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export function ElevatorControls() {
  const { elevators, toggleDoor } = useSimulationStore()

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Elevator Cabins</h3>

      <div className="space-y-3">
        {elevators.map((elevator) => (
          <div key={elevator.id} className="p-3 bg-secondary rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{elevator.id}</span>
              <Badge variant="outline" className="font-mono text-xs">
                Floor {Math.round(elevator.currentFloor)}
              </Badge>
            </div>

            <div className="flex gap-2 text-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleDoor(elevator.id)}
                disabled={elevator.doorState === "opening" || elevator.doorState === "closing"}
                className="flex-1"
              >
                {elevator.doorState === "open" ? "Close" : "Open"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Load:</span>
                <span className="font-mono">
                  {elevator.load}/{elevator.capacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Queue:</span>
                <span className="font-mono">{elevator.queue.join(", ") || "Empty"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
