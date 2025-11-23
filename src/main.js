define([
  "dojo/dom", "dojo/dom-construct", "dojo/on", "dojo/keys", "dojo/_base/lang", "dojo/_base/fx", "dojo/fx",
  "app/config", "app/game/GameEngine", "app/ui/Hud", "app/web3/CartridgeControllerAdapter"
], function (dom, domConstruct, on, keys, lang, baseFx, fx, config, GameEngine, Hud, Cartridge) {
  var canvas = dom.byId("game");
  var ctx = canvas.getContext("2d");
  var scoreNode = dom.byId("score");
  var bestNode = dom.byId("best");
  var livesNode = dom.byId("lives");
  var hud = new Hud(scoreNode, bestNode, null, livesNode);
  var engine = new GameEngine(canvas, ctx, config, hud);
  var state = { playing: false, walletConnected: false, currentScore: 0 };

  function showStartMenu() {
    dom.byId('startMenu').classList.remove('hidden');
    dom.byId('overlay').classList.add('hidden');
    state.playing = false;
    engine.pause();
    engine.audio.pauseOwls();
    dom.byId('btnPause').textContent = 'Pause';
  }

  function play() {
    dom.byId('startMenu').classList.add('hidden');
    dom.byId('overlay').classList.add('hidden');
    state.playing = true;
    engine.audio.resumeOwls();
    dom.byId('btnPause').textContent = 'Pause';
    if (engine.running) {
      engine.resume();
    } else {
      engine.start();
    }
  }

  function pause() {
    if (state.playing) {
      state.playing = false;
      engine.pause();
      engine.audio.pauseOwls();
      dom.byId('startMenu').classList.remove('hidden');
      dom.byId('btnPause').textContent = 'Resume';
    } else {
      state.playing = true;
      engine.resume();
      engine.audio.resumeOwls();
      dom.byId('startMenu').classList.add('hidden');
      dom.byId('btnPause').textContent = 'Pause';
    }
  }

  function restart() { engine.reset(); play(); }

  var btnPlay = dom.byId('btnPlay');
  var btnPause = dom.byId('btnPause');
  var btnRestart = dom.byId('btnRestart');
  var btnRestartGame = dom.byId('restart');
  var btnBackToMenu = dom.byId('backToMenu');
  var btnMint = dom.byId('mintBtn');
  var nftMessage = dom.byId('nftMessage');
  var overlayText = dom.byId('overlayText');

  on(btnPlay, 'click', play);
  on(btnPause, 'click', pause);
  on(btnRestart, 'click', restart);
  on(btnRestartGame, 'click', restart);
  on(btnBackToMenu, 'click', showStartMenu);

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
    Cartridge.mintScoreNFT(state.currentScore)
      .then(function (result) {
        if (result.success) {
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
      if (state.playing !== undefined) {
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
