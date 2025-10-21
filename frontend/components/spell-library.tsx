"use client"

import type React from "react"
import { useState } from "react"

const SPELLS = [
  {
    id: "bridge",
    name: "Bridge Scroll",
    icon: "🪶",
    description: "Cross-chain transfer",
    inputs: [
      { id: "fromChain", label: "From Chain", type: "text", placeholder: "Ethereum" },
      { id: "toChain", label: "To Chain", type: "text", placeholder: "Arbitrum" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  {
    id: "swap",
    name: "Swap Crystal",
    icon: "💧",
    description: "Exchange tokens",
    inputs: [
      { id: "from", label: "From Token", type: "text", placeholder: "ETH" },
      { id: "to", label: "To Token", type: "text", placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  {
    id: "lend",
    name: "Lend Rune",
    icon: "🏦",
    description: "Provide liquidity",
    inputs: [
      { id: "token", label: "Token", type: "text", placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1000" },
      { id: "protocol", label: "Protocol", type: "text", placeholder: "Aave" },
    ],
  },
  {
    id: "stake",
    name: "Borrow Totem",
    icon: "🔮",
    description: "Earn yield",
    inputs: [
      { id: "token", label: "Token", type: "text", placeholder: "ETH" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
      { id: "duration", label: "Duration (days)", type: "number", placeholder: "30" },
    ],
  },
  {
    id: "farm",
    name: "Farm",
    icon: "🌾",
    description: "Yield farming",
    inputs: [
      { id: "pair", label: "LP Pair", type: "text", placeholder: "ETH/USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  {
    id: "mint",
    name: "Mint",
    icon: "✨",
    description: "Create assets",
    inputs: [
      { id: "asset", label: "Asset", type: "text", placeholder: "stETH" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
]

export default function SpellLibrary() {
  const [draggedSpell, setDraggedSpell] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, spellId: string) => {
    setDraggedSpell(spellId)
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("text/plain", spellId)
  }

  return (
    <div className="w-72 bg-gradient-card border-2 border-accent/40 rounded-xl p-6 overflow-y-auto backdrop-blur-md arcane-glow">
      <div className="mb-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent mb-1">
          Grimoire of Spells
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Enchanted Artifacts</p>
      </div>

      <div className="space-y-3">
        {SPELLS.map((spell) => (
          <div
            key={spell.id}
            draggable
            onDragStart={(e) => handleDragStart(e, spell.id)}
            className="group p-4 bg-gradient-to-br from-primary/20 to-secondary/10 border-2 border-primary/40 rounded-lg cursor-move hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:scale-105 transform"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl group-hover:float-drift transition-all">{spell.icon}</span>
              <span className="font-bold text-foreground text-sm uppercase tracking-wider">{spell.name}</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">{spell.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-accent/20 to-secondary/20 border-2 border-accent/40 rounded-lg">
        <p className="text-xs text-muted-foreground leading-relaxed">
          ✨ Drag enchanted artifacts to the cauldron to weave your DeFi strategy
        </p>
      </div>
    </div>
  )
}
