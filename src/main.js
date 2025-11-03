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
  var state = { playing:false, walletConnected:false, currentScore:0 };

  function play(){
    dom.byId('overlay').classList.add('hidden');
    state.playing = true; engine.start();
  }
  function pause(){ state.playing = !state.playing; state.playing? engine.resume(): engine.pause(); }
  function restart(){ engine.reset(); play(); }

  var btnRestart = dom.byId('restart');
  var btnWallet = dom.byId('walletBtn');
  var btnMint = dom.byId('mintBtn');
  var nftMessage = dom.byId('nftMessage');
  var overlayText = dom.byId('overlayText');

  on(btnRestart, 'click', restart);

  // Wallet connection
  var connectBusy = false;
  on(btnWallet, 'click', function(){ 
    if(connectBusy) return; 
    if(state.walletConnected){
      // Already connected, show address
      return;
    }
    connectBusy = true; 
    btnWallet.textContent='Connecting…';
    StarknetWallet.connect()
      .then(function(acct){ 
        state.walletConnected = true;
        hud.setWalletStatus(true, acct.address);
        console.log('Wallet connected:', acct.address);
      })
      .catch(function(err){ 
        console.error('Connection failed:', err);
        btnWallet.textContent='Connect Wallet';
      })
      .finally(function(){ connectBusy=false; });
  });

  // NFT Minting
  on(btnMint, 'click', function(){
    if(!state.walletConnected){
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
  on(document, 'keydown', function(e){
    if(e.keyCode === keys.SPACE || e.keyCode === keys.UP_ARROW){ e.preventDefault(); engine.inputFlap(); }
    else if(e.keyCode === 80){ pause(); } // P
    else if(e.keyCode === 82){ restart(); } // R
  });
  // Touch/Click on canvas
  var flap = lang.hitch(engine, engine.inputFlap);
  on(canvas, 'touchstart', function(e){ e.preventDefault(); flap(); });
  on(canvas, 'click', function(){ flap(); });

  // Game over handler - show mint button if high score and wallet connected
  engine.onGameOver = function(score){
    state.currentScore = score;
    overlayText.textContent = 'Game Over - Score: ' + score;
    
    if(state.walletConnected && score >= 5){
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
  };

  // Start with overlay visible
  baseFx.fadeIn({ node: dom.byId('overlay'), duration: 350 }).play();
});
