"use client"

import AnimatedMetric from "./animated-metric"
import StrategyBreakdown from "./strategy-breakdown"

interface ChainSpell {
  id: string
  name: string
  icon: string
  instanceId: number
  config: Record<string, string>
}

interface ResultsPanelProps {
  spellChain: ChainSpell[]
}

export default function ResultsPanel({ spellChain }: ResultsPanelProps) {
  const calculateMetrics = () => {
    if (spellChain.length === 0) return null

    const baseReturn = 5 * spellChain.length
    const riskMultiplier = spellChain.length > 3 ? 1.5 : 1
    const expectedReturn = baseReturn * riskMultiplier

    return {
      expectedReturn: expectedReturn.toFixed(1),
      riskLevel: spellChain.length > 3 ? "High" : spellChain.length > 1 ? "Medium" : "Low",
      gasEstimate: (0.015 * spellChain.length).toFixed(3),
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="w-80 bg-gradient-card border-2 border-accent/40 rounded-xl p-6 overflow-y-auto flex flex-col backdrop-blur-md arcane-glow">
      <div className="mb-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent uppercase tracking-wider">
          Potion Results
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Arcane Efficiency</p>
      </div>

      <div className="flex-1 space-y-4">
        {spellChain.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-5xl mb-3 float-drift">🧴</p>
              <p className="text-foreground font-bold">Build a strategy to see results</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">Brew your first potion</p>
            </div>
          </div>
        ) : (
          <>
            <AnimatedMetric value={`+${metrics?.expectedReturn}%`} label="Essence Return" icon="💰" color="primary" />

            <AnimatedMetric value={metrics?.riskLevel || "—"} label="Risk Level" icon="⚡" color="accent" />

            <AnimatedMetric value={`${metrics?.gasEstimate} ETH`} label="Gas Energy" icon="⛽" color="secondary" />

            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/10 border-2 border-accent/40 rounded-lg">
              <StrategyBreakdown spellChain={spellChain} />
            </div>
          </>
        )}
      </div>

      <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-accent via-secondary to-accent text-accent-foreground rounded-lg hover:shadow-lg hover:shadow-accent/40 transition-all duration-300 font-bold uppercase text-sm tracking-wider glow-pulse">
        Execute Strategy
      </button>
    </div>
  )
}
