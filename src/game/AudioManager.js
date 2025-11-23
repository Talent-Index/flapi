define([], function () {
  function AudioManager() {
    this.ctx = null;
    this.sounds = {};
    this.ambientNode = null;
    this.soundtrackNode = null;
    this.owlTimer = 0;
    this.owlInterval = 15000 + Math.random() * 10000; // 15-25 seconds between owl sounds
    this.milestone10Played = false;
    this.owlsPaused = false;
    this.owlPlaying = false;
    this.init();
  }

  AudioManager.prototype.init = function () {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.generateSounds();
      // Ambient sounds disabled
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  };

  AudioManager.prototype.generateSounds = function () {
    if (!this.ctx) return;

    // Generate procedural sounds using Web Audio API
    this.sounds.flap = this.createFlapSound();
    this.sounds.death = this.createDeathSound();
    this.sounds.milestone = this.createMilestoneSound();
    this.sounds.owl = this.createOwlSound();
    this.sounds.burn = this.createBurnSound();
  };

  AudioManager.prototype.createFlapSound = function () {
    // Quick whoosh for flap
    return function (ctx) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    };
  };

  AudioManager.prototype.createDeathSound = function () {
    // Dramatic death sound - descending eerie tone with distortion
    return function (ctx) {
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.frequency.setValueAtTime(400, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.2);
      osc2.frequency.setValueAtTime(200, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    };
  };

  AudioManager.prototype.createMilestoneSound = function () {
    // Triumphant eerie bell-like sound for score 10
    return function (ctx) {
      for (var i = 0; i < 3; i++) {
        (function (delay) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);

          var baseFreq = 523.25; // C5
          osc.frequency.setValueAtTime(baseFreq * (i === 0 ? 1 : i === 1 ? 1.25 : 1.5), ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.8);

          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.8);
        })(i * 0.15);
      }
    };
  };

  AudioManager.prototype.createOwlSound = function () {
    // Owl hoot: "hoo-hoo"
    return function (ctx) {
      // First hoot
      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(300, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.3);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Second hoot (delayed)
      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(300, ctx.currentTime + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.7);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.4);
      gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      osc2.start(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.7);
    };
  };

  AudioManager.prototype.createBurnSound = function () {
    // Horrifying burning sound - crackling fire with scream-like tones
    return function (ctx) {
      // Fire crackling (noise + filter)
      var bufferSize = ctx.sampleRate * 1.5;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 2000;
      noiseFilter.Q.value = 0.5;
      var noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);

      // Horrifying scream-like descending tone
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.frequency.setValueAtTime(600, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.8);
      osc2.frequency.setValueAtTime(800, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    };
  };

  AudioManager.prototype.startAmbience = function () {
    if (!this.ctx) return;

    // Create low rumbling ambient drone
    var osc1 = this.ctx.createOscillator();
    var osc2 = this.ctx.createOscillator();
    var filter = this.ctx.createBiquadFilter();
    var gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.value = 55; // Low A
    osc2.frequency.value = 82.5; // E

    filter.type = 'lowpass';
    filter.frequency.value = 150;
    filter.Q.value = 2;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.value = 0.03; // Very subtle

    osc1.start();
    osc2.start();

    this.ambientNode = gain;

    // Add slow LFO modulation for eerie effect
    var lfo = this.ctx.createOscillator();
    var lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.2; // Very slow
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Start creepy soundtrack
    this.startSoundtrack();
  };

  AudioManager.prototype.startSoundtrack = function () {
    if (!this.ctx) return;

    // Creepy minor key melody looping
    var masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.18; // Louder for better atmosphere
    masterGain.connect(this.ctx.destination);
    this.soundtrackNode = masterGain;

    // Melody notes in minor key (D minor pentatonic)
    var melody = [293.66, 349.23, 392, 440, 523.25]; // D, F, G, A, C
    var beatDuration = 0.6;
    var pattern = [0, 2, 1, 3, 2, 4, 2, 1]; // Eerie descending-ascending pattern

    var playNote = function (freq, time, duration) {
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      var filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

      osc.start(time);
      osc.stop(time + duration);
    }.bind(this);

    var loopMelody = function () {
      var startTime = this.ctx.currentTime;
      for (var i = 0; i < pattern.length; i++) {
        var noteTime = startTime + i * beatDuration;
        playNote(melody[pattern[i]], noteTime, beatDuration * 0.8);
      }
      setTimeout(loopMelody, pattern.length * beatDuration * 1000);
    }.bind(this);

    loopMelody();
  };

  AudioManager.prototype.update = function (dt) {
    // Owl sounds disabled
  };

  AudioManager.prototype.playFlap = function () {
    if (this.ctx && this.sounds.flap) {
      this.sounds.flap(this.ctx);
    }
  };

  AudioManager.prototype.playDeath = function () {
    if (this.ctx && this.sounds.death) {
      this.sounds.death(this.ctx);
    }
  };

  AudioManager.prototype.playMilestone = function () {
    if (this.ctx && this.sounds.milestone && !this.milestone10Played) {
      this.sounds.milestone(this.ctx);
      this.milestone10Played = true;
    }
  };

  AudioManager.prototype.playOwl = function () {
    if (this.ctx && this.sounds.owl && !this.owlPlaying) {
      this.owlPlaying = true;
      this.sounds.owl(this.ctx);
      // Owl sound duration is 0.7 seconds, add buffer
      setTimeout(function () {
        this.owlPlaying = false;
      }.bind(this), 1000);
    }
  };

  AudioManager.prototype.playBurn = function () {
    if (this.ctx && this.sounds.burn) {
      this.sounds.burn(this.ctx);
    }
  };

  AudioManager.prototype.reset = function () {
    this.milestone10Played = false;
    this.owlTimer = 0;
  };

  AudioManager.prototype.pauseOwls = function () {
    this.owlsPaused = true;
    this.owlTimer = 0;
  };

  AudioManager.prototype.resumeOwls = function () {
    this.owlsPaused = false;
  };

  AudioManager.prototype.resume = function () {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  };

  return AudioManager;
});
