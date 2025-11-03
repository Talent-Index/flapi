# Quick Deployment Guide for Spooky Score NFT

## ✅ Prerequisites Complete
- ✅ Scarb installed
- ✅ Starkli installed
- ✅ Contract compiled successfully

## Step 1: Set Up Starknet Account

You need a Starknet account to deploy. Choose one option:

### Option A: Use Existing Wallet (Recommended)
If you already have a Starknet wallet (Argent X or Braavos), export your account:

```bash
# For Argent X wallet
starkli signer keystore from-key ~/.starkli-wallets/keystore.json

# Follow prompts to enter your private key
# Then create account descriptor:
starkli account fetch <YOUR_WALLET_ADDRESS> \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
  --output ~/.starkli-wallets/account.json
```

### Option B: Create New Account
```bash
# Create keystore
starkli signer keystore new ~/.starkli-wallets/keystore.json

# Deploy account (requires ETH on Sepolia)
starkli account oz init ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7

# Fund the displayed address with Sepolia ETH from:
# https://starknet-faucet.vercel.app/

# Deploy the account:
starkli account deploy ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7
```

## Step 2: Declare the Contract

```bash
cd /Users/sharonkitavi/flapi/contracts

starkli declare target/dev/spooky_score_nft_SpookyScoreNFT.contract_class.json \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json
```

Save the **class hash** from the output (looks like `0x...`).

## Step 3: Deploy the Contract

```bash
starkli deploy <CLASS_HASH_FROM_STEP_2> \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json
```

Save the **contract address** from the output.

## Step 4: Update Your Game

Update the contract address in your game:

1. Open: `/Users/sharonkitavi/flapi/src/web3/StarknetWalletAdapter.js`
2. Find line 8: `var NFT_CONTRACT_ADDRESS = "0x..."`
3. Replace with your deployed contract address

## Step 5: Test It!

```bash
# Navigate to project root
cd /Users/sharonkitavi/flapi

# Start the game
npx serve

# Open http://localhost:3000
# Play, score 10+, connect wallet, and mint your NFT!
```

## Troubleshooting

### "Insufficient funds"
Get Sepolia ETH from: https://starknet-faucet.vercel.app/

### "Account not found"
Make sure you completed Step 1 properly and the account is deployed.

### "Invalid class hash"
Double-check you copied the full class hash from Step 2 (including `0x` prefix).

## Verify Your Deployment

Check your contract on Starkscan:
```
https://sepolia.starkscan.co/contract/<YOUR_CONTRACT_ADDRESS>
```

## Quick Commands Reference

```bash
# Check starkli version
starkli --version

# Check account
starkli account fetch <ADDRESS> --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7

# Rebuild contract after changes
cd contracts && scarb build
```
