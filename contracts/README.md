# Spooky Score NFT Contract

This Cairo smart contract mints NFTs representing high scores from Flappy Haunt on Starknet.

## Features

- **ERC-721-like NFT** with score and timestamp metadata
- **Standard wallet integration** with transaction approval via Ready and other Starknet wallets
- **Score tracking**: Each NFT stores the player's score (u256)
- **Timestamp**: Records when the score was achieved (u64)
- **Read-only views**: Query scores and timestamps by token ID

## Deployment

### Prerequisites
- Starknet CLI or Scarb
- Starknet Sepolia testnet account with funds

### Steps

1. **Compile the contract**:
```bash
scarb build
```

2. **Declare the contract**:
```bash
starkli declare target/dev/SpookyScoreNFT.contract_class.json \
  --network sepolia \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json
```

3. **Deploy the contract**:
```bash
starkli deploy <CLASS_HASH> \
  --network sepolia \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json
```

4. **Update the game**:
   - Copy the deployed contract address
   - Update `NFT_CONTRACT_ADDRESS` in `/src/web3/StarknetWalletAdapter.js`

## Contract Interface

### `mint_score_nft`
```cairo
fn mint_score_nft(
    recipient: ContractAddress,
    score: u256,
    timestamp: u64
) -> u256
```
Mints a new NFT with the player's score and timestamp. Returns the token ID.

### `get_score`
```cairo
fn get_score(token_id: u256) -> u256
```
Returns the score associated with a token ID.

### `get_timestamp`
```cairo
fn get_timestamp(token_id: u256) -> u64
```
Returns the timestamp when the score was achieved.

### `owner_of`
```cairo
fn owner_of(token_id: u256) -> ContractAddress
```
Returns the owner of a token.

### `balance_of`
```cairo
fn balance_of(owner: ContractAddress) -> u256
```
Returns the number of NFTs owned by an address.

## Metadata

NFTs use a base URI for metadata. In production, implement:
- IPFS storage for NFT images (spooky themed based on score tiers)
- JSON metadata with score, timestamp, and visual attributes
- On-chain or off-chain rarity system

### Example Metadata JSON
```json
{
  "name": "Spooky Score #123",
  "description": "Flappy Haunt high score achievement",
  "image": "ipfs://Qm.../spooky_score_123.png",
  "attributes": [
    {
      "trait_type": "Score",
      "value": 42
    },
    {
      "trait_type": "Timestamp",
      "value": 1730419200
    },
    {
      "trait_type": "Rarity",
      "value": "Epic"
    }
  ]
}
```

## Testing

Test the contract on Starknet Sepolia before mainnet deployment:

```bash
# Call mint_score_nft
starkli invoke <CONTRACT_ADDRESS> mint_score_nft \
  <RECIPIENT_ADDRESS> <SCORE> 0 <TIMESTAMP> \
  --network sepolia

# Query score
starkli call <CONTRACT_ADDRESS> get_score <TOKEN_ID> \
  --network sepolia
```

## Wallet Integration

The game uses get-starknet to support all standard Starknet wallets (Ready, Argent, Braavos, etc.):

- Players choose their preferred wallet from the modal
- Each transaction requires explicit user approval through the wallet
- Compatible with all wallets implementing the Starknet wallet standard
- Works on Starknet Sepolia testnet

## License

MIT
