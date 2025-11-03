# Flappy Haunt 🦇

You are a menacing Jack o' Lantern with glowing red eyes navigating through bloody gravestones in a world where the moon oozes green goo. Built with Dojo Toolkit (AMD, 1.7+ compatible) for UI/events/effects and canvas for rendering. On-chain highscores are integrated via Ready wallet (and other Starknet wallets) targeting Starknet Sepolia.

## Quick Start

- Static run: open `index.html` with a static server
  - `npx serve && npm install` from the project root
  - Open http://localhost:3000 (or the printed URL)
- Controls: Tap/Click or press Space/Up to flap. P = pause, R = restart.
- **Audio**: Game includes procedural audio (ambient drone, owl hoots, death sound, milestone bells). Click/tap to start and enable audio context.

## Theme & Features

- **Halloween Aesthetic**: Dark purple night sky with glowing stars, moon oozing toxic green acid, **glowing red lava floor with bubbling hot pools**, purple fog layers
- **Player**: Glowing jack o' lantern pumpkin with triangular eyes, nose, and a jagged toothy grin. Features subtle bobbing animation and orange glow aura
  - **Lava death**: If the jack o' lantern touches the lava floor, it burns to a char with flames engulfing it, fading eyes, and rising smoke
- **Obstacles**: Two types of tall Flappy Bird-style pipe obstacles extending from top and bottom
  - **Bloody gravestones**: Gray stone pipes with blood drips, cracks, and R.I.P. tombstone caps
  - **Toxic tombstones**: Glowing lime green tombstones with animated dripping acid goo, glowing cracks, "TOXIC" text, and acid puddles
- **Audio**: 
  - **Creepy soundtrack**: Looping minor key melody playing throughout (D minor pentatonic) - enhanced volume for atmosphere
  - Continuous creepy ambient drone (low-frequency rumble with LFO modulation)
  - Periodic owl hooting (every 8-15 seconds)
  - Horrifying burn sound (fire crackling with scream-like descending tones)
  - Unique death sound (dramatic descending tone)
  - Special milestone sound when reaching score of 10 (triumphant bells)
- **Physics**: Lighter gravity (650) for floatier gameplay, smooth flapping, deterministic collision detection, progressive difficulty, lava floor instant burn
- **Web3 Integration**: 
  - **Starknet wallet connection** via Ready wallet and other standard Starknet wallets on Sepolia testnet
  - **NFT minting**: Mint your high scores (10+) as spooky NFTs on Starknet
  - Standard wallet integration with transaction approval
  - Wallet status display in HUD

## Tech

- Dojo 1.10 (AMD): `dojo/dom`, `dojo/dom-construct`, `dojo/on`, `dojo/keys`, `dojo/_base/fx`, `dojo/fx`
- Canvas 2D for game rendering with procedural graphics (no image assets)
- Web Audio API for procedural sound generation (no audio files needed)
- get-starknet for wallet connectivity (Ready, Argent, Braavos, etc.) on Starknet Sepolia

## Web3 Integration (Starknet)

### Wallet Connection
- Click "Connect Wallet" button in HUD to connect via any Starknet wallet (Ready, Argent, Braavos, etc.)
- Supports Starknet Sepolia testnet
- Uses get-starknet modal to let you choose your preferred wallet
- Wallet address displayed once connected (shortened format)
- Connection persists during game session

### NFT Minting
- **Eligibility**: Score 10 or higher to unlock NFT minting
- **Process**: 
  1. Achieve a score of 10+
  2. Ensure wallet is connected
  3. Click "Mint NFT 🎃" button on game over screen
  4. Approve the transaction in your wallet
  5. Receive confirmation with transaction hash
- **NFT Data**: 
  - Recipient address
  - Final score (u256)
  - Timestamp (u64)
- **Contract**: Update `NFT_CONTRACT_ADDRESS` in `StarknetWalletAdapter.js` with your deployed contract

### Configuration
- Lazy-loads `get-starknet-core` and `starknet` from unpkg
- Network: Starknet Sepolia
  - Chain ID: `SN_SEPOLIA`
- Supports all standard Starknet wallets that implement the wallet standard
- Uses dark theme modal for wallet selection

### Deploy Your Own NFT Contract
```cairo
// Example entrypoint signature  
fn mint_score_nft(recipient: ContractAddress, score: u256, timestamp: u64)
```

## Starknet Deployment Guide

### Prerequisites
- Starknet CLI installed (`curl -L https://raw.githubusercontent.com/starkware-libs/starknet-foundry/master/scripts/install.sh | sh`)
- Starknet account on Sepolia testnet with ETH for gas
- ArgentX, Braavos, or Cartridge wallet installed

### 1. Deploy NFT Contract
```bash
# Compile the contract
starknet-compile contracts/SpookyScoreNFT.cairo --output contracts/SpookyScoreNFT.json

# Deploy to Sepolia
starknet deploy --contract contracts/SpookyScoreNFT.json --network sepolia
```

### 2. Update Contract Address
After deployment, update the contract address in:
```javascript
// src/web3/CartridgeControllerAdapter.js
var NFT_CONTRACT_ADDRESS = "0x0123..."; // Your deployed contract address
```

### 3. Wallet Integration
The game supports multiple Starknet wallets:
- **ArgentX**: Browser extension wallet
- **Braavos**: Browser extension wallet  
- **Cartridge Controller**: Embedded wallet with session keys

### 4. Testing on Sepolia
1. Get Sepolia ETH from [Starknet Faucet](https://starknet-faucet.vercel.app/)
2. Deploy your game to a web server
3. Connect wallet and test NFT minting
4. Verify transactions on [Starkscan Sepolia](https://sepolia.starkscan.co/)

### 5. Supported Networks
- **Sepolia Testnet**: `0x534e5f5345504f4c4941` (Development)
- **Mainnet**: `0x534e5f4d41494e` (Production - update RPC URLs)

## Development Plan

See `.PLAN` for milestones and tasks.

## Security Notes

- No private keys in client. All signing is performed via the connected Starknet wallet.
- Transactions require user approval through the wallet interface.

## Deploy

- Host the static files on Netlify/Vercel/Cloudflare Pages.
- Ensure HTTPS so Starknet wallets can operate correctly.
