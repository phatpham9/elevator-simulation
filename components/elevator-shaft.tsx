"use client"

import type { Elevator } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface ElevatorShaftProps {
  elevator: Elevator
  floors: number
  shaftIndex: number
}

export function ElevatorShaft({ elevator, floors, shaftIndex }: ElevatorShaftProps) {
  const floorHeight = 40
  const totalHeight = floors * floorHeight

  // Calculate position (inverted: floor 0 at bottom)
  const positionPercent = (elevator.currentFloor / (floors - 1)) * 100
  const bottomPosition = positionPercent

  const getDirectionIcon = () => {
    if (elevator.targetDirection === "up") return <ArrowUp className="h-3 w-3" />
    if (elevator.targetDirection === "down") return <ArrowDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getDoorColor = () => {
    if (elevator.doorState === "open") return "bg-green-500"
    if (elevator.doorState === "opening" || elevator.doorState === "closing") return "bg-yellow-500"
    return "bg-muted"
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Shaft */}
      <div className="relative w-16 bg-secondary border-x border-border" style={{ height: `${totalHeight}px` }}>
        {/* Floor markers */}
        {Array.from({ length: floors }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-border/30"
            style={{ bottom: `${(i / (floors - 1)) * 100}%` }}
          />
        ))}

        {/* Queue indicators */}
        {elevator.queue.map((floor, idx) => (
          <div
            key={`${floor}-${idx}`}
            className="absolute left-0 w-1 h-1 bg-primary rounded-full"
            style={{ bottom: `${(floor / (floors - 1)) * 100}%` }}
          />
        ))}

        {/* Elevator cabin */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-14 h-8 rounded transition-all duration-200",
            "bg-card border-2 border-primary flex flex-col items-center justify-center gap-0.5 p-1",
          )}
          style={{
            bottom: `calc(${bottomPosition}% - 16px)`,
          }}
        >
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {getDirectionIcon()}
            <span>{Math.round(elevator.currentFloor)}</span>
          </div>
          <div className={cn("w-8 h-1 rounded-full", getDoorColor())} />
          <div className="text-[8px] text-muted-foreground">
            {elevator.load}/{elevator.capacity}
          </div>
        </div>
      </div>

      {/* Elevator ID */}
      <div className="mt-2 text-xs font-mono text-muted-foreground">{elevator.id}</div>
    </div>
  )
}
