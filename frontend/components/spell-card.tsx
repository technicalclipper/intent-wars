"use client"

import { useState } from "react"

interface SpellInput {
  id: string
  label: string
  type: string
  placeholder: string
}

interface SpellCardProps {
  id: string
  name: string
  icon: string
  instanceId: number
  inputs: SpellInput[]
  onRemove: (instanceId: number) => void
  onUpdate: (instanceId: number, config: Record<string, string>) => void
}

export default function SpellCard({ id, name, icon, instanceId, inputs, onRemove, onUpdate }: SpellCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})

  const handleInputChange = (inputId: string, value: string) => {
    const newConfig = { ...config, [inputId]: value }
    setConfig(newConfig)
    onUpdate(instanceId, newConfig)
  }

  const spellColors: Record<string, { glow: string; border: string }> = {
    bridge: { glow: "from-purple-500/40 to-pink-500/40", border: "border-purple-500/60" },
    swap: { glow: "from-cyan-500/40 to-blue-500/40", border: "border-cyan-500/60" },
    lend: { glow: "from-yellow-500/40 to-orange-500/40", border: "border-yellow-500/60" },
    stake: { glow: "from-green-500/40 to-emerald-500/40", border: "border-green-500/60" },
    farm: { glow: "from-amber-500/40 to-yellow-500/40", border: "border-amber-500/60" },
    mint: { glow: "from-indigo-500/40 to-purple-500/40", border: "border-indigo-500/60" },
  }

  const colors = spellColors[id] || spellColors.bridge

  return (
    <div className="group relative">
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${colors.glow} rounded-xl opacity-0 group-hover:opacity-60 blur-lg transition duration-500`}
      />

      <div
        className={`relative bg-gradient-card border-2 ${colors.border} rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300 backdrop-blur-md`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl filter drop-shadow-lg float-drift">{icon}</div>
            <div className="text-left">
              <p className="font-bold text-lg text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Configure spell</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-accent text-xl transition-transform duration-300 rune-pulse">
              {isExpanded ? "▼" : "▶"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(instanceId)
              }}
              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs bg-destructive/30 text-destructive rounded-lg hover:bg-destructive/50 transition-all font-bold uppercase tracking-wider"
            >
              Remove
            </button>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-accent/30 p-5 bg-gradient-to-b from-primary/20 to-secondary/10 space-y-4">
            {inputs.map((input) => (
              <div key={input.id}>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider rune-pulse">
                  {input.label}
                </label>
                <input
                  type={input.type}
                  placeholder={input.placeholder}
                  value={config[input.id] || ""}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border-2 border-primary/40 rounded-lg text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-accent/80 focus:ring-2 focus:ring-accent/30 transition-all font-semibold arcane-glow"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
