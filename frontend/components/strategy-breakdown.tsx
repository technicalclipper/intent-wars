"use client"

interface ChainSpell {
  id: string
  name: string
  icon: string
  instanceId: number
  config: Record<string, string>
}

interface StrategyBreakdownProps {
  spellChain: ChainSpell[]
}

export default function StrategyBreakdown({ spellChain }: StrategyBreakdownProps) {
  const getRiskScore = (spellId: string): number => {
    const riskMap: Record<string, number> = {
      swap: 2,
      bridge: 3,
      stake: 2,
      lend: 2,
      farm: 4,
      mint: 5,
    }
    return riskMap[spellId] || 2
  }

  const totalRisk = spellChain.reduce((sum, spell) => sum + getRiskScore(spell.id), 0)
  const maxRisk = spellChain.length * 5
  const riskPercentage = (totalRisk / maxRisk) * 100

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground">Risk Distribution</p>
          <p className="text-xs text-foreground">{Math.round(riskPercentage)}%</p>
        </div>
        <div className="w-full h-2 bg-card/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${riskPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Spell Breakdown</p>
        {spellChain.map((spell, index) => (
          <div key={spell.instanceId} className="flex items-center gap-2 p-2 bg-card/30 rounded">
            <span className="text-lg">{spell.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{spell.name}</p>
              <p className="text-xs text-muted-foreground">Step {index + 1}</p>
            </div>
            <div className="text-xs font-semibold text-primary">{getRiskScore(spell.id)}/5</div>
          </div>
        ))}
      </div>
    </div>
  )
}
