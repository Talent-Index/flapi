# Flappy Haunt 🦇

You are a menacing Jack o' Lantern with glowing red eyes navigating through bloody gravestones in a world where the moon oozes green goo. Built with Dojo Toolkit (AMD, 1.7+ compatible) for UI/events/effects and canvas for rendering. On-chain highscores are integrated via Cartridge Controller targeting Starknet Sepolia.

## Quick Start

- Static run: open `index.html` with a static server
  - `npx serve` (or any static server) from the project root
  - Open http://localhost:3000 (or the printed URL)
- Controls: Tap/Click or press Space/Up to flap. P = pause, R = restart.
- **Audio**: Game includes procedural audio (ambient drone, owl hoots, death sound, milestone bells). Click/tap to start and enable audio context.

## Theme & Features

- **Halloween Aesthetic**: Dark purple night sky with glowing stars, moon oozing toxic green acid, bubbling green acid ground, purple fog layers
- **Player**: Glowing jack o' lantern pumpkin with triangular eyes, nose, and a jagged toothy grin. Features subtle bobbing animation and orange glow aura
- **Obstacles**: Two types of tall Flappy Bird-style pipe obstacles extending from top and bottom
  - **Bloody gravestones**: Gray stone pipes with blood drips, cracks, and R.I.P. tombstone caps
  - **Toxic tombstones**: Glowing lime green tombstones with animated dripping acid goo, glowing cracks, "TOXIC" text, and acid puddles
- **Audio**: 
  - Continuous creepy ambient drone (low-frequency rumble)
  - Periodic owl hooting (every 8-15 seconds)
  - Unique death sound (dramatic descending tone)
  - Special milestone sound when reaching score of 10 (triumphant bells)
- **Physics**: Smooth flapping, deterministic collision detection, progressive difficulty

## Tech

- Dojo 1.10 (AMD): `dojo/dom`, `dojo/dom-construct`, `dojo/on`, `dojo/keys`, `dojo/_base/fx`, `dojo/fx`
- Canvas 2D for game rendering with procedural graphics (no image assets)
- Web Audio API for procedural sound generation (no audio files needed)
- Cartridge Controller for on-chain scores (Starknet Sepolia)

## Configure Starknet (Cartridge)

- The adapter lazy-loads `@cartridge/controller` and `starknet` from unpkg and sets network to Sepolia using:
  - `chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" }]`
  - `defaultChainId: constants.StarknetChainId.SN_SEPOLIA`
- Score submission wiring is added in the Web3 milestone. Provide your leaderboard contract address/ABI and permitted `entrypoint` (e.g., `submit_score`) in session policies.

## Development Plan

See `.PLAN` for milestones and tasks.

## Security Notes

- No private keys in client. All signing is performed via Cartridge Controller.
- Use session policies for gasless gameplay and fewer prompts.

## Deploy

- Host the static files on Netlify/Vercel/Cloudflare Pages.
- Ensure HTTPS so Cartridge can operate correctly.
