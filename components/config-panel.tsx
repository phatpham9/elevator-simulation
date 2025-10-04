"use client"

import { useSimulationStore } from "@/store/simulation-store"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { DEFAULT_CONFIG, UP_PEAK_CONFIG, DOWN_PEAK_CONFIG, INTERFLOOR_CONFIG } from "@/lib/presets"

export function ConfigPanel() {
  const { config, setConfig, reset } = useSimulationStore()

  const handlePreset = (preset: typeof DEFAULT_CONFIG) => {
    setConfig(preset)
    reset()
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Configuration</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => handlePreset(DEFAULT_CONFIG)}>
              Default
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset(UP_PEAK_CONFIG)}>
              Up-Peak
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset(DOWN_PEAK_CONFIG)}>
              Down-Peak
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset(INTERFLOOR_CONFIG)}>
              Inter-Floor
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="capacity" className="text-xs">
              Capacity per Elevator
            </Label>
            <Input
              id="capacity"
              type="number"
              value={config.capacityPerElevator}
              onChange={(e) => setConfig({ capacityPerElevator: Number.parseInt(e.target.value) || 12 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="speed" className="text-xs">
              Speed (floors/sec)
            </Label>
            <Input
              id="speed"
              type="number"
              step="0.1"
              value={config.speedFloorsPerSec}
              onChange={(e) => setConfig({ speedFloorsPerSec: Number.parseFloat(e.target.value) || 1.5 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="doorTime" className="text-xs">
              Door Open/Close (ms)
            </Label>
            <Input
              id="doorTime"
              type="number"
              value={config.doorOpenCloseMs}
              onChange={(e) => setConfig({ doorOpenCloseMs: Number.parseInt(e.target.value) || 1000 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="batchWindow" className="text-xs">
              Batch Window (ms)
            </Label>
            <Input
              id="batchWindow"
              type="number"
              value={config.batchWindowMs}
              onChange={(e) => setConfig({ batchWindowMs: Number.parseInt(e.target.value) || 1500 })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="seed" className="text-xs">
              Random Seed
            </Label>
            <Input
              id="seed"
              type="number"
              value={config.randomSeed}
              onChange={(e) => setConfig({ randomSeed: Number.parseInt(e.target.value) || 42 })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
