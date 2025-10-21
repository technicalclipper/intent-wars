"use client"

import { useState } from "react"

interface LeaderboardEntry {
  rank: number
  username: string
  strategy: string
  return: number
  risk: string
  executions: number
  avatar: string
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    username: "AlchemyMaster",
    strategy: "Swap → Stake → Farm",
    return: 156.8,
    risk: "High",
    executions: 42,
    avatar: "🧙",
  },
  {
    rank: 2,
    username: "ChainWizard",
    strategy: "Bridge → Lend → Mint",
    return: 142.3,
    risk: "Medium",
    executions: 38,
    avatar: "🔮",
  },
  {
    rank: 3,
    username: "DeFiNinja",
    strategy: "Swap → Bridge → Stake",
    return: 128.5,
    risk: "Medium",
    executions: 35,
    avatar: "🥷",
  },
  {
    rank: 4,
    username: "LiquidityLord",
    strategy: "Lend → Farm → Mint",
    return: 115.2,
    risk: "High",
    executions: 31,
    avatar: "👑",
  },
  {
    rank: 5,
    username: "TokenTrader",
    strategy: "Swap → Swap → Stake",
    return: 98.7,
    risk: "Low",
    executions: 28,
    avatar: "💰",
  },
  {
    rank: 6,
    username: "VaultVoyager",
    strategy: "Stake → Lend → Farm",
    return: 87.3,
    risk: "Medium",
    executions: 25,
    avatar: "🚀",
  },
  {
    rank: 7,
    username: "ProtocolPro",
    strategy: "Bridge → Mint → Stake",
    return: 76.5,
    risk: "High",
    executions: 22,
    avatar: "⚙️",
  },
  {
    rank: 8,
    username: "YieldYeti",
    strategy: "Farm → Lend → Swap",
    return: 65.2,
    risk: "Medium",
    executions: 19,
    avatar: "🐻",
  },
]

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<"return" | "executions">("return")

  const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => {
    if (sortBy === "return") {
      return b.return - a.return
    }
    return b.executions - a.executions
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400"
      case "Medium":
        return "text-yellow-400"
      case "High":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">Top alchemists and their strategies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("return")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "return"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-card/80"
            }`}
          >
            By Return
          </button>
          <button
            onClick={() => setSortBy("executions")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "executions"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-card/80"
            }`}
          >
            By Executions
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedLeaderboard.map((entry, index) => (
          <div
            key={entry.rank}
            className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/30">
                <span className="text-2xl font-bold text-primary">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${entry.rank}`}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{entry.avatar}</span>
                  <p className="font-semibold text-foreground">{entry.username}</p>
                </div>
                <p className="text-sm text-muted-foreground">{entry.strategy}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Return</p>
                  <p className="text-lg font-bold text-primary">+{entry.return}%</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className={`font-semibold ${getRiskColor(entry.risk)}`}>{entry.risk}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Executions</p>
                  <p className="text-lg font-bold text-accent">{entry.executions}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Total Strategies</p>
          <p className="text-3xl font-bold text-primary">1,247</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Avg Return</p>
          <p className="text-3xl font-bold text-accent">+42.3%</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Active Players</p>
          <p className="text-3xl font-bold text-secondary">3,891</p>
        </div>
      </div>
    </div>
  )
}
