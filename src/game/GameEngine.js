define([
  "dojo/_base/lang","dojo/_base/declare","dojo/_base/fx","dojo/on","app/game/Player","app/game/PipeManager","app/game/AudioManager"
], function(lang, declare, baseFx, on, Player, PipeManager, AudioManager){
  var GameEngine = declare(null, {
    constructor: function(canvas, ctx, config, hud){
      this.canvas = canvas; this.ctx = ctx; this.cfg = config; this.hud = hud;
      this.audio = new AudioManager();
      this.burning = false;
      this.burnProgress = 0;
      this.lives = 1;
      this.hearts = [];
      this.obstaclesPassed = 0;
      this.reset();
    },
    reset: function(){
      this.time = { acc:0, last:0, step:1/60 };
      this.running = false; this.score = 0; this.best = Number(localStorage.getItem('best')||0);
      this.player = new Player(80, this.canvas.height/2, this.cfg.physics);
      this.pipes = new PipeManager(this.canvas.width, this.canvas.height, this.cfg.pipes, lang.hitch(this, this.onPass));
      this.hud.setScore(0); this.hud.setBest(this.best);
      this.audio.reset();
      this.burning = false;
      this.burnProgress = 0;
      this.lives = 1;
      this.hearts = [];
      this.obstaclesPassed = 0;
      this.hud.setLives(1);
    },
    onPass: function(){ 
      this.score++; 
      this.obstaclesPassed++;
      this.hud.setScore(this.score, true); 
      if (this.score === 10) {
        this.audio.playMilestone();
      }
      
      // Spawn heart every 7 obstacles
      if (this.obstaclesPassed % 7 === 0) {
        this.spawnHeart();
      }
    },
    spawnHeart: function(){
      // Spawn heart in the middle of the screen vertically
      this.hearts.push({
        x: this.canvas.width + 50,
        y: this.canvas.height / 2,
        w: 30,
        h: 30,
        collected: false
      });
    },
    start: function(){ if(this.running) return; this.running = true; this.time.last = performance.now(); this.audio.resume(); this.loop(); },
    pause: function(){ this.running=false; },
    resume: function(){ if(!this.running){ this.running=true; this.time.last=performance.now(); this.audio.resume(); this.loop(); } },
    inputFlap: function(){ if(!this.running){ this.start(); } this.player.flap(); this.audio.playFlap(); },
    loop: function(){ if(!this.running) return; var now = performance.now(); var dt = (now - this.time.last)/1000; this.time.last = now; this.time.acc += dt; var step = this.time.step;
      while(this.time.acc >= step){ this.update(step); this.time.acc -= step; }
      this.render(); requestAnimationFrame(this.loop.bind(this)); },
    update: function(dt){
      if (this.burning) {
        this.burnProgress += dt * 2;
        if (this.burnProgress >= 1) {
          this.gameOver();
        }
        return;
      }
      
      this.player.update(dt, this.canvas.height);
      this.pipes.update(dt, this.cfg.pipes.speed);
      this.audio.update(dt);
      
      // Update hearts
      for (var i = this.hearts.length - 1; i >= 0; i--) {
        var heart = this.hearts[i];
        if (!heart.collected) {
          heart.x -= this.cfg.pipes.speed * dt;
          
          // Check collision with player
          var playerAABB = this.player.getAABB();
          if (heart.x < playerAABB.x + playerAABB.w &&
              heart.x + heart.w > playerAABB.x &&
              heart.y < playerAABB.y + playerAABB.h &&
              heart.y + heart.h > playerAABB.y) {
            this.collectHeart(i);
          }
          
          // Remove if off screen
          if (heart.x + heart.w < 0) {
            this.hearts.splice(i, 1);
          }
        }
      }
      
      // Check lava floor collision
      if (this.player.y >= this.canvas.height - 30 - this.player.r) {
        this.startBurning();
      }
      
      // Check pipe collision - lose a life instead of game over
      if(this.pipes.collides(this.player.getAABB())){ 
        this.loseLife(); 
      }
    },
    collectHeart: function(index){
      this.hearts.splice(index, 1);
      this.lives++;
      this.hud.setLives(this.lives);
      this.audio.playMilestone(); // Play happy sound
      console.log('Heart collected! Lives:', this.lives);
    },
    loseLife: function(){
      if (this.lives <= 0) return; // Already dead
      
      this.lives--;
      this.hud.setLives(this.lives);
      this.audio.playDeath();
      
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        // Flash effect and reposition player
        this.player.y = this.canvas.height / 2;
        this.player.vy = 0;
        console.log('Life lost! Lives remaining:', this.lives);
      }
    },
    startBurning: function(){
      if (!this.burning) {
        this.burning = true;
        this.burnProgress = 0;
        this.running = false;
        this.audio.playBurn();
      }
    },
    gameOver: function(){
      this.running=false; 
      this.audio.playDeath();
      if(this.score>this.best){ this.best=this.score; localStorage.setItem('best', String(this.best)); this.hud.setBest(this.best,true); }
      this.hud.flashGameOver(this.score, this.best);
      
      // Trigger callback if set (for NFT minting integration)
      if(this.onGameOver){
        this.onGameOver(this.score);
      }
    },
    render: function(){ 
      var ctx=this.ctx; 
      var w=this.canvas.width, h=this.canvas.height; 
      ctx.clearRect(0,0,w,h);
      
      // Dark vampire night background - deep purple to black gradient
      var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#1a0a2e");
      bgGrad.addColorStop(0.5, "#2d1b3d");
      bgGrad.addColorStop(1, "#0f0618");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      
      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      var starPositions = [[50, 40], [120, 80], [200, 50], [280, 90], [310, 30], [80, 150], [250, 140], [180, 180]];
      for (var i = 0; i < starPositions.length; i++) {
        ctx.beginPath();
        ctx.arc(starPositions[i][0], starPositions[i][1], 1, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Moon with green goo dripping
      var moonX = w * 0.75, moonY = h * 0.2, moonR = 40;
      
      // Moon glow
      var moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.3, moonX, moonY, moonR * 2);
      moonGlow.addColorStop(0, "rgba(200, 200, 150, 0.15)");
      moonGlow.addColorStop(1, "rgba(200, 200, 150, 0)");
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - moonR * 2, moonY - moonR * 2, moonR * 4, moonR * 4);
      
      // Moon body
      ctx.fillStyle = "#e8e8c8";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon craters
      ctx.fillStyle = "rgba(180, 180, 160, 0.4)";
      ctx.beginPath();
      ctx.arc(moonX - 10, moonY - 8, 8, 0, Math.PI * 2);
      ctx.arc(moonX + 12, moonY + 5, 6, 0, Math.PI * 2);
      ctx.arc(moonX - 5, moonY + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Green goo dripping from moon
      var t = Date.now();
      var drips = [
        { x: moonX - 15, len: Math.sin(t * 0.002) * 10 + 35, delay: 0 },
        { x: moonX + 10, len: Math.sin(t * 0.0025 + 1) * 12 + 40, delay: 0.5 },
        { x: moonX, len: Math.sin(t * 0.003 + 2) * 8 + 30, delay: 1 }
      ];
      
      for (var d = 0; d < drips.length; d++) {
        var gooGrad = ctx.createLinearGradient(drips[d].x, moonY + moonR, drips[d].x, moonY + moonR + drips[d].len);
        gooGrad.addColorStop(0, "rgba(50, 255, 100, 0.8)");
        gooGrad.addColorStop(1, "rgba(50, 255, 100, 0.2)");
        ctx.fillStyle = gooGrad;
        ctx.beginPath();
        ctx.moveTo(drips[d].x - 3, moonY + moonR);
        ctx.lineTo(drips[d].x - 2, moonY + moonR + drips[d].len - 4);
        ctx.lineTo(drips[d].x, moonY + moonR + drips[d].len);
        ctx.lineTo(drips[d].x + 2, moonY + moonR + drips[d].len - 4);
        ctx.lineTo(drips[d].x + 3, moonY + moonR);
        ctx.closePath();
        ctx.fill();
        
        // Drip tip
        ctx.fillStyle = "rgba(50, 255, 100, 0.9)";
        ctx.beginPath();
        ctx.arc(drips[d].x, moonY + moonR + drips[d].len, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Fog layers
      ctx.fillStyle = "rgba(80, 50, 100, 0.15)";
      ctx.beginPath();
      for (var f = 0; f < w; f += 30) {
        var fogY = h * 0.7 + Math.sin(f * 0.05 + t * 0.0005) * 20;
        if (f === 0) ctx.moveTo(f, fogY);
        else ctx.lineTo(f, fogY);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      
      this.pipes.draw(ctx);
      
      // Draw hearts
      for (var i = 0; i < this.hearts.length; i++) {
        this.drawHeart(ctx, this.hearts[i]);
      }
      
      if (this.burning) {
        this.drawBurningPlayer(ctx);
      } else {
        this.player.draw(ctx);
      }
      
      // Glowing red lava floor
      ctx.fillStyle = "#1a0a0a";
      ctx.fillRect(0, h - 30, w, 30);
      
      // Lava glow gradient on top
      var lavaGrad = ctx.createLinearGradient(0, h - 30, 0, h - 15);
      lavaGrad.addColorStop(0, "rgba(255, 80, 0, 0.8)");
      lavaGrad.addColorStop(0.5, "rgba(255, 120, 0, 0.4)");
      lavaGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, h - 30, w, 15);
      
      // Glowing lava surface line
      ctx.strokeStyle = "#ff5500";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 80, 0, 0.9)";
      ctx.beginPath();
      ctx.moveTo(0, h - 30);
      ctx.lineTo(w, h - 30);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Bubbling lava pools with glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255, 80, 0, 0.7)";
      for (var bp = 0; bp < 5; bp++) {
        var bpX = (bp * 80 + t * 0.05) % w;
        var bubble = Math.sin(t * 0.003 + bp) * 2;
        
        // Main lava pool
        ctx.fillStyle = "rgba(255, 80, 0, 0.6)";
        ctx.beginPath();
        ctx.ellipse(bpX, h - 15 + bubble, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot spots
        ctx.fillStyle = "rgba(255, 200, 0, 0.8)";
        ctx.beginPath();
        ctx.ellipse(bpX, h - 15 + bubble, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Lava bubbles rising
        if (Math.random() > 0.96) {
          ctx.fillStyle = "rgba(255, 100, 0, 0.9)";
          ctx.beginPath();
          ctx.arc(bpX + Math.random() * 10 - 5, h - 25, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    },
    drawBurningPlayer: function(ctx){
      var x = this.player.x;
      var y = this.player.y;
      var r = this.player.r;
      var progress = this.burnProgress;
      
      ctx.save();
      ctx.translate(x, y);
      
      // Flames engulfing the pumpkin
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(255, 80, 0, 0.9)";
      
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var flameH = (Math.sin(Date.now() * 0.01 + i) * 10 + 15) * (1 - progress * 0.5);
        var fx = Math.cos(angle) * r;
        var fy = Math.sin(angle) * r;
        
        var flameGrad = ctx.createLinearGradient(fx, fy, fx, fy - flameH);
        flameGrad.addColorStop(0, "rgba(255, 80, 0, 0.9)");
        flameGrad.addColorStop(0.5, "rgba(255, 150, 0, 0.7)");
        flameGrad.addColorStop(1, "rgba(255, 200, 0, 0)");
        ctx.fillStyle = flameGrad;
        
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx - 5, fy - flameH);
        ctx.lineTo(fx + 5, fy - flameH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      
      // Charred pumpkin
      var charAmount = Math.min(progress, 1);
      var pumpkinColor = this.lerpColor([255, 140, 66], [30, 20, 20], charAmount);
      ctx.fillStyle = "rgb(" + pumpkinColor[0] + "," + pumpkinColor[1] + "," + pumpkinColor[2] + ")";
      ctx.strokeStyle = "rgba(0, 0, 0, " + (0.5 + charAmount * 0.5) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.1, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Fading eyes glow
      if (progress < 0.7) {
        ctx.fillStyle = "rgba(255, 200, 0, " + (1 - progress * 1.4) + ")";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 200, 0, " + (0.5 - progress * 0.7) + ")";
        // Left eye
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.25);
        ctx.lineTo(-r * 0.25, -r * 0.5);
        ctx.lineTo(-r * 0.15, -r * 0.25);
        ctx.closePath();
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.moveTo(r * 0.15, -r * 0.25);
        ctx.lineTo(r * 0.25, -r * 0.5);
        ctx.lineTo(r * 0.5, -r * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Smoke particles rising
      ctx.fillStyle = "rgba(50, 50, 50, " + (0.6 - progress * 0.3) + ")";
      for (var s = 0; s < 5; s++) {
        var smokeY = -r - progress * 30 - s * 8;
        var smokeX = (Math.sin(Date.now() * 0.002 + s) * 5);
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 3 + s, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    },
    lerpColor: function(c1, c2, t){
      return [
        Math.floor(c1[0] + (c2[0] - c1[0]) * t),
        Math.floor(c1[1] + (c2[1] - c1[1]) * t),
        Math.floor(c1[2] + (c2[2]) - c1[2]) * t)
      ];
    },
    drawHeart: function(ctx, heart){
      ctx.save();
      ctx.translate(heart.x + heart.w / 2, heart.y + heart.h / 2);
      
      // Pulsing animation
      var pulse = Math.sin(Date.now() * 0.008) * 0.15 + 1;
      ctx.scale(pulse, pulse);
      
      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(255, 50, 100, 0.8)";
      
      // Draw heart shape
      ctx.fillStyle = "#ff3366";
      ctx.beginPath();
      var size = 12;
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.3, -size, -size * 0.8, 0, -size * 0.3);
      ctx.bezierCurveTo(size, -size * 0.8, size, -size * 0.3, 0, size * 0.3);
      ctx.fill();
      
      // Bright center
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffaacc";
      ctx.beginPath();
      ctx.arc(0, -size * 0.2, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  });
  return GameEngine;
});
