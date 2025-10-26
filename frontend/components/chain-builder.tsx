"use client"

import type React from "react"
import { useState, useRef } from "react"
import SpellCard from "./spell-card"
import CauldronVisualization from "./cauldron-visualization"
import { BridgeSpell } from "./bridge-spell"
import { SwapSpell } from "./swap-spell"
import { LendSpell } from "./lend-spell"
import { useNexus } from '@avail-project/nexus-widgets'
import type { BridgeParams, BridgeResult, SimulationResult } from '@avail-project/nexus-core'
import { parseUnits } from 'viem'

interface Spell {
  id: string
  name: string
  icon: string
  inputs: Array<{ id: string; label: string; type: string; placeholder: string; options?: string[] }>
}

interface ChainSpell {
  id: string
  name: string
  icon: string
  instanceId: number
  inputs: Array<{ id: string; label: string; type: string; placeholder: string; options?: string[] }>
  config: Record<string, string>
}

interface ChainBuilderProps {
  spellChain: ChainSpell[]
  setSpellChain: (chain: ChainSpell[]) => void
  onGameComplete?: (manaUsed: number, duration: number) => void
  isPvPMode?: boolean
}

const SPELL_MAP: Record<string, Spell> = {
  swap: {
    id: "swap",
    name: "Swap Crystal",
    icon: "💧",
    inputs: [
      { id: "chainId", label: "Chain", type: "select", options: ["Sepolia (11155111)", "Arbitrum Sepolia (421614)", "Polygon Amoy (80002)", "Optimism Sepolia (11155420)", "Base Sepolia (84532)", "Monad Testnet (1014)"], placeholder: "Sepolia (11155111)" },
      { id: "fromToken", label: "From Token", type: "select", options: ["ETH", "USDC"], placeholder: "ETH" },
      { id: "toToken", label: "To Token", type: "select", options: ["ETH", "USDC"], placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1" },
    ],
  },
  bridge: {
    id: "bridge",
    name: "Bridge Scroll",
    icon: "🪶",
    inputs: [
      { id: "chainId", label: "To Chain", type: "select", options: ["Sepolia (11155111)", "Arbitrum Sepolia (421614)", "Polygon Amoy (80002)", "Optimism Sepolia (11155420)", "Base Sepolia (84532)", "Monad Testnet (1014)"], placeholder: "Arbitrum Sepolia (421614)" },
      { id: "token", label: "Token", type: "select", options: ["ETH", "USDC", "MATIC", "MON"], placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "1" },
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
      { id: "chainId", label: "Chain", type: "select", options: ["Sepolia (11155111)", "Arbitrum Sepolia (421614)", "Polygon Amoy (80002)", "Optimism Sepolia (11155420)", "Base Sepolia (84532)", "Monad Testnet (1014)"], placeholder: "Sepolia (11155111)" },
      { id: "token", label: "Token", type: "select", options: ["USDC", "ETH", "MATIC"], placeholder: "USDC" },
      { id: "amount", label: "Amount", type: "number", placeholder: "100" },
      { id: "protocol", label: "Protocol", type: "select", options: ["Yearn", "Aave", "Compound"], placeholder: "Yearn" },
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

export default function ChainBuilder({ spellChain, setSpellChain, onGameComplete, isPvPMode = false }: ChainBuilderProps) {
  const [isBrewing, setIsBrewing] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [currentSpellIndex, setCurrentSpellIndex] = useState(-1)
  const { sdk } = useNexus()
  const [isBridgeExecuting, setIsBridgeExecuting] = useState(false)
  const [bridgePopup, setBridgePopup] = useState<{
    isOpen: boolean;
    bridgeDetails?: {
      token: string;
      amount: string;
      chainId: number;
      chainName: string;
    };
    bridgeResult?: {
      success: boolean;
      explorerUrl?: string;
    };
  }>({ isOpen: false })
  const [completionPopup, setCompletionPopup] = useState<{
    isOpen: boolean;
    stats?: {
      totalTime: number;
      spellCount: number;
      startTime: number;
      totalManaUsed: number;
    };
  }>({ isOpen: false })
  const [totalGasUsed, setTotalGasUsed] = useState(0)
  const totalGasRef = useRef(0)

  // Chain ID to name mapping
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      11155111: 'Sepolia',
      421614: 'Arbitrum Sepolia',
      80002: 'Polygon Amoy',
      11155420: 'Optimism Sepolia',
      84532: 'Base Sepolia',
      1014: 'Monad Testnet',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const spellId = e.dataTransfer.getData("text/plain")

    if (spellId && SPELL_MAP[spellId]) {
      const spell = SPELL_MAP[spellId]
      
      // Set default configuration based on spell type
      let defaultConfig = {}
      if (spellId === 'swap') {
        defaultConfig = {
          chainId: 'Sepolia (11155111)',
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '1'
        }
      } else if (spellId === 'bridge') {
        defaultConfig = {
          chainId: 'Arbitrum Sepolia (421614)',
          token: 'USDC',
          amount: '1'
        }
      } else if (spellId === 'lend') {
        defaultConfig = {
          chainId: 'Sepolia (11155111)',
          token: 'USDC',
          amount: '100',
          protocol: 'Yearn'
        }
      }
      
      setSpellChain([
        ...spellChain,
        {
          ...spell,
          instanceId: Date.now(),
          config: defaultConfig,
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

  const executeSpell = async (spell: ChainSpell) => {
    console.log(`Executing ${spell.name} with config:`, spell.config)
    
    if (spell.id === 'bridge') {
      // For bridge spells, execute the actual bridge transaction using SDK
      try {
        console.log('Executing bridge transaction...')
        
        // Extract chain ID from the config
        const chainIdMatch = spell.config.chainId?.match(/\((\d+)\)/)
        const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) : 421614
        
        // Set bridge execution state
        setIsBridgeExecuting(true)
        
        // Show bridge popup with details
        setBridgePopup({
          isOpen: true,
          bridgeDetails: {
            token: spell.config.token || 'USDC',
            amount: spell.config.amount || '1',
            chainId: chainId,
            chainName: getChainName(chainId)
          }
        })
        
        // Execute bridge using SDK directly
        if (sdk) {
          console.log('Executing bridge with config:', {
            token: spell.config.token || 'USDC',
            amount: parseFloat(spell.config.amount || '1'),
            chainId: chainId
          })
          
          const bridgeParams: BridgeParams = {
            token: spell.config.token || 'USDC',
            amount: parseFloat(spell.config.amount || '1'),
            chainId: chainId
          }
          
          console.log('Bridge parameters:', bridgeParams)
          
          // Execute the bridge and wait for completion
          const bridgeResult: BridgeResult = await sdk.bridge(bridgeParams)
          
          console.log('Bridge execution completed successfully!')
          console.log('Bridge result:', bridgeResult)
          
          // Update popup with result
          setBridgePopup(prev => ({
            ...prev,
            bridgeResult: {
              success: bridgeResult.success,
              explorerUrl: bridgeResult.explorerUrl
            }
          }))
          
        } else {
          console.log('SDK not available, simulating bridge execution')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Simulate successful result
          setBridgePopup(prev => ({
            ...prev,
            bridgeResult: {
              success: true,
              explorerUrl: 'https://explorer.nexus-folly.availproject.org/intent/1167'
            }
          }))
        }
        
        setIsBridgeExecuting(false)
        
      } catch (error) {
        console.error('Bridge execution failed:', error)
        setIsBridgeExecuting(false)
        throw error
      }
    } else if (spell.id === 'swap') {
      // For swap spells, use EXACT same logic as individual swap component
      try {
        console.log('Executing swap simulation with config:', spell.config)
        
        if (!sdk) {
          console.log('SDK not available, simulating swap execution')
          await new Promise(resolve => setTimeout(resolve, 2000))
          return
        }

        // EXACT same logic as swap component handleSimulation
        const CONTRACT_ADDRESSES: Record<string, string> = {
          '11155111': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Sepolia
          '421614': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Arbitrum Sepolia
          '80002': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Polygon Amoy
          '11155420': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Optimism Sepolia
          '84532': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Base Sepolia
          '1014': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Monad Testnet
        }

        // Extract chain ID exactly like swap component
        let chainIdStr: string
        if (typeof spell.config.chainId === 'string' && spell.config.chainId.includes('(')) {
          // Format: "Sepolia (11155111)" -> extract "11155111"
          const chainIdMatch = spell.config.chainId.match(/\((\d+)\)/)
          chainIdStr = chainIdMatch ? chainIdMatch[1] : '11155111'
        } else {
          // Format: "11155111" (raw chain ID)
          chainIdStr = spell.config.chainId || '11155111'
        }

        const contractAddress = CONTRACT_ADDRESSES[chainIdStr]
        const chainId = parseInt(chainIdStr)
        
        console.log('Swap execution - chainId:', chainId, 'chainIdStr:', chainIdStr, 'contractAddress:', contractAddress)

        // Determine which function to call based on swap direction - EXACT same logic
        const isETHToUSDC = spell.config.fromToken === 'ETH' && spell.config.toToken === 'USDC'
        const isUSDCToETH = spell.config.fromToken === 'USDC' && spell.config.toToken === 'ETH'
        
        console.log('Swap direction - isETHToUSDC:', isETHToUSDC, 'isUSDCToETH:', isUSDCToETH, 'fromToken:', spell.config.fromToken, 'toToken:', spell.config.toToken)
        
        if (!isETHToUSDC && !isUSDCToETH) {
          console.log('Only ETH ↔ USDC swaps are supported in demo')
          await new Promise(resolve => setTimeout(resolve, 2000))
          return
        }

        let executeParams
        
        if (isETHToUSDC) {
          // ETH -> USDC: swapETHForUSDC(uint256 usdcAmount) - EXACT same as swap component
          const usdcAmount = parseUnits(spell.config.amount || '1', 6) // USDC has 6 decimals
          executeParams = {
            toChainId: chainId,
            contractAddress,
            contractAbi: [
              {
                inputs: [{ internalType: 'uint256', name: 'usdcAmount', type: 'uint256' }],
                name: 'swapETHForUSDC',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
              },
            ],
            functionName: 'swapETHForUSDC',
            buildFunctionParams: () => ({
              functionParams: [usdcAmount],
            }),
            tokenApproval: {
              token: 'ETH',
              amount: spell.config.amount || '1',
            },
          }
        } else {
          // USDC -> ETH: swapUSDCForETH(uint256 ethAmount, uint256 usdcAmount) - EXACT same as swap component
          const ethAmount = parseUnits(spell.config.amount || '1', 18) // ETH has 18 decimals
          const usdcAmount = parseUnits(spell.config.amount || '1', 6) // USDC has 6 decimals
          executeParams = {
            toChainId: chainId,
            contractAddress,
            contractAbi: [
              {
                inputs: [
                  { internalType: 'uint256', name: 'ethAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'usdcAmount', type: 'uint256' }
                ],
                name: 'swapUSDCForETH',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            functionName: 'swapUSDCForETH',
            buildFunctionParams: () => ({
              functionParams: [ethAmount, usdcAmount],
            }),
            tokenApproval: {
              token: 'USDC',
              amount: spell.config.amount || '1',
            },
          }
        }

        // Execute simulation - EXACT same as swap component
        console.log('About to execute swap simulation with params:', executeParams)
        const simulation = await sdk.simulateExecute(executeParams)
        console.log('Swap simulation result:', simulation)
        
        // Track gas usage for mana calculation
        if (simulation.success && simulation.gasUsed) {
          const gasUsed = parseInt(simulation.gasUsed)
          setTotalGasUsed(prev => prev + gasUsed)
          totalGasRef.current += gasUsed
          console.log(`Swap gas used: ${gasUsed}, Total gas: ${totalGasRef.current}`)
        }
        
      } catch (error) {
        console.error('Swap simulation failed:', error)
        throw error
      }
    } else if (spell.id === 'lend') {
      // For lend spells, execute actual simulation
      try {
        console.log('Executing lend simulation with config:', spell.config)
        
        if (sdk) {
          // Extract chain ID from the config
          const chainIdMatch = spell.config.chainId?.match(/\((\d+)\)/)
          const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) : 11155111
          
          // Mock contract address for Yearn Vault
          const contractAddress = '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B'
          
          // Convert amount to wei based on token decimals
          const decimals = spell.config.token === 'USDC' ? 6 : 18
          const amountWei = parseUnits(spell.config.amount || '100', decimals)
          
          const executeParams = {
            toChainId: chainId,
            contractAddress,
            contractAbi: [
              {
                inputs: [
                  { internalType: 'uint256', name: 'assets', type: 'uint256' },
                  { internalType: 'address', name: 'receiver', type: 'address' },
                ],
                name: 'deposit',
                outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            functionName: 'deposit',
            buildFunctionParams: (
              token: any,
              amount: string,
              chainId: any,
              userAddress: `0x${string}`,
            ) => {
              return {
                functionParams: [amountWei, userAddress],
              }
            },
            tokenApproval: {
              token: spell.config.token || 'USDC',
              amount: spell.config.amount || '100',
            },
          }

          // Execute simulation
          const simulation = await sdk.simulateExecute(executeParams)
          console.log('Lend simulation result:', simulation)
          
          // Track gas usage for mana calculation
          if (simulation.success && simulation.gasUsed) {
            const gasUsed = parseInt(simulation.gasUsed)
            setTotalGasUsed(prev => prev + gasUsed)
            totalGasRef.current += gasUsed
            console.log(`Lend gas used: ${gasUsed}, Total gas: ${totalGasRef.current}`)
          }
          
          if (!simulation.success) {
            console.error('Lend simulation failed:', simulation.error)
          }
        } else {
          console.log('SDK not available, simulating lend execution')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error('Lend execution failed:', error)
        throw error
      }
    } else {
      // For other spells, simulate execution
      console.log(`${spell.name} execution would happen here`)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    console.log(`${spell.name} execution completed`)
  }

  const handleBrew = async () => {
    const startTime = Date.now()
    setTotalGasUsed(0) // Reset gas usage for new brewing session
    totalGasRef.current = 0 // Reset ref as well
    setIsBrewing(true)
    setShowVisualization(true)
    setCurrentSpellIndex(-1)
    
    try {
      // Execute spells in order
      for (let i = 0; i < spellChain.length; i++) {
        const spell = spellChain[i]
        setCurrentSpellIndex(i)
        console.log(`Executing spell ${i + 1}/${spellChain.length}: ${spell.name}`)
        
        await executeSpell(spell)
      }
      
      const endTime = Date.now()
      const totalTime = Math.round((endTime - startTime) / 1000) // Convert to seconds
      
      console.log('All spells executed successfully!')
      console.log(`Total brewing time: ${totalTime} seconds`)
      console.log(`Final total gas used: ${totalGasRef.current}`)
      
      setCurrentSpellIndex(-1)
      setIsBrewing(false)
      
      // Check if bridge spell was used and what token was bridged
      const bridgeSpell = spellChain.find(spell => spell.id === 'bridge')
      const bridgedToken = bridgeSpell?.config?.token
      
      let randomManaBonus
      if (bridgeSpell && bridgedToken === 'ETH') {
        // If ETH was bridged, use higher random range
        randomManaBonus = Math.floor(Math.random() * (143000 - 142458 + 1)) + 142458
        console.log(`ETH bridge detected - using higher mana range`)
      } else {
        // Default random range for other tokens or no bridge
        randomManaBonus = Math.floor(Math.random() * (131085 - 130000 + 1)) + 130000
        console.log(`No ETH bridge - using default mana range`)
      }
      
      const finalManaUsed = totalGasRef.current + randomManaBonus
      
      console.log(`Base gas used: ${totalGasRef.current}`)
      console.log(`Bridged token: ${bridgedToken || 'none'}`)
      console.log(`Random mana bonus: ${randomManaBonus}`)
      console.log(`Final mana used: ${finalManaUsed}`)
      
      // Show completion popup with stats - use ref value for immediate access
      setCompletionPopup({
        isOpen: true,
        stats: {
          totalTime,
          spellCount: spellChain.length,
          startTime,
          totalManaUsed: finalManaUsed
        }
      })

      // If in PvP mode, call onGameComplete with results
      if (isPvPMode && onGameComplete) {
        onGameComplete(finalManaUsed, totalTime) // Only mana and duration used in scoring
      }
      
    } catch (error) {
      console.error('Spell execution failed:', error)
      setIsBrewing(false)
      setShowVisualization(false)
      setCurrentSpellIndex(-1)
    }
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
          {isBrewing && currentSpellIndex >= 0 && (
            <div className="mt-6 p-4 bg-accent/10 border border-accent/40 rounded-lg">
              <h3 className="text-lg font-bold text-accent mb-2">Executing Spell Chain</h3>
              <div className="space-y-2">
                {spellChain.map((spell, index) => (
                  <div key={spell.instanceId} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < currentSpellIndex 
                        ? 'bg-green-500 text-white' 
                        : index === currentSpellIndex 
                        ? 'bg-accent text-accent-foreground animate-pulse' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index < currentSpellIndex ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${
                      index <= currentSpellIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {spell.name}
                    </span>
                    {index === currentSpellIndex && (
                      <span className="text-xs text-accent animate-pulse">Executing...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  {spell.id === 'bridge' ? (
                    <BridgeSpell
                      config={{
                        chainId: spell.config.chainId || 'Arbitrum Sepolia (421614)',
                        token: spell.config.token || 'USDC',
                        amount: spell.config.amount || '1',
                      }}
                      onExecute={() => {
                        console.log('Bridge transaction started!', spell.config);
                        // Don't remove immediately - let the bridge transaction complete
                        // The spell will be removed when the transaction is confirmed
                      }}
                      onCancel={() => removeSpell(spell.instanceId)}
                      onConfigChange={(newConfig) => updateSpellConfig(spell.instanceId, newConfig)}
                    />
                  ) : spell.id === 'swap' ? (
                    <SwapSpell
                      config={{
                        chainId: spell.config.chainId || '11155111',
                        fromToken: spell.config.fromToken || 'ETH',
                        toToken: spell.config.toToken || 'USDC',
                        amount: spell.config.amount || '1',
                      }}
                      onExecute={() => {
                        console.log('Swap transaction started!', spell.config);
                        // Don't remove immediately - let the swap transaction complete
                        // The spell will be removed when the transaction is confirmed
                      }}
                      onCancel={() => removeSpell(spell.instanceId)}
                    />
                  ) : spell.id === 'lend' ? (
                    <LendSpell
                      config={{
                        chainId: spell.config.chainId || 'Sepolia (11155111)',
                        token: spell.config.token || 'USDC',
                        amount: spell.config.amount || '100',
                        protocol: spell.config.protocol || 'Yearn',
                      }}
                      onExecute={() => {
                        console.log('Lend transaction started!', spell.config);
                        // Don't remove immediately - let the lend transaction complete
                        // The spell will be removed when the transaction is confirmed
                      }}
                      onCancel={() => removeSpell(spell.instanceId)}
                    />
                  ) : (
                  <SpellCard
                    id={spell.id}
                    name={spell.name}
                    icon={spell.icon}
                    instanceId={spell.instanceId}
                    inputs={spell.inputs}
                    onRemove={removeSpell}
                    onUpdate={updateSpellConfig}
                  />
                  )}

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

      {/* Bridge Popup */}
      {bridgePopup.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-primary/40 rounded-xl p-8 w-full max-w-md mx-4 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🌉</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Avail Nexus Core Bridge</h3>
              <p className="text-sm text-muted-foreground">Cross-chain token bridging</p>
            </div>

            {bridgePopup.bridgeDetails && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/40 rounded-lg">
                <h4 className="font-bold text-accent mb-3">Bridge Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token:</span>
                    <span className="font-medium">{bridgePopup.bridgeDetails.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{bridgePopup.bridgeDetails.amount} {bridgePopup.bridgeDetails.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To Chain:</span>
                    <span className="font-medium">{bridgePopup.bridgeDetails.chainName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain ID:</span>
                    <span className="font-medium">{bridgePopup.bridgeDetails.chainId}</span>
                  </div>
                </div>
              </div>
            )}

            {isBridgeExecuting && (
              <div className="mb-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-accent font-medium">Bridging in progress...</p>
                <p className="text-xs text-muted-foreground mt-2">Please wait while the transaction is processed</p>
              </div>
            )}

            {bridgePopup.bridgeResult && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/40 rounded-lg">
                <h4 className="font-bold text-green-500 mb-3">Bridge Successful!</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-500">✅ Completed</span>
                  </div>
                  {bridgePopup.bridgeResult.explorerUrl && (
                    <div className="mt-3">
                      <a
                        href={bridgePopup.bridgeResult.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-sm font-bold"
                      >
                        <span>🔗</span>
                        View on Explorer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBridgePopup({ isOpen: false })}
                className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 transition-colors"
              >
                {bridgePopup.bridgeResult ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Popup */}
      {completionPopup.isOpen && completionPopup.stats && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-primary/40 rounded-xl p-8 w-full max-w-md mx-4 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">⚗️✨</div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Potion Brewed!</h3>
              <p className="text-sm text-muted-foreground">Your magical concoction is complete</p>
            </div>

            <div className="mb-6 p-4 bg-accent/10 border border-accent/40 rounded-lg">
              <h4 className="font-bold text-accent mb-3">Brewing Statistics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Spells:</span>
                  <span className="font-medium text-accent text-lg">{completionPopup.stats.spellCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Brewing Time:</span>
                  <span className="font-medium text-accent text-lg">{completionPopup.stats.totalTime}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average per Spell:</span>
                  <span className="font-medium text-accent text-lg">
                    {completionPopup.stats.spellCount > 0 
                      ? (completionPopup.stats.totalTime / completionPopup.stats.spellCount).toFixed(1)
                      : '0'
                    }s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Mana Used:</span>
                  <span className="font-medium text-accent text-lg">{completionPopup.stats.totalManaUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-500 text-lg">✅ Complete</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCompletionPopup({ isOpen: false })}
                className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 transition-colors"
              >
                Awesome!
              </button>
              <button
                onClick={() => {
                  setCompletionPopup({ isOpen: false })
                  setSpellChain([])
                  setShowVisualization(false)
                }}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-secondary/80 transition-colors"
              >
                Clear & Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
