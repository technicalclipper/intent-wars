'use client';

import { WalletBridge } from './wallet-bridge'
import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'

export default function Header() {
  const { isConnected } = useAccount()

  return (
    <>
      <WalletBridge />
      <header className="border-b border-primary/40 bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent glow-effect animate-spin-slow opacity-80" />
              <div className="absolute inset-1 rounded-lg bg-card flex items-center justify-center">
                <span className="text-lg font-bold">⚗️</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent shimmer-effect">
                Alchemy of Chains
              </h1>
              <p className="text-xs text-muted-foreground font-semibold tracking-widest">DeFi Strategy Builder</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Network</p>
              <p className="text-accent font-bold text-lg">Ethereum</p>
            </div>
            <ConnectKitButton.Custom>
              {({ isConnected, show, hide, address, ensName, chain }) => {
                return (
                  <button 
                    onClick={show}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-bold uppercase text-xs tracking-wider glow-effect"
                  >
                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                      </div>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                )
              }}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </header>
    </>
  )
}
