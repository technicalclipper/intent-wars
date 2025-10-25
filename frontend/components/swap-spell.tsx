'use client';

import React, { useState } from 'react';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';

interface SwapSpellProps {
  config: {
    fromToken: string;
    toToken: string;
    amount: string;
    chainId: string;
  };
  onExecute: () => void;
  onCancel: () => void;
}

// Chain ID to name mapping
const CHAIN_NAMES: Record<string, string> = {
  '11155111': 'Sepolia',
  '421614': 'Arbitrum Sepolia', 
  '80002': 'Polygon Amoy',
  '11155420': 'Optimism Sepolia',
  '84532': 'Base Sepolia',
  '1014': 'Monad Testnet',
};

// Mock contract addresses for each chain (demo only)
const CONTRACT_ADDRESSES: Record<string, string> = {
  '11155111': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Sepolia
  '421614': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Arbitrum Sepolia
  '80002': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Polygon Amoy
  '11155420': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Optimism Sepolia
  '84532': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Base Sepolia
  '1014': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Monad Testnet
};

export function SwapSpell({ config, onExecute, onCancel }: SwapSpellProps) {
  const { isConnected } = useAccount();
  const { isSdkInitialized, sdk } = useNexus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for configuration
  const [swapConfig, setSwapConfig] = useState({
    fromToken: config.fromToken || 'ETH',
    toToken: config.toToken || 'USDC',
    amount: config.amount || '1',
    chainId: config.chainId || '11155111',
  });

  const handleSimulation = async () => {
    if (!sdk) return;
    
    try {
      setError(null);
      
      // Determine which function to call based on swap direction
      const isETHToUSDC = swapConfig.fromToken === 'ETH' && swapConfig.toToken === 'USDC';
      const isUSDCToETH = swapConfig.fromToken === 'USDC' && swapConfig.toToken === 'ETH';
      
      if (!isETHToUSDC && !isUSDCToETH) {
        setError('Only ETH ↔ USDC swaps are supported in demo');
        return;
      }

      const contractAddress = CONTRACT_ADDRESSES[swapConfig.chainId];
      const chainId = parseInt(swapConfig.chainId);
      
      let executeParams;
      
      if (isETHToUSDC) {
        // ETH -> USDC: swapETHForUSDC(uint256 usdcAmount)
        const usdcAmount = parseUnits(swapConfig.amount, 6); // USDC has 6 decimals
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
            amount: swapConfig.amount,
          },
        };
      } else {
        // USDC -> ETH: swapUSDCForETH(uint256 ethAmount, uint256 usdcAmount)
        const ethAmount = parseUnits(swapConfig.amount, 18); // ETH has 18 decimals
        const usdcAmount = parseUnits(swapConfig.amount, 6); // USDC has 6 decimals
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
            amount: swapConfig.amount,
          },
        };
      }

      const simulation = await sdk.simulateExecute(executeParams);
      setSimulationResult(simulation);
      console.log('Swap simulation result:', simulation);
    } catch (error) {
      console.error('Swap simulation failed:', error);
      setError(error instanceof Error ? error.message : 'Simulation failed');
    }
  };

  const handleExecute = async () => {
    // Only run simulation when clicking "Brew Potion"
    await handleSimulation();
    onExecute();
  };

  if (!isConnected) {
    return (
      <div className="bg-card border border-primary/40 rounded-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">💧</div>
          <h3 className="text-lg font-bold text-foreground mb-2">Connect Wallet Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please connect your wallet to execute swap spells
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!isSdkInitialized) {
    return (
      <div className="bg-card border border-primary/40 rounded-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-foreground mb-2">Initializing Nexus SDK</h3>
          <p className="text-sm text-muted-foreground">
            Setting up swap functionality...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-primary/40 rounded-xl overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">💧</div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Swap Crystal</h3>
            <p className="text-sm text-muted-foreground">Token exchange</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent text-xl transition-transform duration-300 rune-pulse">
            {isExpanded ? "▼" : "▶"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs bg-destructive/30 text-destructive rounded-lg hover:bg-destructive/50 transition-all font-bold uppercase tracking-wider"
          >
            Remove
          </button>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-primary/30 p-6 bg-gradient-to-b from-primary/20 to-secondary/10">
          {/* Configuration Controls */}
          <div className="space-y-4 mb-6">
            {/* Chain */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">Chain</label>
              <select
                value={swapConfig.chainId}
                onChange={(e) => setSwapConfig({...swapConfig, chainId: e.target.value})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                {Object.entries(CHAIN_NAMES).map(([chainId, chainName]) => (
                  <option key={chainId} value={chainId}>{chainName}</option>
                ))}
              </select>
            </div>

            {/* From Token */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">From Token</label>
              <select
                value={swapConfig.fromToken}
                onChange={(e) => setSwapConfig({...swapConfig, fromToken: e.target.value})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            {/* To Token */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">To Token</label>
              <select
                value={swapConfig.toToken}
                onChange={(e) => setSwapConfig({...swapConfig, toToken: e.target.value})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">Amount</label>
              <input
                type="number"
                value={swapConfig.amount}
                onChange={(e) => setSwapConfig({...swapConfig, amount: e.target.value})}
                placeholder="1"
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              />
            </div>
          </div>

          {/* Simulation Results */}
          {simulationResult && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/40 rounded-lg">
              <h4 className="font-bold text-accent mb-2">Simulation Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-accent font-medium">{simulationResult.success ? 'Success' : 'Failed'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain:</span>
                  <span className="font-medium">{CHAIN_NAMES[swapConfig.chainId]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swap:</span>
                  <span className="font-medium">{swapConfig.fromToken} → {swapConfig.toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{swapConfig.amount} {swapConfig.fromToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Used:</span>
                  <span className="font-medium text-accent">{simulationResult.gasUsed || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Cost:</span>
                  <span className="font-medium">~{((parseInt(simulationResult.gasUsed || '0') * 20) / 1e9).toFixed(6)} ETH</span>
                </div>
                {simulationResult.error && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
                    <div className="font-semibold text-destructive mb-1">Error:</div>
                    <div className="text-destructive">{simulationResult.error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
              <h4 className="font-bold text-destructive mb-2">Error</h4>
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSimulation}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-secondary/80 transition-colors"
            >
              Simulate
            </button>
            
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 disabled:opacity-50 transition-colors"
            >
              {isExecuting ? 'Simulating...' : 'Brew Potion'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
