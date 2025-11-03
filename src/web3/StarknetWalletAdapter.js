define(["dojo/_base/lang"], function(lang){
  var wallet = null; 
  var account = null; 
  var constants = null;
  var Contract = null;
  
  // NFT Contract Configuration 
  var NFT_CONTRACT_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"; // Placeholder
  
  function ensureLibraries(){
    if(constants) return Promise.resolve();
    // Lazy-load get-starknet and starknet.js via unpkg
    return Promise.all([
      import('https://unpkg.com/get-starknet-core@3.3.3/dist/index.mjs'),
      import('https://unpkg.com/starknet@latest/dist/index.mjs')
    ]).then(function(mods){
      var getStarknet = mods[0];
      constants = mods[1].constants;
      Contract = mods[1].Contract;
      
      // Store the connect function
      window.getStarknet = getStarknet.connect;
      return getStarknet;
    });
  }
  
  return {
    connect: function(){
      return ensureLibraries().then(function(){ 
        // Use get-starknet to connect to any Starknet wallet (Ready, Argent, Braavos...)
        return window.getStarknet({
          modalMode: "alwaysAsk",
          modalTheme: "dark"
        });
      }).then(function(starknetWallet){ 
        if(!starknetWallet) throw new Error('No Starknet wallet found');
        
        wallet = starknetWallet;
        
        // Enable the wallet and get account
        return wallet.enable({ 
          starknetVersion: "v5"
        });
      }).then(function(addresses){
        if(!addresses || addresses.length === 0) {
          throw new Error('Wallet connection failed');
        }
        
        // Get the account object
        account = wallet.account;
        
        console.log('Connected to Starknet wallet:', addresses[0]);
        return { address: addresses[0] }; 
      });
    },
    
    isConnected: function(){ 
      return !!account && wallet && wallet.isConnected; 
    },
    
    getAddress: function(){
      return account ? account.address : null;
    },
    
    disconnect: function(){
      account = null;
      wallet = null;
    },
    
    mintScoreNFT: function(score){
      return ensureLibraries().then(function(){
        if(!account) throw new Error('Wallet not connected');
        
        console.log('Minting Spooky NFT for score:', score);
        
        // Call the mint_score_nft function on the contract
        // Parameters: recipient (address), score (u256), timestamp (u64)
        var timestamp = Math.floor(Date.now() / 1000);
        
        // Construct calldata for u256 score (split into low and high)
        var scoreLow = score;
        var scoreHigh = 0;
        
        return account.execute([
          {
            contractAddress: NFT_CONTRACT_ADDRESS,
            entrypoint: 'mint_score_nft',
            calldata: [
              account.address, // recipient
              scoreLow,        // score low (u128)
              scoreHigh,       // score high (u128) - u256 is split into two u128
              timestamp        // timestamp (u64)
            ]
          }
        ]);
      }).then(function(result){
        console.log('NFT Minted! Transaction:', result.transaction_hash);
        return {
          success: true,
          txHash: result.transaction_hash,
          message: 'Spooky NFT minted successfully! 🎃'
        };
      }).catch(function(err){
        console.error('NFT Minting failed:', err);
        return {
          success: false,
          error: err.message || 'Minting failed'
        };
      });
    },
    
    submitScore: function(score){
      // Submit score to leaderboard contract (if different from NFT contract)
      return ensureLibraries().then(function(){
        if(!account) throw new Error('Not connected');
        console.log('Submitting score to leaderboard:', score);
        // Implement leaderboard submission if needed
        return { txHash: '0x0' }; 
      });
    },
    
    fetchLeaderboard: function(){ 
      return Promise.resolve([]); 
    }
  };
});
