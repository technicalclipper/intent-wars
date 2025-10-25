'use client';

import React, { useState } from 'react';
import { BridgeButton, TOKEN_METADATA, TOKEN_CONTRACT_ADDRESSES } from '@avail-project/nexus-widgets';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';

interface BridgeSpellProps {
  config: {
    chainId: string;
    token: string;
    amount: string;
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

export function BridgeSpell({ config, onExecute, onCancel }: BridgeSpellProps) {
  const { isConnected } = useAccount();
  const { isSdkInitialized, sdk } = useNexus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Extract chain ID from readable format (e.g., "Arbitrum Sepolia (421614)" -> "421614")
  const extractChainId = (chainString: string) => {
    const match = chainString.match(/\((\d+)\)/);
    return match ? match[1] : '421614';
  };

  // Local state for configuration
  const [bridgeConfig, setBridgeConfig] = useState({
    chainId: extractChainId(config.chainId || 'Arbitrum Sepolia (421614)'),
    token: config.token || 'USDC',
    amount: config.amount || '1',
  });

  const handleSimulation = async () => {
    if (!sdk) return;
    
    try {
      setError(null);
      
      const simulation = await sdk.simulateBridge({
        token: bridgeConfig.token,
        amount: parseFloat(bridgeConfig.amount),
        chainId: parseInt(bridgeConfig.chainId),
      });
      
      setSimulationResult(simulation);
      console.log('Bridge simulation result:', simulation);
    } catch (error) {
      console.error('Bridge simulation failed:', error);
      setError(error instanceof Error ? error.message : 'Simulation failed');
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-card border border-primary/40 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-bold text-foreground mb-2">Connect Wallet Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please connect your wallet to execute bridge spells
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
      <div className="p-6 bg-card border border-primary/40 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-foreground mb-2">Initializing Nexus SDK</h3>
          <p className="text-sm text-muted-foreground">
            Setting up cross-chain bridge...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card border border-primary/40 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🌉</div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Bridge Scroll</h3>
          <p className="text-sm text-muted-foreground">Cross-chain transfer</p>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="space-y-4 mb-6">
        {/* To Chain */}
        <div>
          <label className="block text-sm font-bold text-accent mb-2">To Chain</label>
          <select
            value={`${CHAIN_NAMES[bridgeConfig.chainId]} (${bridgeConfig.chainId})`}
            onChange={(e) => setBridgeConfig({...bridgeConfig, chainId: extractChainId(e.target.value)})}
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
            value={bridgeConfig.token}
            onChange={(e) => setBridgeConfig({...bridgeConfig, token: e.target.value})}
            className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
          >
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="MATIC">MATIC</option>
            <option value="MON">MON</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-accent mb-2">Amount</label>
          <input
            type="number"
            value={bridgeConfig.amount}
            onChange={(e) => setBridgeConfig({...bridgeConfig, amount: e.target.value})}
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
              <span className="text-accent font-medium">Success</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas Estimate:</span>
              <span>{simulationResult.gasEstimate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Time:</span>
              <span>{simulationResult.estimatedTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
          <h4 className="font-bold text-destructive mb-2">Simulation Error</h4>
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
        
        <BridgeButton
          prefill={{
            chainId: parseInt(bridgeConfig.chainId),
            token: bridgeConfig.token,
            amount: bridgeConfig.amount,
          }}
        >
          {({ onClick, isLoading }) => (
            <button
              onClick={() => {
                onClick();
                // Don't call onExecute immediately - let the bridge transaction handle completion
                console.log('Bridge transaction initiated');
              }}
              disabled={isLoading || !simulationResult}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Bridging...' : 'Brew Potion'}
            </button>
          )}
        </BridgeButton>
        
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
