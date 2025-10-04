"use client"

import { useState } from "react"
import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import type { SimEvent } from "@/lib/types"

export function EventLog() {
  const { events } = useSimulationStore()
  const [filter, setFilter] = useState<SimEvent["type"] | "All">("All")

  const filteredEvents = filter === "All" ? events : events.filter((e) => e.type === filter)

  const recentEvents = filteredEvents.slice(-50).reverse()

  const eventTypes: Array<SimEvent["type"] | "All"> = [
    "All",
    "Arrival",
    "Assign",
    "DoorOpen",
    "DoorClose",
    "Pickup",
    "Dropoff",
  ]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Event Log</h3>

      <div className="flex gap-1 mb-3 flex-wrap">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 py-1 text-xs rounded ${
              filter === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {recentEvents.map((event) => (
          <div key={event.id} className="text-xs p-2 bg-secondary rounded flex items-start gap-2">
            <Badge variant="outline" className="text-[10px] shrink-0">
              {event.type}
            </Badge>
            <span className="text-muted-foreground font-mono shrink-0">{(event.timestamp / 1000).toFixed(1)}s</span>
            <span className="text-foreground line-clamp-2">{event.details}</span>
          </div>
        ))}

        {recentEvents.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8">No events yet</div>
        )}
      </div>
    </Card>
  )
}
