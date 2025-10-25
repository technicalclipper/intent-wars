'use client';

import React, { useState } from 'react';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import type { ExecuteSimulation } from '@avail-project/nexus-core';

interface LendSpellProps {
  config: {
    chainId: string;
    token: string;
    amount: string;
    protocol: string;
  };
  onExecute: () => void;
  onCancel: () => void;
}

const CHAIN_NAMES: Record<string, string> = {
  '11155111': 'Sepolia',
  '421614': 'Arbitrum Sepolia',
  '80002': 'Polygon Amoy',
  '11155420': 'Optimism Sepolia',
  '84532': 'Base Sepolia',
  '1014': 'Monad Testnet',
};

// Yearn Vault ABI for deposit function
const YEARN_VAULT_ABI = [
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
] as const;

// Mock contract addresses for different chains (you'll need to update these with real addresses)
const CONTRACT_ADDRESSES: Record<string, string> = {
  '11155111': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Mock Yearn Vault on Sepolia
  '421614': '0x9996d91f3De54F9Fd17667E3A68295dBFfE69a9B', // Mock Yearn Vault on Arbitrum Sepolia
  // Add other chain addresses as needed
};

export function LendSpell({ config, onExecute, onCancel }: LendSpellProps) {
  const { isConnected } = useAccount();
  const { isSdkInitialized, sdk } = useNexus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ExecuteSimulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const extractChainId = (chainString: string) => {
    const match = chainString.match(/\((\d+)\)/);
    return match ? match[1] : '11155111';
  };

  const [lendConfig, setLendConfig] = useState({
    chainId: extractChainId(config.chainId || 'Sepolia (11155111)'),
    token: config.token || 'USDC',
    amount: config.amount || '100',
    protocol: config.protocol || 'Yearn',
  });

  const handleSimulation = async () => {
    if (!sdk) return;

    setIsExecuting(true);
    setError(null);
    setSimulationResult(null);

    try {
      const targetChainId = parseInt(lendConfig.chainId);
      const contractAddress = CONTRACT_ADDRESSES[lendConfig.chainId];

      if (!contractAddress) {
        throw new Error(`Yearn Vault not deployed on ${CHAIN_NAMES[lendConfig.chainId]}`);
      }

      // Convert amount to wei based on token decimals
      const decimals = lendConfig.token === 'USDC' ? 6 : 18; // USDC has 6 decimals, ETH has 18
      const amountWei = parseUnits(lendConfig.amount, decimals);

      const simulation: ExecuteSimulation = await sdk.simulateExecute({
        toChainId: targetChainId,
        contractAddress: contractAddress as `0x${string}`,
        contractAbi: YEARN_VAULT_ABI,
        functionName: 'deposit',
        buildFunctionParams: (
          token: any,
          amount: string,
          chainId: any,
          userAddress: `0x${string}`,
        ) => {
          return {
            functionParams: [amountWei, userAddress],
          };
        },
        tokenApproval: {
          token: lendConfig.token,
          amount: lendConfig.amount,
        },
      });

      setSimulationResult(simulation);
      console.log('Lend simulation result:', simulation);
      if (!simulation.success) {
        setError(simulation.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Lend simulation failed:', error);
      setError(error instanceof Error ? error.message : 'Simulation failed');
    } finally {
      setIsExecuting(false);
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
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-bold text-foreground mb-2">Connect Wallet Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please connect your wallet to execute lend spells
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-accent mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-foreground mb-2">Initializing Nexus SDK</h3>
          <p className="text-sm text-muted-foreground">
            Setting up lending protocols...
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
          <div className="text-3xl">🏦</div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Lend Rune</h3>
            <p className="text-sm text-muted-foreground">Provide liquidity</p>
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
                value={`${CHAIN_NAMES[lendConfig.chainId]} (${lendConfig.chainId})`}
                onChange={(e) => setLendConfig({...lendConfig, chainId: extractChainId(e.target.value)})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                {Object.entries(CHAIN_NAMES).map(([chainId, chainName]) => (
                  <option key={chainId} value={`${chainName} (${chainId})`}>{chainName}</option>
                ))}
              </select>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">Token</label>
              <select
                value={lendConfig.token}
                onChange={(e) => setLendConfig({...lendConfig, token: e.target.value})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="MATIC">MATIC</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">Amount</label>
              <input
                type="number"
                value={lendConfig.amount}
                onChange={(e) => setLendConfig({...lendConfig, amount: e.target.value})}
                placeholder="100"
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              />
            </div>

            {/* Protocol */}
            <div>
              <label className="block text-sm font-bold text-accent mb-2">Protocol</label>
              <select
                value={lendConfig.protocol}
                onChange={(e) => setLendConfig({...lendConfig, protocol: e.target.value})}
                className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
              >
                <option value="Yearn">Yearn</option>
                <option value="Aave">Aave</option>
                <option value="Compound">Compound</option>
              </select>
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
                  <span className="font-medium">{CHAIN_NAMES[lendConfig.chainId]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol:</span>
                  <span className="font-medium">{lendConfig.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token:</span>
                  <span className="font-medium">{lendConfig.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{lendConfig.amount} {lendConfig.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Used:</span>
                  <span className="font-medium text-accent">{simulationResult.gasUsed || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Cost:</span>
                  <span className="font-medium">~{((parseInt(simulationResult.gasUsed || '0') * 20) / 1e9).toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approval Required:</span>
                  <span className="font-medium">{simulationResult.metadata?.approvalRequired ? 'Yes' : 'No'}</span>
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
              disabled={isExecuting}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-secondary/80 transition-colors"
            >
              Simulate
            </button>

            <button
              onClick={handleSimulation}
              disabled={isExecuting}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 disabled:opacity-50 transition-colors"
            >
              {isExecuting ? 'Simulating...' : 'Simulate Only'}
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
