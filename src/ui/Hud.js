define(["dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/_base/lang", "dojo/_base/fx", "dojo/fx", "app/game/Effects"], function (dom, domConstruct, domClass, lang, baseFx, fx, Effects) {
  function Hud(scoreNode, bestNode, walletNode, livesNode) {
    this.nodes = { score: scoreNode, best: bestNode, overlay: dom.byId('overlay'), wallet: walletNode, lives: livesNode };
  }
  Hud.prototype.setScore = function (v, animate) {
    this.nodes.score.textContent = v;
    if (animate) {
      baseFx.animateProperty({ node: this.nodes.score, duration: 150, properties: { fontSize: { start: 28, end: 36 } } }).play();
      baseFx.animateProperty({ node: this.nodes.score, duration: 150, delay: 150, properties: { fontSize: { start: 36, end: 28 } } }).play();
    }
  };
  Hud.prototype.setBest = function (v, animate) {
    this.nodes.best.textContent = 'Best: ' + v;
    if (animate) {
      baseFx.animateProperty({ node: this.nodes.best, duration: 200, properties: { opacity: { start: 1, end: 0.3 } } }).play();
      baseFx.animateProperty({ node: this.nodes.best, duration: 200, delay: 200, properties: { opacity: { start: 0.3, end: 1 } } }).play();
    }
  };
  Hud.prototype.setLives = function (v, animate) {
    if (!this.nodes.lives) return;
    var hearts = '';
    for (var i = 0; i < v; i++) {
      hearts += '❤️';
    }
    this.nodes.lives.textContent = hearts || '💔';
    if (animate) {
      baseFx.animateProperty({ node: this.nodes.lives, duration: 150, properties: { fontSize: { start: 16, end: 24 } } }).play();
      baseFx.animateProperty({ node: this.nodes.lives, duration: 150, delay: 150, properties: { fontSize: { start: 24, end: 16 } } }).play();
    }
  };
  Hud.prototype.setWalletStatus = function (connected, address) {
    if (!this.nodes.wallet) return;
    if (connected) {
      var shortAddr = address.slice(0, 6) + '...' + address.slice(-4);
      this.nodes.wallet.textContent = ' ' + shortAddr;
      this.nodes.wallet.style.color = '#32ff64';
    } else {
      this.nodes.wallet.textContent = 'Connect Wallet';
      this.nodes.wallet.style.color = '#ffffff';
    }
  };
  Hud.prototype.flashGameOver = function (score, best) {
    var n = this.nodes.overlay;
    domClass.remove(n, 'hidden');
    Effects.fadeIn(n, 200).play();
  };
  return Hud;
});
