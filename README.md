# ⚔️ Intent Wars

**A DeFi Strategy Battle Game Built on Avail Nexus Core**

Intent Wars is an innovative PvP (Player vs Player) DeFi strategy game where players compete to create the most efficient cross-chain DeFi strategies using magical spells. Built on the cutting-edge [Avail Nexus Core](https://github.com/availproject/nexus-core) infrastructure and integrated with [Blockscout](https://blockscout.com/) for transaction tracking.

## 🎮 Game Overview

Intent Wars transforms DeFi strategy into an engaging competitive experience. Players drag and drop magical spell cards to create complex cross-chain strategies, then compete against each other to see who can execute the most efficient transactions.

### 🌟 Key Features

- **🧙‍♂️ Magical Spell System**: Bridge, Swap, Lend, Borrow, Farm, and Mint spells
- **⚔️ PvP Competition**: Real-time matchmaking and competitive scoring
- **🌉 Cross-Chain Magic**: Powered by Avail Nexus Core for seamless cross-chain operations
- **📊 Live Analytics**: Real-time gas tracking and efficiency metrics
- **🎯 Strategy Building**: Drag-and-drop interface for complex DeFi strategies
- **🏆 Leaderboards**: Track your performance against other players

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Wallet Integration**: Wagmi + ConnectKit
- **State Management**: React Hooks + TanStack Query

### DeFi Infrastructure
- **Cross-Chain**: [Avail Nexus Core](https://github.com/availproject/nexus-core) - Advanced cross-chain intent execution
- **Transaction Tracking**: [Blockscout App SDK](https://github.com/blockscout/app-sdk) - Real-time transaction notifications
- **Intent Explorer**: [Nexus Folly Explorer](https://explorer.nexus-folly.availproject.org/intent/1310) - Track cross-chain intents

### UI Components
- **Design System**: Radix UI primitives
- **Animations**: Custom CSS animations with Tailwind
- **Icons**: Lucide React + Custom spell images

## 🎯 Game Mechanics

### Spell Types
1. **🌉 Bridge Scroll**: Cross-chain token transfers
2. **💎 Swap Crystal**: Token-to-token exchanges  
3. **📜 Lend Rune**: Yield farming and lending
4. **🏛️ Borrow Totem**: Collateralized borrowing
5. **🌾 Farm**: Liquidity provision and farming
6. **🎨 Mint**: NFT and token minting

### Scoring System
Players are scored based on:
- **Mana Efficiency**: Gas usage optimization
- **Speed**: Transaction execution time
- **Strategy Complexity**: Number of spells used
- **Yield Generated**: Returns from DeFi operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/intent-wars.git
cd intent-wars

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_NEXUS_NETWORK=testnet
NEXT_PUBLIC_DEBUG=true
```

## 🎮 How to Play

### 1. **Landing Page**
- Connect your wallet
- Click "Find Match PvP" to enter matchmaking

### 2. **Strategy Building**
- Drag spell cards from the library to the cauldron
- Configure each spell's parameters (tokens, amounts, chains)
- Use the "Simulate" button to preview gas costs

### 3. **Competition**
- Click "Brew Potion" to execute your strategy
- Watch real-time gas tracking and efficiency metrics
- Submit your results to compete against other players

### 4. **Results**
- View your performance vs. opponents
- Track transaction history with Blockscout integration
- Climb the leaderboards

## 🔧 Technical Architecture

### Frontend Structure
```
frontend/
├── app/                    # Next.js app router
│   ├── api/               # API routes for PvP logic
│   ├── game/              # Game pages and room management
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── spell-library.tsx # Spell card definitions
│   ├── chain-builder.tsx # Main game interface
│   ├── bridge-spell.tsx  # Bridge spell implementation
│   ├── swap-spell.tsx    # Swap spell implementation
│   └── lend-spell.tsx    # Lend spell implementation
└── public/               # Static assets and spell images
```

### API Routes
- `/api/rooms` - PvP matchmaking and room management
- `/api/submit-result` - Score submission and winner calculation
- `/api/debug-storage` - Development debugging tools

### Key Integrations

#### Avail Nexus Core
```typescript
import type {
  ExecuteParams,
  ExecuteResult,
  ExecuteSimulation,
  BridgeAndExecuteParams,
  BridgeAndExecuteResult,
  BridgeAndExecuteSimulationResult,
} from '@avail-project/nexus-core';

// Cross-chain bridging
const bridgeResult = await sdk.bridge({
  token: 'USDC',
  amount: 100,
  chainId: 421614
})

// Execute contract functions with dynamic parameter builder - Compound V3 Supply
const result: ExecuteResult = await sdk.execute({
  toChainId: 1,
  contractAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // Compound V3 USDC Market
  contractAbi: [
    {
      inputs: [
        { internalType: 'address', name: 'asset', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'supply',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  functionName: 'supply',
  buildFunctionParams: (
    token: SUPPORTED_TOKENS,
    amount: string,
    chainId: SUPPORTED_CHAINS_IDS,
    userAddress: `0x${string}`,
  ) => {
    const decimals = TOKEN_METADATA[token].decimals;
    const amountWei = parseUnits(amount, decimals);
    const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
    return {
      functionParams: [tokenAddress, amountWei],
    };
  },
  waitForReceipt: true,
  requiredConfirmations: 3,
  tokenApproval: {
    token: 'USDC',
    amount: '1000000', // Amount in token units
  },
} as ExecuteParams);

// Simulate execute to preview costs and check for approval requirements
const simulation: ExecuteSimulation = await sdk.simulateExecute(executeParams);
if (!simulation.success) {
  console.log('Simulation failed:', simulation.error);
  // Error might indicate missing token approval
}

// Bridge tokens and execute contract function - Yearn Vault Deposit
const bridgeAndExecuteResult: BridgeAndExecuteResult = await sdk.bridgeAndExecute({
  token: 'USDC',
  amount: '100000000', // 100 USDC (6 decimals)
  toChainId: 1, // Ethereum
  sourceChains: [8453], // Only use USDC from `Base` as source for bridge
  execute: {
    contractAddress: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE', // Yearn USDC Vault
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
      token: SUPPORTED_TOKENS,
      amount: string,
      chainId: SUPPORTED_CHAINS_IDS,
      userAddress: `0x${string}`,
    ) => {
      const decimals = TOKEN_METADATA[token].decimals;
      const amountWei = parseUnits(amount, decimals);
      return {
        functionParams: [amountWei, userAddress],
      };
    },
    tokenApproval: {
      token: 'USDC',
      amount: '100000000',
    },
  },
  waitForReceipt: true,
} as BridgeAndExecuteParams);

// Comprehensive simulation with detailed step analysis and approval handling
const simulation: BridgeAndExecuteSimulationResult = await sdk.simulateBridgeAndExecute(params);

// The simulation provides detailed step analysis:
console.log('Steps:', simulation.steps);
console.log('Total estimated cost:', simulation.totalEstimatedCost);
console.log('Approval required:', simulation.metadata?.approvalRequired);
console.log('Bridge receive amount:', simulation.metadata?.bridgeReceiveAmount);
```

#### Blockscout Integration
```typescript
import { useTransactionPopup } from '@blockscout/app-sdk'

// Transaction notifications
await openTxToast(chainId, txHash)
```

## 🌐 Supported Networks

- **Ethereum Sepolia** (Chain ID: 11155111)
- **Arbitrum Sepolia** (Chain ID: 421614)  
- **Optimism Sepolia** (Chain ID: 11155420)
- **Polygon Mumbai** (Chain ID: 80001)

## 🎨 Customization

### Adding New Spells
1. Create a new spell component in `components/`
2. Add spell definition to `spell-library.tsx`
3. Implement execution logic in `chain-builder.tsx`
4. Add spell image to `public/` directory

### Styling
- Custom CSS animations in `globals.css`
- Tailwind configuration in `tailwind.config.js`
- Component styling with CSS modules

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t intent-wars .

# Run container
docker run -p 3000:3000 intent-wars
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Avail Project](https://availproject.org/) for the revolutionary Nexus Core infrastructure
- [Blockscout](https://blockscout.com/) for transaction tracking and analytics
- [Nexus Folly Explorer](https://explorer.nexus-folly.availproject.org/intent/1310) for intent visualization
- The DeFi community for inspiration and feedback

## 🔗 Links

- **Live Demo**: [Intent Wars](https://intent-wars.vercel.app)
- **Nexus Core**: [GitHub](https://github.com/availproject/nexus-core)
- **Blockscout**: [Documentation](https://docs.blockscout.com/)
- **Intent Explorer**: [Nexus Folly](https://explorer.nexus-folly.availproject.org/intent/1310)

---

**Built with ⚡ by the Intent Wars team**

*Transform DeFi into an epic battle of strategy and efficiency!*
