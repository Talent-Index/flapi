// Spooky Score NFT Contract for Flappy Haunt
// Deploy this contract to Starknet Sepolia and update the address in StarknetWalletAdapter.js

#[starknet::contract]
mod SpookyScoreNFT {
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map, StorageMapReadAccess, StorageMapWriteAccess};
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        name: felt252,
        symbol: felt252,
        next_token_id: u256,
        token_uri_base: ByteArray,
        owner_of: Map<u256, ContractAddress>,
        balance_of: Map<ContractAddress, u256>,
        score_of_token: Map<u256, u256>,
        timestamp_of_token: Map<u256, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        ScoreMinted: ScoreMinted,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        #[key]
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ScoreMinted {
        recipient: ContractAddress,
        token_id: u256,
        score: u256,
        timestamp: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.name.write('SpookyScoreNFT');
        self.symbol.write('SPOOKY');
        self.next_token_id.write(1);
        self.token_uri_base.write("ipfs://QmSpookyBaseURI/");
    }

    #[abi(embed_v0)]
    impl SpookyScoreNFTImpl of ISpookyScoreNFT<ContractState> {
        // Mint NFT with score and timestamp
        fn mint_score_nft(
            ref self: ContractState,
            recipient: ContractAddress,
            score: u256,
            timestamp: u64
        ) -> u256 {
            let token_id = self.next_token_id.read();
            
            // Mint the token
            self.owner_of.write(token_id, recipient);
            let current_balance = self.balance_of.read(recipient);
            self.balance_of.write(recipient, current_balance + 1);
            
            // Store score and timestamp
            self.score_of_token.write(token_id, score);
            self.timestamp_of_token.write(token_id, timestamp);
            
            // Increment token ID
            self.next_token_id.write(token_id + 1);
            
            // Emit events
            let zero_address: ContractAddress = Zero::zero();
            self.emit(Transfer { 
                from: zero_address, 
                to: recipient, 
                token_id 
            });
            
            self.emit(ScoreMinted { 
                recipient, 
                token_id, 
                score, 
                timestamp 
            });
            
            token_id
        }

        // View functions
        fn get_score(self: @ContractState, token_id: u256) -> u256 {
            self.score_of_token.read(token_id)
        }

        fn get_timestamp(self: @ContractState, token_id: u256) -> u64 {
            self.timestamp_of_token.read(token_id)
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            self.owner_of.read(token_id)
        }

        fn balance_of(self: @ContractState, owner: ContractAddress) -> u256 {
            self.balance_of.read(owner)
        }

        fn name(self: @ContractState) -> felt252 {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> felt252 {
            self.symbol.read()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            // Return base URI + token_id for metadata
            let uri = self.token_uri_base.read();
            // In production, append token_id and .json
            uri
        }
    }

    #[starknet::interface]
    trait ISpookyScoreNFT<TContractState> {
        fn mint_score_nft(
            ref self: TContractState,
            recipient: ContractAddress,
            score: u256,
            timestamp: u64
        ) -> u256;
        fn get_score(self: @TContractState, token_id: u256) -> u256;
        fn get_timestamp(self: @TContractState, token_id: u256) -> u64;
        fn owner_of(self: @TContractState, token_id: u256) -> ContractAddress;
        fn balance_of(self: @TContractState, owner: ContractAddress) -> u256;
        fn name(self: @TContractState) -> felt252;
        fn symbol(self: @TContractState) -> felt252;
        fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
    }
}
