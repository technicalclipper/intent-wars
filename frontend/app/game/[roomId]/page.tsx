"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import SpellLibrary from "@/components/spell-library"
import ChainBuilder from "@/components/chain-builder"
import ResultsPanel from "@/components/results-panel"
import Leaderboard from "@/components/leaderboard"
import GameStats from "@/components/game-stats"
import { useAccount } from "wagmi"

export default function PvPGamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { address } = useAccount()
  const roomId = params.roomId as string
  const isWaiting = searchParams.get('waiting') === 'true'
  
  const [activeTab, setActiveTab] = useState<"builder" | "leaderboard">("builder")
  const [spellChain, setSpellChain] = useState<any[]>([])
  const [roomData, setRoomData] = useState<any>(null)
  const [taskPopup, setTaskPopup] = useState(true)
  const [gameResults, setGameResults] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Task configuration
  const task = {
    title: "Yield Maximization Challenge",
    description: "You have USDC and ETH on Sepolia. Use 1 USDC or equivalent ETH to maximize yield on Arbitrum.",
    requirements: [
      "Bridge assets to Arbitrum",
      "Optimize for maximum yield",
      "Minimize gas usage",
      "Complete within time limit"
    ]
  }

  // Poll for room updates
  useEffect(() => {
    if (roomId && !gameResults) {
      const pollRoom = async () => {
        try {
          const response = await fetch(`/api/rooms?roomId=${roomId}`)
          const data = await response.json()
          setRoomData(data)
          
          // Check if game is completed
          if (data.status === 'completed' && data.results) {
            setGameResults(data.results)
            setIsPolling(false)
          }
          
          // If room is now active (opponent joined), stop waiting
          if (data.status === 'active' && isWaiting) {
            setIsPolling(false)
          }
        } catch (error) {
          console.error('Error polling room:', error)
        }
      }

      // Initial poll
      pollRoom()
      
      // Poll every 2 seconds if waiting for opponent or results
      if (isWaiting || (roomData && (roomData.status === 'active' || roomData.status === 'waiting'))) {
        setIsPolling(true)
        const interval = setInterval(pollRoom, 2000)
        return () => clearInterval(interval)
      }
    }
  }, [roomId, isWaiting, gameResults, roomData])

  const handleSubmitResults = async (manaUsed: number, duration: number) => {
    if (!address) return

    console.log('Submitting results with wallet:', address)
    console.log('Room ID:', roomId)
    console.log('Mana used:', manaUsed)
    console.log('Duration:', duration)

    try {
      const response = await fetch('/api/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          walletId: address,
          totalManaUsed: manaUsed,
          duration
        }),
      })

      const data = await response.json()
      
      if (data.status === 'completed') {
        setGameResults(data.results)
      } else {
        // Waiting for opponent
        setIsPolling(true)
      }
    } catch (error) {
      console.error('Error submitting results:', error)
      alert('Failed to submit results. Please try again.')
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Task Popup */}
        {taskPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-card border border-primary/40 rounded-xl p-8 w-full max-w-2xl mx-4 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{task.title}</h3>
                <p className="text-sm text-muted-foreground">PvP Challenge</p>
              </div>

              <div className="mb-6 p-4 bg-accent/10 border border-accent/40 rounded-lg">
                <h4 className="font-bold text-accent mb-3">Challenge Description</h4>
                <p className="text-sm text-foreground mb-4">{task.description}</p>
                
                <h5 className="font-bold text-foreground mb-2">Requirements:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTaskPopup(false)}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 transition-colors"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Results Popup */}
        {gameResults && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-card border border-primary/40 rounded-xl p-8 w-full max-w-2xl mx-4 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {gameResults.winner.winner === 'tie' ? "It's a Tie!" : 
                   gameResults.winner.winner === 'player1' ? "Player 1 Wins!" : "Player 2 Wins!"}
                </h3>
                <p className="text-sm text-muted-foreground">Battle Results</p>
              </div>

              <div className="mb-6 space-y-4">
                <div className="p-4 bg-accent/10 border border-accent/40 rounded-lg">
                  <h4 className="font-bold text-accent mb-3">Player 1 Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mana Used:</span>
                      <span className="font-medium ml-2">{gameResults.player1.totalManaUsed.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium ml-2">{gameResults.player1.duration}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-medium ml-2">{gameResults.winner.player1Score.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/10 border border-secondary/40 rounded-lg">
                  <h4 className="font-bold text-secondary mb-3">Player 2 Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mana Used:</span>
                      <span className="font-medium ml-2">{gameResults.player2.totalManaUsed.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium ml-2">{gameResults.player2.duration}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-medium ml-2">{gameResults.winner.player2Score.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 transition-colors"
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Waiting for Opponent */}
        {isWaiting && roomData?.status === 'waiting' && !gameResults && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-card border border-primary/40 rounded-xl p-8 w-full max-w-md mx-4 shadow-lg text-center">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Waiting for Opponent</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Looking for another player to join your match...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden">
          {activeTab === "builder" ? (
            <div className="flex h-full gap-4 p-4">
              <SpellLibrary />
              <ChainBuilder 
                spellChain={spellChain} 
                setSpellChain={setSpellChain}
                onGameComplete={handleSubmitResults}
                isPvPMode={true}
              />
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
