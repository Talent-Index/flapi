define([
  "dojo/dom","dojo/dom-construct","dojo/on","dojo/keys","dojo/_base/lang","dojo/_base/fx","dojo/fx",
  "app/config","app/game/GameEngine","app/ui/Hud","app/web3/StarknetWalletAdapter"
], function(dom, domConstruct, on, keys, lang, baseFx, fx, config, GameEngine, Hud, StarknetWallet){
  var canvas = dom.byId("game");
  var ctx = canvas.getContext("2d");
  var scoreNode = dom.byId("score");
  var bestNode = dom.byId("best");
  var walletNode = dom.byId("walletBtn");
  var hud = new Hud(scoreNode, bestNode, walletNode);
  var engine = new GameEngine(canvas, ctx, config, hud);
  var state = { playing: false, walletConnected: false, currentScore: 0 };

  function showStartMenu() {
    dom.byId('startMenu').classList.remove('hidden');
    dom.byId('overlay').classList.add('hidden');
    state.playing = false;
    engine.pause();
    dom.byId('btnPause').textContent = 'Pause';
  }

  function play() {
    dom.byId('startMenu').classList.add('hidden');
    dom.byId('overlay').classList.add('hidden');
    state.playing = true;
    dom.byId('btnPause').textContent = 'Pause';
    if (engine.running) {
      // Resume if paused
      engine.resume();
    } else {
      // Start new game
      engine.start();
    }
  }

  function pause() {
    if (state.playing) {
      // Pause the game and show start menu
      state.playing = false;
      engine.pause();
      dom.byId('startMenu').classList.remove('hidden');
      dom.byId('btnPause').textContent = 'Resume';
    } else {
      // Resume the game and hide start menu
      state.playing = true;
      engine.resume();
      dom.byId('startMenu').classList.add('hidden');
      dom.byId('btnPause').textContent = 'Pause';
    }
  }

  function restart() {
    engine.reset();
    play();
  }

  var btnPlay = dom.byId('btnPlay');
  var btnPause = dom.byId('btnPause');
  var btnRestart = dom.byId('btnRestart');
  var btnRestartGame = dom.byId('restart');
  var btnBackToMenu = dom.byId('backToMenu');
  var btnWallet = dom.byId('walletBtn');
  var btnMint = dom.byId('mintBtn');
  var nftMessage = dom.byId('nftMessage');
  var overlayText = dom.byId('overlayText');

  on(btnPlay, 'click', play);
  on(btnPause, 'click', pause);
  on(btnRestart, 'click', restart);
  on(btnRestartGame, 'click', restart);
  on(btnBackToMenu, 'click', showStartMenu);

  // Wallet connection
  var connectBusy = false;
  on(btnWallet, 'click', function () {
    if (connectBusy) return;

    if (state.walletConnected) {
      // Already connected, show disconnect option or wallet info
      var address = Cartridge.getAddress();
      if (address) {
        var shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
        alert('Connected: ' + shortAddress + '\n\nClick OK to disconnect.');
        Cartridge.disconnect();
        state.walletConnected = false;
        hud.setWalletStatus(false, null);
        btnWallet.textContent = 'Connect Starknet Wallet';
      }
      return;
    }
    connectBusy = true; 
    btnWallet.textContent='Connecting…';
    StarknetWallet.connect()
      .then(function(acct){ 
        state.walletConnected = true;
        hud.setWalletStatus(true, result.address);

        var shortAddress = result.address.slice(0, 6) + '...' + result.address.slice(-4);
        btnWallet.textContent = shortAddress;

        console.log('Wallet connected via', result.wallet + ':', result.address);

        // Show success message
        var successMsg = document.createElement('div');
        successMsg.textContent = '✓ Connected to ' + result.wallet;
        successMsg.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #32ff64; 
          color: #000; padding: 12px 20px; border-radius: 8px; z-index: 9999;
          font-weight: bold; font-size: 14px;
        `;
        document.body.appendChild(successMsg);

        setTimeout(function () {
          if (successMsg.parentNode) {
            document.body.removeChild(successMsg);
          }
        }, 3000);
      })
      .catch(function (err) {
        console.error('Connection failed:', err);
        btnWallet.textContent = 'Connect Starknet Wallet';

        // Show error message
        var errorMsg = err.message || 'Failed to connect wallet';
        if (errorMsg.includes('cancelled') || errorMsg.includes('rejected')) {
          return; // Don't show error for user cancellation
        }

        var errorDiv = document.createElement('div');
        errorDiv.textContent = '⚠ ' + errorMsg;
        errorDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #ff5500; 
          color: #fff; padding: 12px 20px; border-radius: 8px; z-index: 9999;
          font-weight: bold; font-size: 14px; max-width: 300px;
        `;
        document.body.appendChild(errorDiv);

        setTimeout(function () {
          if (errorDiv.parentNode) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      })
      .finally(function () {
        connectBusy = false;
      });
  });

  // NFT Minting
  on(btnMint, 'click', function () {
    if (!state.walletConnected) {
      nftMessage.textContent = 'Please connect wallet first!';
      nftMessage.style.display = 'block';
      nftMessage.style.color = '#ff5500';
      return;
    }
    btnMint.textContent = 'Minting...';
    btnMint.disabled = true;
    StarknetWallet.mintScoreNFT(state.currentScore)
      .then(function(result){
        if(result.success){
          nftMessage.textContent = result.message + ' TX: ' + result.txHash.slice(0, 10) + '...';
          nftMessage.style.color = '#32ff64';
          btnMint.style.display = 'none';
        } else {
          nftMessage.textContent = 'Minting failed: ' + result.error;
          nftMessage.style.color = '#ff5500';
          btnMint.disabled = false;
          btnMint.textContent = 'Mint NFT 🎃';
        }
        nftMessage.style.display = 'block';
      });
  });

  // Keyboard
  on(document, 'keydown', function (e) {
    if (e.keyCode === keys.SPACE || e.keyCode === keys.UP_ARROW) {
      e.preventDefault();
      engine.inputFlap();
    }
    else if (e.keyCode === 80 || e.keyCode === 13) { // P key or Enter key
      e.preventDefault();
      if (state.playing !== undefined) { // Only pause if game has been initialized
        pause();
      }
    }
    else if (e.keyCode === 82) { restart(); } // R
  });
  // Touch/Click on canvas
  var flap = lang.hitch(engine, engine.inputFlap);
  on(canvas, 'touchstart', function (e) { e.preventDefault(); flap(); });
  on(canvas, 'click', function () { flap(); });

  // Game over handler - show game over overlay with mint option
  engine.onGameOver = function (score) {
    state.currentScore = score;
    state.playing = false;
    overlayText.textContent = 'Game Over - Score: ' + score;

    if (state.walletConnected && score >= 10) {
      btnMint.style.display = 'block';
      btnMint.disabled = false;
      btnMint.textContent = 'Mint NFT 🎃';
      nftMessage.textContent = 'High score! Mint your achievement as an NFT';
      nftMessage.style.color = '#32ff64';
      nftMessage.style.display = 'block';
    } else {
      btnMint.style.display = 'none';
      nftMessage.style.display = 'none';
    }

    // Show game over overlay
    dom.byId('overlay').classList.remove('hidden');
  };

  // Start with main menu visible
  dom.byId('startMenu').classList.remove('hidden');
  dom.byId('overlay').classList.add('hidden');
});
