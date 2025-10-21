"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import SpellLibrary from "@/components/spell-library"
import ChainBuilder from "@/components/chain-builder"
import ResultsPanel from "@/components/results-panel"
import Leaderboard from "@/components/leaderboard"
import GameStats from "@/components/game-stats"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"builder" | "leaderboard">("builder")
  const [spellChain, setSpellChain] = useState<any[]>([])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-hidden">
          {activeTab === "builder" ? (
            <div className="flex h-full gap-4 p-4">
              <SpellLibrary />
              <ChainBuilder spellChain={spellChain} setSpellChain={setSpellChain} />
              <ResultsPanel spellChain={spellChain} />
            </div>
          ) : (
            <div className="overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto space-y-8">
                <GameStats />
                <Leaderboard />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
