"use client"

import type React from "react"
import { useState } from "react"
import SpellCard from "./spell-card"
import CauldronVisualization from "./cauldron-visualization"

interface Spell {
  id: string
  name: string
  icon: string
  inputs: Array<{ id: string; label: string; type: string; placeholder: string }>
}

interface ChainSpell {
  id: string
  name: string
  icon: string
  instanceId: number
  inputs: Array<{ id: string; label: string; type: string; placeholder: string }>
  config: Record<string, string>
}

interface ChainBuilderProps {
  spellChain: ChainSpell[]
  setSpellChain: (chain: ChainSpell[]) => void
}

const SPELL_MAP: Record<string, Spell> = {
  swap: {
    id: "swap",
    name: "Swap Crystal",
    icon: "💧",
    inputs: [
      { id: "from", label: "From Token", type: "text", placeholder: "ETH" },
      { id: "to", label: "To Token", type: "text", placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  bridge: {
    id: "bridge",
    name: "Bridge Scroll",
    icon: "🪶",
    inputs: [
      { id: "fromChain", label: "From Chain", type: "text", placeholder: "Ethereum" },
      { id: "toChain", label: "To Chain", type: "text", placeholder: "Arbitrum" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  stake: {
    id: "stake",
    name: "Borrow Totem",
    icon: "🔮",
    inputs: [
      { id: "token", label: "Token", type: "text", placeholder: "ETH" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
      { id: "duration", label: "Duration (days)", type: "number", placeholder: "30" },
    ],
  },
  lend: {
    id: "lend",
    name: "Lend Rune",
    icon: "🏦",
    inputs: [
      { id: "token", label: "Token", type: "text", placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1000" },
      { id: "protocol", label: "Protocol", type: "text", placeholder: "Aave" },
    ],
  },
  farm: {
    id: "farm",
    name: "Farm",
    icon: "🌾",
    inputs: [
      { id: "pair", label: "LP Pair", type: "text", placeholder: "ETH/USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
  mint: {
    id: "mint",
    name: "Mint",
    icon: "✨",
    inputs: [
      { id: "asset", label: "Asset", type: "text", placeholder: "stETH" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1.0" },
    ],
  },
}

export default function ChainBuilder({ spellChain, setSpellChain }: ChainBuilderProps) {
  const [isBrewing, setIsBrewing] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const spellId = e.dataTransfer.getData("text/plain")

    if (spellId && SPELL_MAP[spellId]) {
      const spell = SPELL_MAP[spellId]
      setSpellChain([
        ...spellChain,
        {
          ...spell,
          instanceId: Date.now(),
          config: {},
        },
      ])
    }
  }

  const removeSpell = (instanceId: number) => {
    setSpellChain(spellChain.filter((s) => s.instanceId !== instanceId))
  }

  const updateSpellConfig = (instanceId: number, config: Record<string, string>) => {
    setSpellChain(spellChain.map((s) => (s.instanceId === instanceId ? { ...s, config } : s)))
  }

  const handleBrew = () => {
    setIsBrewing(true)
    setShowVisualization(true)
    setTimeout(() => setIsBrewing(false), 3000)
  }

  return (
    <div className="flex-1 bg-gradient-card border-2 border-accent/40 rounded-xl p-8 overflow-y-auto flex flex-col backdrop-blur-md arcane-glow">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent uppercase tracking-wider">
          Cauldron
        </h2>
        <span className="text-3xl float-drift">⚗️</span>
      </div>

      {showVisualization ? (
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <CauldronVisualization spellCount={spellChain.length} isBrewingActive={isBrewing} />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 bg-gradient-to-b from-primary/10 to-secondary/5 border-3 border-dashed border-accent/50 rounded-xl p-8 flex flex-col mb-8 hover:border-accent/80 hover:bg-primary/15 transition-all duration-300"
        >
          {spellChain.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="space-y-4">
                <p className="text-7xl float-drift">🧪</p>
                <p className="text-xl font-bold text-foreground">Drag spells to brew your strategy</p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Build your DeFi alchemy</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {spellChain.map((spell, index) => (
                <div key={spell.instanceId}>
                  <SpellCard
                    id={spell.id}
                    name={spell.name}
                    icon={spell.icon}
                    instanceId={spell.instanceId}
                    inputs={spell.inputs}
                    onRemove={removeSpell}
                    onUpdate={updateSpellConfig}
                  />

                  {index < spellChain.length - 1 && (
                    <div className="flex justify-center py-4">
                      <div className="text-accent text-3xl rune-pulse">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleBrew}
          disabled={spellChain.length === 0 || isBrewing}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-accent via-secondary to-accent text-accent-foreground rounded-lg hover:shadow-2xl hover:shadow-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-black uppercase text-sm tracking-widest glow-pulse"
        >
          {isBrewing ? "⚗️ Brewing..." : "⚗️ Brew Potion"}
        </button>
        <button
          onClick={() => {
            setSpellChain([])
            setShowVisualization(false)
          }}
          className="px-6 py-4 bg-gradient-card border-2 border-primary/60 rounded-lg hover:border-accent/80 hover:bg-primary/20 transition-all duration-300 font-bold uppercase text-sm tracking-wider"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
