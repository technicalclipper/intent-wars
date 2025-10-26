"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Header from "@/components/header"
import { useAccount } from "wagmi"

export default function Home() {
  const router = useRouter()
  const { address } = useAccount()
  const [isFindingMatch, setIsFindingMatch] = useState(false)

  const handleFindMatch = async () => {
    if (!address) {
      alert('Please connect your wallet first!')
      return
    }

    setIsFindingMatch(true)
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId: address }),
      })
      
      const data = await response.json()
      
      if (data.status === 'matched') {
        // Both players matched, go to game
        router.push(`/game/${data.roomId}`)
      } else if (data.status === 'waiting') {
        // Waiting for opponent
        router.push(`/game/${data.roomId}?waiting=true`)
      }
    } catch (error) {
      console.error('Error finding match:', error)
      alert('Failed to find match. Please try again.')
    } finally {
      setIsFindingMatch(false)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-8xl font-black bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent uppercase tracking-wider animate-pulse-glow">
                Intent-Wars
              </h1>
              <p className="text-2xl text-muted-foreground font-bold uppercase tracking-widest">
                DeFi Strategy Battles
              </p>
            </div>

            {/* Find Match Button */}
            <div className="pt-8 flex items-center justify-center gap-16">
              {/* Cauldron Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/cauldron.png" 
                  alt="Cauldron" 
                  className="w-48 h-60 opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              
              {/* Find Match Button */}
              <button
                onClick={handleFindMatch}
                disabled={isFindingMatch}
                className="px-12 py-6 bg-gradient-to-r from-accent via-secondary to-accent text-accent-foreground rounded-xl hover:shadow-2xl hover:shadow-accent/50 transition-all duration-300 font-black uppercase text-xl tracking-widest glow-pulse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFindingMatch ? '🔍 Finding Match...' : '⚔️ Find Match PvP'}
              </button>
            </div>

            {/* Subtitle */}
            <div className="pt-8">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master the art of DeFi alchemy. Build spell chains, execute cross-chain strategies, 
                and battle other wizards in the ultimate blockchain strategy game.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
