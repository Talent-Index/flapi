define([], function(){
  function rand(min,max){ return Math.random()*(max-min)+min; }
  function PipeManager(w,h,cfg,onPass){ this.w=w; this.h=h; this.cfg=Object.assign({},cfg); this.onPass=onPass; this.items=[]; this.spawnT=0; }
  PipeManager.prototype.update = function(dt, speed){
    this.spawnT += dt*1000; if(this.spawnT >= this.cfg.spawnInterval){ this.spawnT=0; this.spawn(); }
    for(var i=this.items.length-1;i>=0;i--){ var p=this.items[i]; p.x -= speed*dt; if(!p.passed && p.x + p.w < p.px){ p.passed=true; this.onPass && this.onPass(); }
      if(p.x + p.w < 0){ this.items.splice(i,1); }
    }
    // Slight difficulty scaling
    this.cfg.gap = Math.max(this.cfg.minGap, this.cfg.gap * this.cfg.difficultyStep);
  };
  PipeManager.prototype.spawn = function(){
    var gap = this.cfg.gap; var topH = rand(50, this.h - 200); var botY = topH + gap; var pipeW=60;
    this.items.push({ x:this.w+10, w:pipeW, top:{ y:0, h:topH }, bottom:{ y:botY, h:this.h-botY }, px:80, passed:false });
  };
  PipeManager.prototype.collides = function(aabb){
    for(var i=0;i<this.items.length;i++){ var p=this.items[i];
      var top = { x:p.x, y:p.top.y, w:p.w, h:p.top.h };
      var bot = { x:p.x, y:p.bottom.y, w:p.w, h:p.bottom.h };
      if(intersects(aabb, top) || intersects(aabb, bot)) return true;
    } return false;
  };
  PipeManager.prototype.draw = function(ctx){
    ctx.save();
    for(var i=0;i<this.items.length;i++){ 
      var p=this.items[i];
      
      // All tombstones glow green
      this.drawGlowingTombstone(ctx, p.x + p.w/2, p.top.h, true); // top
      this.drawGlowingTombstone(ctx, p.x + p.w/2, p.bottom.y, false); // bottom
    }
    ctx.restore();
  };
  
  PipeManager.prototype.drawGravestone = function(ctx, x, y, isTop){
    var w = 50, h = isTop ? y : 800; // Extend to edge like Flappy Bird pipes
    ctx.save();
    ctx.translate(x, isTop ? 0 : y);
    
    // Stone base (tall pipe)
    ctx.fillStyle = "#3a3a42";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.fillRect(-w/2, 0, w, h);
    ctx.strokeRect(-w/2, 0, w, h);
    
    // Rounded tombstone cap at the end
    var capY = h - 50;
    ctx.beginPath();
    ctx.moveTo(-w/2, capY);
    ctx.lineTo(-w/2, h - 15);
    ctx.arcTo(-w/2, h, 0, h, 15);
    ctx.arcTo(w/2, h, w/2, h - 15, 15);
    ctx.lineTo(w/2, capY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Multiple cracks along the tall pipe
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    for (var c = 0; c < Math.floor(h / 100); c++) {
      var crackY = c * 100 + 30;
      ctx.beginPath();
      ctx.moveTo(-w/3, crackY);
      ctx.lineTo(-w/4, crackY + 20);
      ctx.moveTo(w/4, crackY + 10);
      ctx.lineTo(w/3, crackY + 30);
      ctx.stroke();
    }
    
    // RIP text on cap
    ctx.fillStyle = "#8a7a7a";
    ctx.font = "bold 12px serif";
    ctx.textAlign = "center";
    ctx.fillText("R.I.P", 0, h - 25);
    
    // Blood drips on cap
    ctx.strokeStyle = "#8b0000";
    ctx.lineWidth = 2;
    var drips = [
      {x: -w/4, y: h - 20, len: 8},
      {x: w/4, y: h - 22, len: 12},
      {x: 0, y: h - 18, len: 6}
    ];
    for (var i = 0; i < drips.length; i++) {
      ctx.beginPath();
      ctx.moveTo(drips[i].x, drips[i].y);
      ctx.lineTo(drips[i].x, drips[i].y + drips[i].len);
      ctx.stroke();
      // Blood drop
      ctx.fillStyle = "#8b0000";
      ctx.beginPath();
      ctx.arc(drips[i].x, drips[i].y + drips[i].len, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  PipeManager.prototype.drawGlowingTombstone = function(ctx, x, y, isTop){
    var w = 50, h = isTop ? y : 800; // Extend to edge like Flappy Bird pipes
    ctx.save();
    ctx.translate(x, isTop ? 0 : y);
    
    // Glowing lime green stone pipe with glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(50, 255, 100, 0.8)";
    ctx.fillStyle = "#2a4a2a";
    ctx.strokeStyle = "#32ff64";
    ctx.lineWidth = 3;
    ctx.fillRect(-w/2, 0, w, h);
    ctx.strokeRect(-w/2, 0, w, h);
    ctx.shadowBlur = 0;
    
    // Rounded tombstone cap at the end with glow
    var capY = h - 50;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(50, 255, 100, 0.8)";
    ctx.fillStyle = "#2a4a2a";
    ctx.strokeStyle = "#32ff64";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-w/2, capY);
    ctx.lineTo(-w/2, h - 15);
    ctx.arcTo(-w/2, h, 0, h, 15);
    ctx.arcTo(w/2, h, w/2, h - 15, 15);
    ctx.lineTo(w/2, capY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Glowing cracks along the tall pipe
    ctx.strokeStyle = "#50ff80";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(50, 255, 100, 0.6)";
    for (var c = 0; c < Math.floor(h / 100); c++) {
      var crackY = c * 100 + 30;
      ctx.beginPath();
      ctx.moveTo(-w/3, crackY);
      ctx.lineTo(-w/4, crackY + 20);
      ctx.moveTo(w/4, crackY + 10);
      ctx.lineTo(w/3, crackY + 30);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    
    // Glowing text on cap
    ctx.fillStyle = "#32ff64";
    ctx.strokeStyle = "#0a2a0a";
    ctx.lineWidth = 2;
    ctx.font = "bold 12px serif";
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(50, 255, 100, 0.9)";
    ctx.strokeText("TOXIC", 0, h - 25);
    ctx.fillText("TOXIC", 0, h - 25);
    ctx.shadowBlur = 0;
    
    // Animated dripping acid goo on cap
    var t = Date.now();
    ctx.strokeStyle = "#32ff64";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(50, 255, 100, 0.8)";
    var drips = [
      {x: -w/4, y: h - 20, len: Math.sin(t * 0.003) * 3 + 10},
      {x: w/4, y: h - 22, len: Math.sin(t * 0.004 + 1) * 4 + 14},
      {x: 0, y: h - 18, len: Math.sin(t * 0.0035 + 2) * 2 + 8}
    ];
    for (var i = 0; i < drips.length; i++) {
      ctx.beginPath();
      ctx.moveTo(drips[i].x, drips[i].y);
      ctx.lineTo(drips[i].x, drips[i].y + drips[i].len);
      ctx.stroke();
      // Glowing acid drop
      ctx.fillStyle = "#32ff64";
      ctx.beginPath();
      ctx.arc(drips[i].x, drips[i].y + drips[i].len, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Acid puddles pooling on the pipe
    ctx.fillStyle = "rgba(50, 255, 100, 0.4)";
    for (var p = 0; p < Math.floor(h / 150); p++) {
      var poolY = p * 150 + 80;
      ctx.beginPath();
      ctx.ellipse(0, poolY, w/3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  function intersects(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  return PipeManager;
});
