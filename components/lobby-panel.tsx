"use client"

import { useState } from "react"
import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"

export function LobbyPanel() {
  const { lobbies, config, addManualRequest } = useSimulationStore()
  const [selectedFloor, setSelectedFloor] = useState(0)
  const [destination, setDestination] = useState("")

  const handleCall = () => {
    const dest = Number.parseInt(destination)
    if (!isNaN(dest) && dest >= 0 && dest < config.floors && dest !== selectedFloor) {
      addManualRequest(selectedFloor, dest)
      setDestination("")
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Lobby Controls</h3>

      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(Number.parseInt(e.target.value))}
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {Array.from({ length: config.floors }).map((_, i) => (
              <option key={i} value={i}>
                Floor {i}
              </option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Dest"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-20"
            min={0}
            max={config.floors - 1}
          />

          <Button onClick={handleCall} size="sm">
            Call
          </Button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {lobbies.map(
            (lobby) =>
              lobby.pendingRequests.length > 0 && (
                <div key={lobby.floor} className="flex items-center justify-between text-xs p-2 bg-secondary rounded">
                  <span className="font-mono">Floor {lobby.floor}</span>
                  <Badge variant="outline">{lobby.pendingRequests.length} waiting</Badge>
                </div>
              ),
          )}
        </div>
      </div>
    </Card>
  )
}
