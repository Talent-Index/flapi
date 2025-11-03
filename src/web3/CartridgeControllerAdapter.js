define(["dojo/_base/lang"], function (lang) {
  var controller = null;
  var account = null;
  var constants = null;
  var Contract = null;
  var connect = null;

  // Contract Configuration (Update these with your deployed contract addresses)
  var NFT_CONTRACT_ADDRESS = "0x0"; // Deploy SpookyScoreNFT.cairo and update this
  var GAME_CONTRACT_ADDRESS = "0x0"; // If you have additional game contracts

  function detectWallets() {
    var wallets = [];

    // Check for ArgentX
    if (typeof window !== 'undefined' && window.starknet_argentX) {
      wallets.push({
        id: 'argentx',
        name: 'ArgentX',
        icon: '🦊',
        provider: window.starknet_argentX
      });
    }

    // Check for Braavos
    if (typeof window !== 'undefined' && window.starknet_braavos) {
      wallets.push({
        id: 'braavos',
        name: 'Braavos',
        icon: '🛡️',
        provider: window.starknet_braavos
      });
    }

    // Cartridge Controller (always available)
    wallets.push({
      id: 'cartridge',
      name: 'Cartridge Controller',
      icon: '🎮',
      provider: 'cartridge'
    });

    return wallets;
  }

  function ensureLibraries() {
    if (constants && connect) return Promise.resolve();

    return Promise.all([
      // Load Cartridge Controller
      import('https://unpkg.com/@cartridge/controller@latest/dist/index.mjs'),
      // Load Starknet.js
      import('https://unpkg.com/starknet@latest/dist/index.mjs')
    ]).then(function (mods) {
      var CartridgeController = mods[0].default;
      var starknet = mods[1];

      constants = starknet.constants;
      Contract = starknet.Contract;
      connect = starknet.connect;

      // Initialize Cartridge Controller
      controller = new CartridgeController({
        chains: [{
          id: constants.StarknetChainId.SN_SEPOLIA,
          rpcUrl: 'https://api.cartridge.gg/x/starknet/sepolia'
        }],
        defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
        policies: [
          {
            target: NFT_CONTRACT_ADDRESS,
            method: "mint_score_nft"
          }
        ]
      });
    }).catch(function (error) {
      console.error('Failed to load wallet libraries:', error);
      throw error;
    });
  }

  function connectCartridge() {
    return ensureLibraries().then(function () {
      return controller.connect();
    });
  }

  function connectStandardWallet(wallet) {
    return ensureLibraries().then(function () {
      if (!wallet.provider) {
        throw new Error(wallet.name + ' not installed');
      }

      return wallet.provider.enable({ starknetVersion: 'v5' });
    }).then(function (walletAccount) {
      if (!walletAccount || walletAccount.length === 0) {
        throw new Error('No wallet accounts available');
      }

      // Create account instance
      return connect({
        nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        accountAddress: walletAccount[0],
        signer: wallet.provider.account
      });
    });
  }

  function showWalletSelector() {
    return new Promise(function (resolve, reject) {
      var wallets = detectWallets();

      if (wallets.length === 0) {
        reject(new Error('No Starknet wallets detected. Please install ArgentX, Braavos, or use Cartridge Controller.'));
        return;
      }

      // Create wallet selection modal
      var modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
        align-items: center; justify-content: center;
      `;

      var content = document.createElement('div');
      content.style.cssText = `
        background: #2d1b3d; padding: 24px; border-radius: 12px; 
        border: 1px solid rgba(255,255,255,0.15); min-width: 300px; text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      `;

      var title = document.createElement('h3');
      title.textContent = 'Connect to Starknet';
      title.style.cssText = 'color: #f5f5f5; margin: 0 0 20px 0; font-size: 18px;';

      var subtitle = document.createElement('p');
      subtitle.textContent = 'Choose your wallet to connect to Starknet Sepolia';
      subtitle.style.cssText = 'color: #bbb; margin: 0 0 20px 0; font-size: 14px;';

      content.appendChild(title);
      content.appendChild(subtitle);

      // Add wallet buttons
      wallets.forEach(function (wallet) {
        var button = document.createElement('button');
        button.textContent = wallet.icon + ' ' + wallet.name;
        button.style.cssText = `
          width: 100%; padding: 12px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08); color: #f5f5f5; border-radius: 8px;
          cursor: pointer; font-size: 14px; display: flex; align-items: center;
          justify-content: center; gap: 8px;
        `;

        button.addEventListener('mouseover', function () {
          button.style.background = 'rgba(255,255,255,0.15)';
        });

        button.addEventListener('mouseout', function () {
          button.style.background = 'rgba(255,255,255,0.08)';
        });

        button.addEventListener('click', function () {
          document.body.removeChild(modal);

          var connectPromise;
          if (wallet.id === 'cartridge') {
            connectPromise = connectCartridge();
          } else {
            connectPromise = connectStandardWallet(wallet);
          }

          connectPromise
            .then(function (account) {
              resolve({
                account: account,
                wallet: wallet.name
              });
            })
            .catch(function (error) {
              reject(error);
            });
        });

        content.appendChild(button);
      });

      // Add close button
      var closeButton = document.createElement('button');
      closeButton.textContent = 'Cancel';
      closeButton.style.cssText = `
        margin-top: 16px; padding: 8px 16px; border: 1px solid rgba(255,255,255,0.3);
        background: transparent; color: #bbb; border-radius: 6px; cursor: pointer;
      `;

      closeButton.addEventListener('click', function () {
        document.body.removeChild(modal);
        reject(new Error('Connection cancelled'));
      });

      content.appendChild(closeButton);
      modal.appendChild(content);
      document.body.appendChild(modal);

      // Close on background click
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
          reject(new Error('Connection cancelled'));
        }
      });
    });
  }

  return {
    connect: function () {
      return showWalletSelector().then(function (result) {
        account = result.account;
        console.log('Connected to Starknet via', result.wallet + ':', account.address);
        return {
          address: account.address,
          wallet: result.wallet
        };
      });
    },

    isConnected: function () {
      return !!account;
    },

    getAddress: function () {
      return account ? account.address : null;
    },

    disconnect: function () {
      account = null;
      console.log('Wallet disconnected');
    },

    getNetwork: function () {
      return 'sepolia-testnet';
    },

    mintScoreNFT: function (score) {
      if (!account) return Promise.reject(new Error('Wallet not connected'));

      console.log('Minting Spooky NFT for score:', score);

      var timestamp = Math.floor(Date.now() / 1000);

      return account.execute([
        {
          contractAddress: NFT_CONTRACT_ADDRESS,
          entrypoint: 'mint_score_nft',
          calldata: [
            account.address, // recipient
            score, // score low
            0, // score high (u256)
            timestamp // timestamp
          ]
        }
      ]).then(function (result) {
        console.log('NFT Minted! Transaction:', result.transaction_hash);
        return {
          success: true,
          txHash: result.transaction_hash,
          message: 'Spooky NFT minted successfully! 🎃'
        };
      }).catch(function (err) {
        console.error('NFT Minting failed:', err);
        return {
          success: false,
          error: err.message || 'Failed to mint NFT'
        };
      });
    },

    submitScore: function (score) {
      // For future leaderboard implementation
      return Promise.resolve({ txHash: '0x0' });
    },

    fetchLeaderboard: function () {
      return Promise.resolve([]);
    },

    // Utility functions
    getAvailableWallets: function () {
      return detectWallets();
    },

    getSupportedNetworks: function () {
      return ['starknet-sepolia'];
    }
  };
});