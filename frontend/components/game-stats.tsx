"use client"

interface GameStatsProps {
  userStats?: {
    totalStrategies: number
    bestReturn: number
    totalExecutions: number
    winRate: number
  }
}

export default function GameStats({ userStats }: GameStatsProps) {
  const stats = userStats || {
    totalStrategies: 12,
    bestReturn: 87.5,
    totalExecutions: 34,
    winRate: 68,
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Total Strategies</p>
        <p className="text-3xl font-bold text-primary">{stats.totalStrategies}</p>
        <p className="text-xs text-muted-foreground mt-2">Created</p>
      </div>

      <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Best Return</p>
        <p className="text-3xl font-bold text-accent">+{stats.bestReturn}%</p>
        <p className="text-xs text-muted-foreground mt-2">Personal Record</p>
      </div>

      <div className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Total Executions</p>
        <p className="text-3xl font-bold text-secondary">{stats.totalExecutions}</p>
        <p className="text-xs text-muted-foreground mt-2">Strategies Run</p>
      </div>

      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
        <p className="text-3xl font-bold text-green-400">{stats.winRate}%</p>
        <p className="text-xs text-muted-foreground mt-2">Success Rate</p>
      </div>
    </div>
  )
}
