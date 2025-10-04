"use client"

import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Badge } from "./ui/badge"

export function SimulationControls() {
  const { isRunning, start, pause, reset, speed, setSpeed, simTime } = useSimulationStore()

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours.toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Simulation Controls</h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={start} size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={pause} size="sm" variant="secondary" className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button onClick={reset} size="sm" variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Speed:</span>
            <div className="flex gap-1">
              {[1, 2, 5].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={speed === s ? "default" : "outline"}
                  onClick={() => setSpeed(s)}
                  className="h-7 w-10 text-xs"
                >
                  {s}×
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sim Time:</span>
            <Badge variant="outline" className="font-mono">
              {formatTime(simTime)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
