define(["dojo/_base/lang"], function(lang) {
  var wallet = null;
  var account = null;
  var constants = null;
  var Contract = null;
  
  // NFT Contract Configuration 
  var NFT_CONTRACT_ADDRESS = "0x01a670c9f5766759970aa71b9d754825490d29c35fedfd2cbd63d9b9f4175f2b"; // Deployed on Sepolia
  
  function ensureLibraries() {
    if (constants) return Promise.resolve();
    
    // Lazy-load get-starknet and starknet.js via unpkg
    return Promise.all([
      import('https://unpkg.com/get-starknet-core@3.3.3/dist/index.mjs'),
      import('https://unpkg.com/starknet@latest/dist/index.mjs')
    ]).then(function(mods) {
      var getStarknet = mods[0];
      constants = mods[1].constants;
      Contract = mods[1].Contract;
      
      // Store the connect function
      window.getStarknet = getStarknet.connect;
      return getStarknet;
    });
  }
  
  return {
    connect: function() {
      return ensureLibraries().then(function() { 
        // Use get-starknet to connect to any Starknet wallet (Ready, Argent, Braavos...)
        const starknet = window.getStarknet();
        
        // Enable the wallet and get account
        return starknet.enable({
          modalMode: "alwaysAsk",
          modalTheme: "dark"
        }).then(function() {
          if (!starknet.isConnected) {
            throw new Error('Wallet connection failed');
          }
          
          wallet = starknet;
          account = starknet.account;
          
          if (!account || !account.address) {
            throw new Error('Could not get account address');
          }
          
          console.log('Connected to Starknet wallet:', account.address);
          return { 
            address: account.address,
            account: account
          };
        });
      }).catch(function(error) {
        console.error('Wallet connection error:', error);
        throw error;
      });
    },
    
    isConnected: function() { 
      return !!(account && wallet && wallet.isConnected); 
    },
    
    getAddress: function() {
      return account ? account.address : null;
    },
    
    disconnect: function() {
      wallet = null;
      account = null;
    },
    
    mintScoreNFT: function(score) {
      return ensureLibraries().then(function() {
        if (!account) throw new Error('Wallet not connected');
        
        // Call the mint_score_nft function on the contract
        // Parameters: recipient (address), score (u256), timestamp (u64)
        var timestamp = Math.floor(Date.now() / 1000);
        
        // Construct calldata for u256 score (split into low and high)
        var scoreLow = score;
        var scoreHigh = '0x0';
        
        // Call the contract
        return account.execute({
          contractAddress: NFT_CONTRACT_ADDRESS,
          entrypoint: 'mint_score_nft',
          calldata: [
            account.address,  // recipient
            scoreLow,         // score low
            scoreHigh,        // score high (0 for u256)
            timestamp         // timestamp
          ]
        });
      }).then(function(result) {
        console.log('NFT mint transaction:', result);
        return {
          success: true,
          txHash: result.transaction_hash,
          message: 'NFT minted successfully!'
        };
      }).catch(function(error) {
        console.error('Error minting NFT:', error);
        return {
          success: false,
          error: error.message
        };
      });
    },
    
    submitScore: function(score) {
      // For future leaderboard implementation
      return Promise.resolve({ success: true });
    },
    
    fetchLeaderboard: function() {
      // For future leaderboard implementation
      return Promise.resolve([]);
      return Promise.resolve([]); 
    }
  };
});
