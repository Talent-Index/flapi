# Flappy Haunt 🦇

You are a menacing Jack o' Lantern with glowing red eyes navigating through bloody gravestones in a world where the moon oozes green goo. Built with Dojo Toolkit (AMD, 1.7+ compatible) for UI/events/effects and canvas for rendering. On-chain highscores are integrated via Cartridge Controller targeting Starknet Sepolia.

## Quick Start

- Static run: open `index.html` with a static server
  - `npx serve` (or any static server) from the project root
  - Open http://localhost:3000 (or the printed URL)
- Controls: Tap/Click or press Space/Up to flap. P = pause, R = restart.
- **Audio**: Game includes procedural audio (ambient drone, owl hoots, death sound, milestone bells). Click/tap to start and enable audio context.

## Theme & Features

- **Halloween Aesthetic**: Dark purple night sky with glowing stars, moon oozing toxic green acid, **glowing red lava floor with bubbling hot pools**, purple fog layers
- **Player**: Glowing jack o' lantern pumpkin with triangular eyes, nose, and a jagged toothy grin. Features subtle bobbing animation and orange glow aura
  - **Life system**: Start with 1 life. Collect hearts every 7 obstacles to gain extra lives
  - **Heart power-ups**: Pulsing red hearts appear in the middle of the screen every 7 obstacles
  - **Lava death**: If the jack o' lantern touches the lava floor, it burns to a char with flames engulfing it, fading eyes, and rising smoke
- **Obstacles**: Tall Flappy Bird-style pipe obstacles extending from top and bottom
  - **Glowing tombstones**: All tombstones glow lime green with animated dripping acid goo, glowing cracks, "TOXIC" text, and acid puddles
  - Hitting obstacles loses a life instead of instant game over
- **Audio**: 
  - **Creepy soundtrack**: Looping minor key melody playing throughout (D minor pentatonic) - enhanced volume for atmosphere
  - Continuous creepy ambient drone (low-frequency rumble with LFO modulation)
  - Periodic owl hooting (every 8-15 seconds)
  - Horrifying burn sound (fire crackling with scream-like descending tones)
  - Unique death sound (dramatic descending tone)
  - Special milestone sound when reaching score of 10 (triumphant bells)
- **Physics**: Lighter gravity (650) for floatier gameplay, smooth flapping, deterministic collision detection, progressive difficulty, lava floor instant burn
- **Web3 Integration**: 
  - **Starknet wallet connection** via Cartridge Controller on Sepolia testnet
  - **NFT minting**: Mint your high scores (10+) as spooky NFTs on Starknet
  - Session policies for gasless transactions
  - Wallet status display in HUD

## Tech

- Dojo 1.10 (AMD): `dojo/dom`, `dojo/dom-construct`, `dojo/on`, `dojo/keys`, `dojo/_base/fx`, `dojo/fx`
- Canvas 2D for game rendering with procedural graphics (no image assets)
- Web Audio API for procedural sound generation (no audio files needed)
- Cartridge Controller for on-chain scores (Starknet Sepolia)

## Web3 Integration (Starknet)

### Wallet Connection
- Click "Connect Wallet" button in HUD to connect via Cartridge Controller
- Supports Starknet Sepolia testnet
- Wallet address displayed once connected (shortened format)
- Connection persists during game session

### NFT Minting
- **Eligibility**: Score 10 or higher to unlock NFT minting
- **Process**: 
  1. Achieve a score of 10+
  2. Ensure wallet is connected
  3. Click "Mint NFT 🎃" button on game over screen
  4. Transaction automatically executes with session policies
  5. Receive confirmation with transaction hash
- **NFT Data**: 
  - Recipient address
  - Final score (u256)
  - Timestamp (u64)
- **Contract**: Update `NFT_CONTRACT_ADDRESS` in `CartridgeControllerAdapter.js` with your deployed contract

### Configuration
- Lazy-loads `@cartridge/controller` and `starknet` from unpkg
- Network: Starknet Sepolia
  - RPC: `https://api.cartridge.gg/x/starknet/sepolia`
  - Chain ID: `SN_SEPOLIA`
- Session policies configured for `mint_score_nft` entrypoint

### Deploy Your Own NFT Contract
```cairo
// Example entrypoint signature
fn mint_score_nft(recipient: ContractAddress, score: u256, timestamp: u64)
```

## Development Plan

See `.PLAN` for milestones and tasks.

## Security Notes

- No private keys in client. All signing is performed via Cartridge Controller.
- Use session policies for gasless gameplay and fewer prompts.

## Deploy

- Host the static files on Netlify/Vercel/Cloudflare Pages.
- Ensure HTTPS so Cartridge can operate correctly.
