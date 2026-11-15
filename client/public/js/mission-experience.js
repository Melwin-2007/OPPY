// =========================================================================
// OPPY'S LAST DANCE — 5-PHASE CINEMATIC MISSION EXPERIENCE SIMULATION ENGINE
// Ultra-clean cinematic storytelling, physics kinematics, procedural audio
// =========================================================================

(function () {
  'use strict';

  // Canvas roundRect polyfill for broad browser compatibility
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
      if (!radii) radii = 0;
      var r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? (radii[0] || 0) : 0);
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
      return this;
    };
  }

  // =========================================================================
  // 1. PROCEDURAL WEB AUDIO SYNTHESIZER
  // =========================================================================
  class ProceduralAudioEngine {
    constructor() {
      this.ctx = null;
      this.initialized = false;
      this.windGain = null;
      this.windFilter = null;
      this.servoOsc = null;
      this.servoFilter = null;
      this.servoGain = null;
      this.lastClickTime = 0;
    }

    init() {
      if (this.initialized) {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        // Pink/Brown noise generator for continuous Martian wind
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }

        const windSource = this.ctx.createBufferSource();
        windSource.buffer = noiseBuffer;
        windSource.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.frequency.value = 240;
        this.windFilter.Q.value = 1.6;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0.0 : 1.0;
        this.masterGain.connect(this.ctx.destination);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0.04;

        windSource.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        windSource.start();

        // Electric DC servo motor whirr
        this.servoOsc = this.ctx.createOscillator();
        this.servoOsc.type = 'sawtooth';
        this.servoOsc.frequency.value = 65;

        this.servoFilter = this.ctx.createBiquadFilter();
        this.servoFilter.type = 'lowpass';
        this.servoFilter.frequency.value = 220;

        this.servoGain = this.ctx.createGain();
        this.servoGain.gain.value = 0.0;

        this.servoOsc.connect(this.servoFilter);
        this.servoFilter.connect(this.servoGain);
        this.servoGain.connect(this.masterGain);
        this.servoOsc.start();

        this.initialized = true;
      } catch (err) {
        // Audio will initialize upon first user gesture
      }
    }

    setMuted(muted) {
      this.muted = !!muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0.0 : 1.0, this.ctx.currentTime);
      }
    }

    setDriving(isDriving) {
      if (!this.initialized || !this.ctx || !this.servoGain) return;
      try {
        const now = this.ctx.currentTime;
        this.servoGain.gain.setTargetAtTime(isDriving ? 0.045 : 0.0, now, 0.08);
      } catch (e) {}
    }

    update(dt) {
      if (!this.initialized || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;

      // Wind intensity scaled by dust storm optical depth and wind gust events
      const stormFactor = Math.min(1, Math.max(0, (state.tau - 0.5) / 9.5));
      const gustBoost = state.windGustTimer > 0 ? 0.22 : 0;
      this.windGain.gain.setTargetAtTime(0.035 + stormFactor * 0.16 + gustBoost, now, 0.15);
      this.windFilter.frequency.setTargetAtTime(220 + stormFactor * 360 + (state.windGustTimer > 0 ? 440 : 0), now, 0.15);

      // Driving servo audio
      const speedAbs = Math.abs(state.velocityKmPerSec);
      const isMoving = speedAbs > 0.01;
      const pitchBoost = state.inPurgatory ? 2.0 : (state.isJammedWheel ? 1.4 : 1.0);
      this.servoGain.gain.setTargetAtTime(isMoving ? Math.min(0.065, 0.02 + speedAbs * 0.015) : 0.0, now, 0.08);
      this.servoOsc.frequency.setTargetAtTime(58 + Math.min(170, speedAbs * 32 * pitchBoost), now, 0.08);

      // Spectrometer clicks during rock drilling
      if (state.isDrilling && performance.now() - this.lastClickTime > 90) {
        this.lastClickTime = performance.now();
        this.playSpectrometerClick();
      }
    }

    playSpectrometerClick() {
      if (!this.initialized || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100 + Math.random() * 800, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {}
    }

    playSparkSound() {
      if (!this.initialized || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {}
    }

    playRadioTransmissionChirp() {
      if (!this.initialized || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [880, 1320, 1760].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.11);
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.12);
        });
      } catch (e) {}
    }

    playWindWhoosh() {
      if (!this.initialized) this.init();
      if (!this.initialized || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(130, now + 1.2);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      } catch (e) {}
    }

    playFinaleChord() {
      if (!this.initialized) this.init();
      if (!this.initialized || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Nostalgic, solemn triad (F# minor to A major - warm celestial resonance)
        const notes = [185.0, 220.0, 277.18, 440.0, 554.37];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx < 2 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.22);
          gain.gain.setValueAtTime(0.001, now + idx * 0.22);
          gain.gain.linearRampToValueAtTime(0.038, now + idx * 0.22 + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 9.5);
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          osc.start(now + idx * 0.22);
          osc.stop(now + idx * 0.22 + 10.0);
        });
      } catch (e) {}
    }
  }

  const audioEngine = new ProceduralAudioEngine();

  // =========================================================================
  // 2. THE 5-PHASE SEQUENTIAL STORYLINE SPECIFICATION
  // =========================================================================
  const PHASES = [
    {
      id: 1,
      title: "PHASE 1: The 90-Day Promise & Ancient Water (Eagle Crater, 2004)",
      kmStart: 0.0,
      kmEnd: 0.95,
      skyTop: [78, 48, 28],
      skyMid: [168, 108, 64],
      skyBottom: [224, 168, 114],
      terrainBase: '#92400e',
      terrainShadow: '#451a03',
      subtitles: [
        { text: "January 25, 2004. Wrapped in giant airbags, Opportunity bounces 26 times across Mars and rolls straight into Eagle Crater.", triggerKm: 0.04 },
        { text: "NASA built her to survive for only 90 days and drive less than a kilometer before Martian dust choked her solar panels.", triggerKm: 0.18 },
        { text: "Reaching out her robotic arm, she spins her diamond-tipped drill into the ancient bedrock...", triggerKm: 0.36 },
        { text: "Inside the rock, her sensors find tiny iron pebbles called 'Martian Blueberries'—proving that liquid water once flowed across Mars.", triggerKm: 0.44 }
      ]
    },
    {
      id: 2,
      title: "PHASE 2: Trapped in Purgatory Dune & The Broken Shoulder (2005)",
      kmStart: 0.95,
      kmEnd: 2.30,
      skyTop: [88, 54, 30],
      skyMid: [178, 118, 70],
      skyBottom: [230, 175, 120],
      terrainBase: '#b45309',
      terrainShadow: '#78350f',
      subtitles: [
        { text: "2005. Opportunity has already outlived her 90-day warranty, pushing deeper into the unknown desert.", triggerKm: 1.05 },
        { text: "Suddenly, all six wheels break through a thin crust and sink axle-deep into soft, powdery sand—a trap called Purgatory Dune.", triggerKm: 1.24 },
        { text: "Her wheels spin helplessly. For five weeks, engineers on Earth command her to rock millimeter by millimeter—spinning her wheels 192 meters just to move 1 meter...", triggerKm: 1.34 },
        { text: "Her cleats finally bite into solid rock and she breaks free—even as a heater switch breaks in her robotic shoulder, forcing her to sleep in the freezing -105°C cold every night to save battery.", triggerKm: 1.58 }
      ]
    },
    {
      id: 3,
      title: "PHASE 3: The Killer Dust Storm & The Wind Miracle (2007)",
      kmStart: 2.30,
      kmEnd: 4.50,
      skyTop: [50, 30, 16],
      skyMid: [110, 68, 38],
      skyBottom: [150, 96, 56],
      terrainBase: '#78350f',
      terrainShadow: '#451a03',
      subtitles: [
        { text: "2007. A monstrous planet-wide dust storm swallows Mars, blocking 99% of the Sun.", triggerKm: 2.45 },
        { text: "Thick red dust suffocates her solar wings. Her power drops to the edge of freezing death, and she is forced into silent hibernation in the dark.", triggerKm: 2.95 },
        { text: "Just when all hope seems lost, Mars itself saves her—swirling whirlwinds sweep across her deck, blasting the dust off her solar panels and bringing her back to life.", triggerKm: 3.65 }
      ]
    },
    {
      id: 4,
      title: "PHASE 4: Losing Spirit, Crippled Wheels & Nightly Amnesia (2010–2015)",
      kmStart: 4.50,
      kmEnd: 6.95,
      skyTop: [28, 20, 36],
      skyMid: [68, 42, 60],
      skyBottom: [128, 76, 80],
      terrainBase: '#6b21a8',
      terrainShadow: '#3b0764',
      subtitles: [
        { text: "2010. Halfway across the planet, her twin rover Spirit gets trapped in soft soil and freezes to death in the winter dark. Opportunity is now completely alone on Mars.", triggerKm: 4.60 },
        { text: "Years of hard driving take their toll. Her front steering motor jams, forcing her to drive backward across the plains to keep her arthritic wheel gears from seizing.", triggerKm: 5.10 },
        { text: "After a decade of cosmic radiation, her flash memory begins to fail—giving her nightly amnesia that wipes everything she learns the moment she goes to sleep.", triggerKm: 5.70 },
        { text: "Every evening before sunset, she tilts her antenna to the sky and beams every photograph and memory home before her mind resets—becoming the first machine to complete a 42-kilometer marathon on another world.", triggerKm: 6.25 }
      ]
    },
    {
      id: 5,
      title: "PHASE 5: Perseverance Valley & The Final Message (June 2018 – February 2019)",
      kmStart: 6.95,
      kmEnd: 8.50,
      skyTop: [12, 6, 8],
      skyMid: [26, 12, 14],
      skyBottom: [45, 20, 22],
      terrainBase: '#450a0a',
      terrainShadow: '#1c0505',
      subtitles: [
        { text: "June 2018. Fourteen years on Mars—nearly 60 times longer than she was ever meant to live. Opportunity climbs into Perseverance Valley.", triggerKm: 7.05 },
        { text: "Above her, the darkest dust storm in Martian history blots out the sky, turning midday darker than midnight.", triggerKm: 7.45 },
        { text: "Freezing in the dark, her solar wings can no longer generate enough energy to keep her warm or keep her internal clock ticking.", triggerKm: 7.85 },
        { text: "On June 10, 2018, she uses her last breath of battery to point her camera up toward where the Sun should be, sending back one final, static-filled frame of the dark...", triggerKm: 8.18 }
      ]
    }
  ];

  // =========================================================================
  // 3. MASTER GAMEPLAY STATE
  // =========================================================================
  const state = {
    odometerKm: 0.0,
    velocityKmPerSec: 0.0,
    wheelSpinPhase: 0.0,
    keys: { left: false, right: false },
    dir: 1, // 1 = forward facing, -1 = reverse backward facing
    currentPhaseId: 1,

    // Phase 1: Eagle Crater drill & blueberries
    phase1DrillPromptShown: false,
    phase1Drilled: false,
    isDrilling: false,
    drillProgress: 0.0,
    armDeployProgress: 0.0,

    // Phase 2: Purgatory Dune trap & rock free
    inPurgatory: false,
    purgatoryFreed: false,
    rockCycles: 0,
    lastRockKey: null,
    shoulderSparkTimer: 0.0,

    // Phase 3: Killer Dust Storm & Wind Gust Miracle
    dustFactor: 0.0, // 0 = clean solar panels, 1 = heavily coated
    tau: 0.50, // atmospheric optical depth
    windGustTimer: 0.0,
    windDevilCleaned: false,

    // Phase 4: Jammed wheel, backward drive, memory amnesia
    isJammedWheel: false,
    amnesiaGlitchTimer: 0.0,
    marathonBeamDone: false,
    antennaBeamProgress: 0.0,

    // Phase 5: Perseverance Valley climb & Final Blackout
    finalClimbDone: false,
    mastTiltProgress: 0.0,
    blackoutFading: false,
    blackoutComplete: false,

    // Subtitle & control prompt management
    activeSubtitleText: '',
    subtitleFadeAlpha: 0.0,
    activePromptText: '',
    promptFadeAlpha: 0.0,
    displayedSubtitles: new Set()
  };

  // DOM Handles
  let storyCanvas = null;
  let ctx2d = null;
  let animId = null;
  let lastTime = 0;
  let listenersBound = false;

  // Particle systems
  const particles = [];
  const stars = [];
  const wheelTracks = [];

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 800,
        vx: 40 + Math.random() * 90,
        vy: -15 + Math.random() * 30,
        radius: 0.8 + Math.random() * 1.8,
        alpha: 0.1 + Math.random() * 0.35,
        twirl: Math.random() * Math.PI * 2
      });
    }

    stars.length = 0;
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 450,
        size: 0.7 + Math.random() * 1.4,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  function getCurrentPhase(km) {
    for (let p of PHASES) {
      if (km >= p.kmStart && km <= p.kmEnd) return p;
    }
    return PHASES[PHASES.length - 1];
  }

  function resizeCanvas() {
    if (!storyCanvas || !storyCanvas.parentElement) return;
    const rect = storyCanvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(300, Math.floor(rect.width * dpr));
    const h = Math.max(200, Math.floor(rect.height * dpr));
    if (storyCanvas.width !== w || storyCanvas.height !== h) {
      storyCanvas.width = w;
      storyCanvas.height = h;
    }
  }

  // =========================================================================
  // 4. SUBTITLE & CONTROL PROMPT UI CONTROLLER
  // =========================================================================
  function setSubtitle(text) {
    if (state.activeSubtitleText === text) return;
    state.activeSubtitleText = text;
    const box = document.getElementById('cinematicSubtitleBox');
    const el = document.getElementById('cinematicSubtitleText');
    if (!box || !el) return;

    if (!text) {
      box.classList.remove('opacity-100', 'translate-y-0');
      box.classList.add('opacity-0', 'translate-y-2');
      return;
    }

    box.classList.remove('opacity-100', 'translate-y-0');
    box.classList.add('opacity-0', 'translate-y-2');

    setTimeout(() => {
      el.textContent = text;
      box.classList.remove('opacity-0', 'translate-y-2');
      box.classList.add('opacity-100', 'translate-y-0');
    }, 300);
  }

  function setControlPrompt(prompt) {
    if (state.activePromptText === prompt) return;
    state.activePromptText = prompt;
    const box = document.getElementById('controlPromptBox');
    const el = document.getElementById('controlPromptText');
    if (!box || !el) return;

    if (!prompt) {
      box.classList.remove('opacity-100', 'translate-y-0');
      box.classList.add('opacity-0', 'translate-y-1');
      return;
    }

    el.textContent = prompt;
    box.classList.remove('opacity-0', 'translate-y-1');
    box.classList.add('opacity-100', 'translate-y-0');
  }

  // =========================================================================
  // 5. PROCEDURAL MARTIAN ELEVATION GENERATOR
  // =========================================================================
  function getTerrainElevation(worldKm) {
    let h = Math.sin(worldKm * 3.4) * 8 + Math.cos(worldKm * 7.8) * 4;

    // Eagle crater bowl (Phase 1)
    if (worldKm < 0.9) {
      const craterBowl = Math.exp(-Math.pow((worldKm - 0.22) / 0.36, 2)) * -22;
      const outcropBump = Math.exp(-Math.pow((worldKm - 0.40) / 0.08, 2)) * 14;
      h += craterBowl + outcropBump;
    }

    // Purgatory sand dune ripple trap (Phase 2)
    if (worldKm >= 1.15 && worldKm <= 1.70) {
      const duneDip = Math.sin((worldKm - 1.15) * 16.0) * 10 - 12;
      h += duneDip;
    }

    // Rolling plains & Victoria crater ridges (Phase 3 & 4)
    if (worldKm > 2.0 && worldKm < 6.8) {
      h += Math.sin(worldKm * 5.2) * 12 + Math.cos(worldKm * 2.1) * 16;
    }

    // Perseverance Valley steep slope climb (Phase 5)
    if (worldKm >= 6.9) {
      const climbProgress = Math.min(1.0, (worldKm - 6.9) / 1.4);
      h += climbProgress * 95 + Math.sin(worldKm * 12.0) * 8;
    }

    return h;
  }

  // Coordinate transformations
  function kmToScreenX(targetKm, roverKm, W, dpr) {
    const centerScreenX = W * 0.42;
    const pixelsPerKm = 880 * dpr;
    return centerScreenX + (targetKm - roverKm) * pixelsPerKm;
  }

  function getScreenGroundY(screenX, roverKm, W, H, dpr) {
    const pixelsPerKm = 880 * dpr;
    const centerScreenX = W * 0.42;
    const worldKm = roverKm + (screenX - centerScreenX) / pixelsPerKm;
    const baseGroundY = H * 0.72;
    return baseGroundY - getTerrainElevation(worldKm) * dpr;
  }

  // =========================================================================
  // 6. DETAILED 2.5D ROVER KINEMATICS & ARTICULATION RENDERER
  // =========================================================================
  function draw25DWheel(ctx, x, y, radius, spinAngle, dpr, isFarSide, isJammed) {
    ctx.save();
    ctx.translate(x, y);
    if (isJammed) {
      ctx.rotate(0.42); // Jammed steering motor angle
    }

    const depthWidth = 10 * dpr;

    // 3D Extruded Cylindrical Barrel
    const barrelGrad = ctx.createLinearGradient(0, -radius, 0, radius);
    barrelGrad.addColorStop(0, isFarSide ? '#18181b' : '#27272a');
    barrelGrad.addColorStop(0.5, isFarSide ? '#09090b' : '#18181b');
    barrelGrad.addColorStop(1, '#090706');
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.ellipse(-depthWidth * 0.5, 0, radius * 0.95, radius, 0, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(depthWidth * 0.5, -radius);
    ctx.ellipse(depthWidth * 0.5, 0, radius * 0.95, radius, 0, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();

    // Metallic Tire Cleats (traction chevrons)
    ctx.strokeStyle = isFarSide ? '#3f3f46' : '#71717a';
    ctx.lineWidth = 1.4 * dpr;
    for (let c = -radius * 0.8; c <= radius * 0.8; c += 5 * dpr) {
      ctx.beginPath();
      ctx.moveTo(-depthWidth * 0.4, c);
      ctx.lineTo(depthWidth * 0.4, c + 2 * dpr);
      ctx.stroke();
    }

    // Outer face
    ctx.translate(depthWidth * 0.45, 0);

    // Rim
    ctx.fillStyle = isFarSide ? '#18181b' : '#27272a';
    ctx.strokeStyle = isFarSide ? '#52525b' : '#a1a1aa';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.94, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iconic Copper Inner Ring
    ctx.strokeStyle = isJammed ? '#ef4444' : (isFarSide ? '#9a3412' : '#ea580c');
    ctx.lineWidth = 2.4 * dpr;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.74, radius * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Dish
    const dishGrad = ctx.createRadialGradient(-2 * dpr, -2 * dpr, 1 * dpr, 0, 0, radius * 0.7);
    dishGrad.addColorStop(0, isFarSide ? '#52525b' : '#e4e4e7');
    dishGrad.addColorStop(0.7, isFarSide ? '#3f3f46' : '#71717a');
    dishGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = dishGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.66, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Spiral Titanium Flexures inside Hub
    ctx.save();
    ctx.rotate(spinAngle);
    ctx.strokeStyle = isFarSide ? '#27272a' : '#3f3f46';
    ctx.lineWidth = 1.8 * dpr;
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(sa) * radius * 0.25, Math.sin(sa) * radius * 0.25, radius * 0.32, sa, sa + Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();

    // Axle Cap
    ctx.fillStyle = isJammed ? '#ef4444' : '#d4d4d8';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawStrut(ctx, x1, y1, x2, y2, width, dpr, isFarSide) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(ang);

    const grad = ctx.createLinearGradient(0, -width * 0.5, 0, width * 0.5);
    grad.addColorStop(0, isFarSide ? '#3f3f46' : '#d4d4d8');
    grad.addColorStop(0.5, isFarSide ? '#18181b' : '#71717a');
    grad.addColorStop(1, isFarSide ? '#09090b' : '#27272a');
    ctx.fillStyle = grad;
    ctx.strokeStyle = isFarSide ? '#27272a' : '#a1a1aa';
    ctx.lineWidth = 1 * dpr;

    ctx.beginPath();
    ctx.roundRect(0, -width * 0.5, len, width, 2 * dpr);
    ctx.fill();
    ctx.stroke();

    // Perforated Lightening Holes
    const holeR = width * 0.26;
    const numHoles = Math.max(1, Math.floor(len / (width * 1.5)));
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    for (let h = 1; h <= numHoles; h++) {
      const hx = (h / (numHoles + 1)) * len;
      ctx.beginPath();
      ctx.arc(hx, 0, holeR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 7. MASTER ANIMATION & RENDER LOOP
  // =========================================================================
  function render2DExperience(dt, timeSec) {
    resizeCanvas();
    const W = storyCanvas.width;
    const H = storyCanvas.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const currentPhase = getCurrentPhase(state.odometerKm);
    state.currentPhaseId = currentPhase.id;

    ctx2d.save();

    // 1. DYNAMIC MARTIAN ATMOSPHERE SKY GRADIENT
    // Interpolates smoothly based on phase and storm optical depth
    let stormDarken = 0.0;
    if (currentPhase.id === 3) {
      stormDarken = 0.55 + Math.min(0.40, (state.odometerKm - 2.3) / 1.5);
    } else if (currentPhase.id === 5) {
      stormDarken = Math.min(1.0, (state.odometerKm - 6.95) / 1.25);
    }

    const topR = Math.max(0, Math.round(currentPhase.skyTop[0] * (1 - stormDarken)));
    const topG = Math.max(0, Math.round(currentPhase.skyTop[1] * (1 - stormDarken)));
    const topB = Math.max(0, Math.round(currentPhase.skyTop[2] * (1 - stormDarken)));
    const midR = Math.max(0, Math.round(currentPhase.skyMid[0] * (1 - stormDarken)));
    const midG = Math.max(0, Math.round(currentPhase.skyMid[1] * (1 - stormDarken)));
    const midB = Math.max(0, Math.round(currentPhase.skyMid[2] * (1 - stormDarken)));
    const botR = Math.max(0, Math.round(currentPhase.skyBottom[0] * (1 - stormDarken)));
    const botG = Math.max(0, Math.round(currentPhase.skyBottom[1] * (1 - stormDarken)));
    const botB = Math.max(0, Math.round(currentPhase.skyBottom[2] * (1 - stormDarken)));

    const horizonY = H * 0.60;
    const skyGrad = ctx2d.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, `rgb(${topR},${topG},${topB})`);
    skyGrad.addColorStop(0.55, `rgb(${midR},${midG},${midB})`);
    skyGrad.addColorStop(1, `rgb(${botR},${botG},${botB})`);
    ctx2d.fillStyle = skyGrad;
    ctx2d.fillRect(0, 0, W, H);

    // Twilight Stars (Phase 4 & early 5)
    if (currentPhase.id === 4 && stormDarken < 0.8) {
      ctx2d.fillStyle = '#ffffff';
      stars.forEach((s) => {
        const alpha = (0.2 + 0.6 * Math.sin(timeSec * 2.5 + s.twinkle)) * (1 - stormDarken);
        if (alpha > 0.05) {
          ctx2d.globalAlpha = alpha;
          ctx2d.fillRect(s.x % W, s.y % (horizonY * 0.9), s.size * dpr, s.size * dpr);
        }
      });
      ctx2d.globalAlpha = 1.0;
    }

    // Martian Sun with atmospheric dust glow
    if (stormDarken < 0.92) {
      const sunScreenX = W * 0.74 - (state.odometerKm * 20 * dpr) % (W * 0.5);
      const sunScreenY = H * 0.28 + Math.min(100 * dpr, state.odometerKm * 8 * dpr);
      const sunAlpha = Math.max(0, 1 - stormDarken * 1.15);

      if (sunAlpha > 0.02) {
        ctx2d.save();
        ctx2d.globalAlpha = sunAlpha;
        const sunHalo = ctx2d.createRadialGradient(sunScreenX, sunScreenY, 6 * dpr, sunScreenX, sunScreenY, 120 * dpr);
        sunHalo.addColorStop(0, 'rgba(255, 250, 240, 0.95)');
        sunHalo.addColorStop(0.2, 'rgba(254, 215, 170, 0.45)');
        sunHalo.addColorStop(0.6, 'rgba(251, 146, 60, 0.12)');
        sunHalo.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx2d.fillStyle = sunHalo;
        ctx2d.beginPath();
        ctx2d.arc(sunScreenX, sunScreenY, 120 * dpr, 0, Math.PI * 2);
        ctx2d.fill();

        ctx2d.fillStyle = '#fffdf7';
        ctx2d.beginPath();
        ctx2d.arc(sunScreenX, sunScreenY, 14 * dpr, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // 2. PARALLAX MARTIAN MOUNTAIN RIDGES
    const centerScreenX = W * 0.42;
    const pixelsPerKm = 880 * dpr;

    // Distant background crater rims
    ctx2d.fillStyle = `rgb(${Math.round(topR * 0.85)},${Math.round(topG * 0.75)},${Math.round(topB * 0.7)})`;
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 32 * dpr) {
      const worldDist = (x - centerScreenX) / (pixelsPerKm * 0.2) + state.odometerKm * 0.25;
      const ry = horizonY - 35 * dpr - (Math.sin(worldDist * 1.5) * 18 + Math.cos(worldDist * 3.8) * 9) * dpr;
      ctx2d.lineTo(x, ry);
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();
    ctx2d.fill();

    // Midground ridge
    ctx2d.fillStyle = `rgb(${Math.round(midR * 0.9)},${Math.round(midG * 0.8)},${Math.round(midB * 0.75)})`;
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 24 * dpr) {
      const worldDist = (x - centerScreenX) / (pixelsPerKm * 0.5) + state.odometerKm * 0.55;
      const ry = horizonY - 12 * dpr - (Math.sin(worldDist * 2.2) * 14 + Math.cos(worldDist * 5.1) * 7) * dpr;
      ctx2d.lineTo(x, ry);
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();
    ctx2d.fill();

    // 3. FOREGROUND PROCEDURAL MARTIAN TERRAIN
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 16 * dpr) {
      const gy = getScreenGroundY(x, state.odometerKm, W, H, dpr);
      ctx2d.lineTo(x, gy);
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();

    const groundGrad = ctx2d.createLinearGradient(0, horizonY, 0, H);
    groundGrad.addColorStop(0, currentPhase.terrainBase);
    groundGrad.addColorStop(1, currentPhase.terrainShadow);
    ctx2d.fillStyle = groundGrad;
    ctx2d.fill();

    // 4. LANDMARK ENVIRONMENTAL PROPS
    // Phase 1: Eagle Crater Lander Airbags (0.00 km)
    const landerX = kmToScreenX(0.0, state.odometerKm, W, dpr);
    if (landerX > -150 * dpr && landerX < W + 150 * dpr) {
      const ly = getScreenGroundY(landerX, state.odometerKm, W, H, dpr);
      ctx2d.save();
      ctx2d.translate(landerX, ly);
      ctx2d.fillStyle = '#f8fafc';
      ctx2d.strokeStyle = '#cbd5e1';
      ctx2d.lineWidth = 1.5 * dpr;
      // Airbag lobes
      [-22, 0, 22].forEach((offX) => {
        ctx2d.beginPath();
        ctx2d.ellipse(offX * dpr, -8 * dpr, 14 * dpr, 9 * dpr, 0, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
      });
      ctx2d.restore();
    }

    // Phase 1: Bedrock Outcrop & Glowing Hematite Blueberries (0.40 km)
    const outcropX = kmToScreenX(0.40, state.odometerKm, W, dpr);
    if (outcropX > -150 * dpr && outcropX < W + 150 * dpr) {
      const oy = getScreenGroundY(outcropX, state.odometerKm, W, H, dpr);
      ctx2d.save();
      ctx2d.translate(outcropX, oy);
      ctx2d.fillStyle = '#7c2d12';
      ctx2d.beginPath();
      ctx2d.moveTo(-45 * dpr, 6 * dpr);
      ctx2d.lineTo(-32 * dpr, -20 * dpr);
      ctx2d.lineTo(22 * dpr, -22 * dpr);
      ctx2d.lineTo(48 * dpr, 6 * dpr);
      ctx2d.closePath();
      ctx2d.fill();

      // Glowing Blueberries
      [[-18, -10], [-6, -14], [8, -12], [18, -8], [-2, -6], [12, -16]].forEach(([bx, by]) => {
        ctx2d.fillStyle = '#38bdf8';
        ctx2d.beginPath();
        ctx2d.arc(bx * dpr, by * dpr, 3.2 * dpr, 0, Math.PI * 2);
        ctx2d.fill();
      });
      ctx2d.restore();
    }

    // Phase 4: Marathon 42.195 km Distance Milestone Rock (6.10 km)
    const marathonX = kmToScreenX(6.10, state.odometerKm, W, dpr);
    if (marathonX > -150 * dpr && marathonX < W + 150 * dpr) {
      const my = getScreenGroundY(marathonX, state.odometerKm, W, H, dpr);
      ctx2d.save();
      ctx2d.translate(marathonX, my);
      ctx2d.fillStyle = '#581c87';
      ctx2d.beginPath();
      ctx2d.moveTo(-30 * dpr, 5 * dpr);
      ctx2d.lineTo(-18 * dpr, -28 * dpr);
      ctx2d.lineTo(16 * dpr, -30 * dpr);
      ctx2d.lineTo(34 * dpr, 5 * dpr);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();
    }

    // 5. ROVER KINEMATICS & 6-WHEEL ROCKER-BOGIE ARTICULATION
    const roverScreenX = centerScreenX;
    const wheelRadius = 13.5 * dpr;
    const wheelBaseSpan = 64 * dpr;

    const wRearX = roverScreenX - wheelBaseSpan * 0.5;
    const wMidX = roverScreenX - wheelBaseSpan * 0.12;
    const wFrontX = roverScreenX + wheelBaseSpan * 0.5;

    // Extra sand sink during Purgatory Dune
    const sinkOffset = state.inPurgatory ? 6 * dpr : 0;
    const wRearY = getScreenGroundY(wRearX, state.odometerKm, W, H, dpr) - wheelRadius * 0.75 + sinkOffset;
    const wMidY = getScreenGroundY(wMidX, state.odometerKm, W, H, dpr) - wheelRadius * 0.75 + sinkOffset;
    const wFrontY = getScreenGroundY(wFrontX, state.odometerKm, W, H, dpr) - wheelRadius * 0.75 + sinkOffset;

    // Rocker-Bogie mechanical balance points
    const bogiePivotX = (wRearX + wMidX) * 0.5;
    const bogiePivotY = (wRearY + wMidY) * 0.5 - 7 * dpr;

    const chassisPivotX = roverScreenX;
    const chassisPivotY = (bogiePivotY + wFrontY) * 0.5 - 16 * dpr;
    const chassisPitch = Math.atan2(wFrontY - wRearY, wFrontX - wRearX) * 0.55;

    // Background wheel offset for 2.5D perspective
    const farOffsetX = -10 * dpr;
    const farOffsetY = -9 * dpr;

    // Ground Shadow
    ctx2d.fillStyle = 'rgba(12, 4, 2, 0.55)';
    ctx2d.beginPath();
    ctx2d.ellipse(roverScreenX, (wRearY + wFrontY) * 0.5 + wheelRadius * 0.7, 72 * dpr, 12 * dpr, 0, 0, Math.PI * 2);
    ctx2d.fill();

    // 5A. Far-Side Linkages & Far Wheels
    drawStrut(ctx2d, wRearX + farOffsetX, wRearY + farOffsetY, bogiePivotX + farOffsetX, bogiePivotY + farOffsetY, 4.5 * dpr, dpr, true);
    drawStrut(ctx2d, bogiePivotX + farOffsetX, bogiePivotY + farOffsetY, wMidX + farOffsetX, wMidY + farOffsetY, 4.5 * dpr, dpr, true);
    drawStrut(ctx2d, bogiePivotX + farOffsetX, bogiePivotY + farOffsetY, chassisPivotX + farOffsetX, chassisPivotY + farOffsetY + 6 * dpr, 5.5 * dpr, dpr, true);
    drawStrut(ctx2d, chassisPivotX + farOffsetX, chassisPivotY + farOffsetY + 6 * dpr, wFrontX + farOffsetX, wFrontY + farOffsetY, 5.5 * dpr, dpr, true);

    draw25DWheel(ctx2d, wRearX + farOffsetX, wRearY + farOffsetY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);
    draw25DWheel(ctx2d, wMidX + farOffsetX, wMidY + farOffsetY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);
    draw25DWheel(ctx2d, wFrontX + farOffsetX, wFrontY + farOffsetY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);

    // 5B. Rover Chassis & Subsystems (WEB, Solar Wings, Arm, Mast, Antenna)
    ctx2d.save();
    ctx2d.translate(chassisPivotX, chassisPivotY);
    ctx2d.rotate(chassisPitch);
    ctx2d.scale(state.dir, 1);

    // Far Solar Wing Panel
    ctx2d.fillStyle = '#0f172a';
    ctx2d.strokeStyle = '#94a3b8';
    ctx2d.lineWidth = 1.2 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(-44 * dpr, -16 * dpr);
    ctx2d.lineTo(-22 * dpr, -30 * dpr);
    ctx2d.lineTo(38 * dpr, -28 * dpr);
    ctx2d.lineTo(48 * dpr, -16 * dpr);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.stroke();

    // Warm Electronics Box (WEB) Golden Kapton Chassis
    const webGrad = ctx2d.createLinearGradient(-34 * dpr, -16 * dpr, 34 * dpr, 10 * dpr);
    webGrad.addColorStop(0, '#f59e0b');
    webGrad.addColorStop(0.35, '#d97706');
    webGrad.addColorStop(0.8, '#b45309');
    webGrad.addColorStop(1, '#78350f');
    ctx2d.fillStyle = webGrad;
    ctx2d.strokeStyle = '#fef3c7';
    ctx2d.lineWidth = 1.5 * dpr;

    ctx2d.beginPath();
    ctx2d.moveTo(-36 * dpr, -16 * dpr);
    ctx2d.lineTo(36 * dpr, -16 * dpr);
    ctx2d.lineTo(26 * dpr, 8 * dpr);
    ctx2d.lineTo(-28 * dpr, 8 * dpr);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.stroke();

    // Near Solar Array Deck (Photovoltaic silicon cells)
    const solarGrad = ctx2d.createLinearGradient(-48 * dpr, -16 * dpr, 48 * dpr, -16 * dpr);
    solarGrad.addColorStop(0, '#1e293b');
    solarGrad.addColorStop(0.5, '#0f172a');
    solarGrad.addColorStop(1, '#1e293b');
    ctx2d.fillStyle = solarGrad;
    ctx2d.strokeStyle = '#cbd5e1';
    ctx2d.lineWidth = 1.5 * dpr;

    ctx2d.beginPath();
    ctx2d.moveTo(-52 * dpr, -15 * dpr);
    ctx2d.lineTo(-32 * dpr, -24 * dpr);
    ctx2d.lineTo(34 * dpr, -24 * dpr);
    ctx2d.lineTo(54 * dpr, -15 * dpr);
    ctx2d.lineTo(36 * dpr, -13 * dpr);
    ctx2d.lineTo(-34 * dpr, -13 * dpr);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.stroke();

    // Red Dust Accumulation on Solar Panels (Phase 3 & 5)
    if (state.dustFactor > 0.05) {
      ctx2d.fillStyle = `rgba(180, 83, 9, ${state.dustFactor * 0.88})`;
      ctx2d.fill();
    }

    // High Gain Antenna (HGA) Steerable Dish
    ctx2d.save();
    ctx2d.translate(-16 * dpr, -24 * dpr);
    if (state.antennaBeamProgress > 0) {
      ctx2d.rotate(-0.55); // Points up toward Earth
    }
    ctx2d.fillStyle = '#e2e8f0';
    ctx2d.strokeStyle = '#94a3b8';
    ctx2d.lineWidth = 1.2 * dpr;
    ctx2d.beginPath();
    ctx2d.ellipse(0, 0, 9 * dpr, 4 * dpr, -0.4, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.stroke();

    // Radio Transmission Waves (Phase 4 Memory Beam)
    if (state.antennaBeamProgress > 0) {
      ctx2d.strokeStyle = 'rgba(56, 189, 248, ' + (1 - (state.antennaBeamProgress % 1)) + ')';
      ctx2d.lineWidth = 2 * dpr;
      for (let w = 1; w <= 3; w++) {
        const wr = (w * 16 + (timeSec * 50) % 24) * dpr;
        ctx2d.beginPath();
        ctx2d.arc(0, -10 * dpr, wr, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx2d.stroke();
      }
    }
    ctx2d.restore();

    // Pancam Mast Head (PMA)
    ctx2d.save();
    ctx2d.translate(14 * dpr, -24 * dpr);
    ctx2d.strokeStyle = '#e2e8f0';
    ctx2d.lineWidth = 3.5 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(0, -32 * dpr);
    ctx2d.stroke();

    // Camera Bar Head (tilts up in Phase 5!)
    ctx2d.translate(0, -32 * dpr);
    ctx2d.rotate(state.mastTiltProgress * -1.25); // Tilts up 80 degrees

    ctx2d.fillStyle = '#cbd5e1';
    ctx2d.strokeStyle = '#475569';
    ctx2d.lineWidth = 1.2 * dpr;
    ctx2d.fillRect(-7 * dpr, -4 * dpr, 14 * dpr, 8 * dpr);
    ctx2d.strokeRect(-7 * dpr, -4 * dpr, 14 * dpr, 8 * dpr);

    // Twin Pancam stereo lenses
    ctx2d.fillStyle = '#0f172a';
    ctx2d.beginPath();
    ctx2d.arc(-3.5 * dpr, 0, 2 * dpr, 0, Math.PI * 2);
    ctx2d.arc(3.5 * dpr, 0, 2 * dpr, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.restore();

    // 5-DOF Robotic Arm (IDD) & RAT Grinder
    ctx2d.save();
    ctx2d.translate(26 * dpr, -8 * dpr); // Shoulder joint

    // Shoulder Strain Sparks (Phase 2 Broken Shoulder)
    if (state.shoulderSparkTimer > 0) {
      for (let sp = 0; sp < 3; sp++) {
        ctx2d.strokeStyle = '#fef08a';
        ctx2d.lineWidth = 1.5 * dpr;
        ctx2d.beginPath();
        ctx2d.moveTo(0, 0);
        ctx2d.lineTo((Math.random() - 0.5) * 16 * dpr, (Math.random() - 0.5) * 16 * dpr);
        ctx2d.stroke();
      }
    }

    const armAngle1 = state.armDeployProgress * 0.75;
    const armAngle2 = state.armDeployProgress * -1.15;

    ctx2d.rotate(armAngle1);
    ctx2d.strokeStyle = '#cbd5e1';
    ctx2d.lineWidth = 3.2 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(16 * dpr, 4 * dpr);
    ctx2d.stroke();

    ctx2d.translate(16 * dpr, 4 * dpr);
    ctx2d.rotate(armAngle2);
    ctx2d.strokeStyle = '#94a3b8';
    ctx2d.lineWidth = 2.4 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(16 * dpr, 6 * dpr);
    ctx2d.stroke();

    // RAT Turret Head (Diamond drill)
    ctx2d.translate(16 * dpr, 6 * dpr);
    if (state.isDrilling) {
      ctx2d.rotate(timeSec * 35.0); // High-speed drill rotation
    }
    ctx2d.fillStyle = '#e2e8f0';
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 4.5 * dpr, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.fillStyle = '#38bdf8';
    ctx2d.fillRect(2 * dpr, -1.5 * dpr, 4 * dpr, 3 * dpr);

    ctx2d.restore();

    ctx2d.restore(); // End chassis transform

    // 5C. Near-Side Linkages & Near Wheels
    drawStrut(ctx2d, wRearX, wRearY, bogiePivotX, bogiePivotY, 4.5 * dpr, dpr, false);
    drawStrut(ctx2d, bogiePivotX, bogiePivotY, wMidX, wMidY, 4.5 * dpr, dpr, false);
    drawStrut(ctx2d, bogiePivotX, bogiePivotY, chassisPivotX, chassisPivotY + 6 * dpr, 5.5 * dpr, dpr, false);
    drawStrut(ctx2d, chassisPivotX, chassisPivotY + 6 * dpr, wFrontX, wFrontY, 5.5 * dpr, dpr, false);

    draw25DWheel(ctx2d, wRearX, wRearY, wheelRadius, state.wheelSpinPhase, dpr, false, false);
    draw25DWheel(ctx2d, wMidX, wMidY, wheelRadius, state.wheelSpinPhase, dpr, false, false);
    draw25DWheel(ctx2d, wFrontX, wFrontY, wheelRadius, state.wheelSpinPhase, dpr, false, state.isJammedWheel);

    // Sand spray during wheel spinning
    if (state.inPurgatory && Math.abs(state.velocityKmPerSec) > 0.005) {
      ctx2d.fillStyle = 'rgba(217, 119, 6, 0.65)';
      [wRearX, wMidX, wFrontX].forEach((wx) => {
        for (let sp = 0; sp < 3; sp++) {
          ctx2d.beginPath();
          ctx2d.arc(wx - (10 + Math.random() * 18) * dpr, wMidY + (Math.random() * 8) * dpr, (1.5 + Math.random() * 2) * dpr, 0, Math.PI * 2);
          ctx2d.fill();
        }
      });
    }

    // 6. ATMOSPHERIC PARTICLES & SWIRLING WIND DEVILS
    ctx2d.fillStyle = `rgba(224, 168, 114, ${0.25 + stormDarken * 0.45})`;
    particles.forEach((p) => {
      p.x += (p.vx + (state.windGustTimer > 0 ? 250 : 0)) * dt;
      p.y += p.vy * dt;
      if (p.x > W + 50) p.x = -50;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.radius * dpr, 0, Math.PI * 2);
      ctx2d.fill();
    });

    // Swirling Wind Gust Vortex (Phase 3 Miracle)
    if (state.windGustTimer > 0) {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(254, 215, 170, 0.4)';
      ctx2d.lineWidth = 2 * dpr;
      const swirlX = roverScreenX + (timeSec * 180 * dpr) % (W * 0.6) - 100 * dpr;
      for (let s = 0; s < 4; s++) {
        const sy = horizonY + s * 22 * dpr;
        ctx2d.beginPath();
        ctx2d.ellipse(swirlX, sy, 35 * dpr, 8 * dpr, Math.sin(timeSec * 6 + s) * 0.4, 0, Math.PI * 2);
        ctx2d.stroke();
      }
      ctx2d.restore();
    }

    ctx2d.restore();
  }

  // =========================================================================
  // 8. GAMEPLAY LOGIC & SEQUENCING CONTROLLER
  // =========================================================================
  function updateGameplay(dt, timeSec) {
    const km = state.odometerKm;
    const currentPhase = getCurrentPhase(km);

    // Check & trigger sequential subtitles based on kilometers
    currentPhase.subtitles.forEach((sub) => {
      if (km >= sub.triggerKm && !state.displayedSubtitles.has(sub.text)) {
        state.displayedSubtitles.add(sub.text);
        setSubtitle(sub.text);
      }
    });

    // -------------------------------------------------------------
    // PHASE 1: The 90-Day Promise & Ancient Water
    // -------------------------------------------------------------
    if (currentPhase.id === 1) {
      if (km < 0.35) {
        if (!state.phase1DrillPromptShown) {
          setControlPrompt("[Hold D to Drive]");
          if (state.keys.right) {
            setTimeout(() => { if (state.activePromptText === "[Hold D to Drive]") setControlPrompt(""); }, 3000);
          }
        }
      } else if (km >= 0.35 && km <= 0.45 && !state.phase1Drilled) {
        state.phase1DrillPromptShown = true;
        setControlPrompt("[Hold SPACE to Drill & Scan Rock]");

        // Auto slow near rock outcrop
        state.velocityKmPerSec = Math.min(state.velocityKmPerSec, 0.05);

        if (state.isDrilling) {
          state.drillProgress += dt;
          state.armDeployProgress = Math.min(1.0, state.armDeployProgress + dt * 2.5);
          if (state.drillProgress >= 2.2) {
            state.phase1Drilled = true;
            state.isDrilling = false;
            setControlPrompt("");
            audioEngine.playSpectrometerClick();
          }
        } else {
          state.armDeployProgress = Math.max(0.0, state.armDeployProgress - dt * 2.0);
        }
      } else {
        state.armDeployProgress = Math.max(0.0, state.armDeployProgress - dt * 2.0);
      }
    }

    // -------------------------------------------------------------
    // PHASE 2: Trapped in Purgatory Dune & The Broken Shoulder
    // -------------------------------------------------------------
    if (currentPhase.id === 2) {
      if (km >= 1.25 && km <= 1.55 && !state.purgatoryFreed) {
        state.inPurgatory = true;
        setControlPrompt("[Tap A and D Repeatedly to Rock Free]");
      }

      if (state.shoulderSparkTimer > 0) {
        state.shoulderSparkTimer = Math.max(0, state.shoulderSparkTimer - dt);
      }
    }

    // -------------------------------------------------------------
    // PHASE 3: The Killer Dust Storm & The Wind Miracle
    // -------------------------------------------------------------
    if (currentPhase.id === 3) {
      state.inPurgatory = false;
      // Optical depth increases
      state.tau = 0.5 + Math.min(6.5, (km - 2.3) * 3.2);

      if (!state.windDevilCleaned) {
        state.dustFactor = Math.min(0.85, (km - 2.3) * 0.55);
        setControlPrompt("[Hold D to Drive Through the Wind Gusts]");

        // Encounter wind miracle at 3.5 km
        if (km >= 3.45) {
          state.windDevilCleaned = true;
          state.windGustTimer = 4.0;
          audioEngine.playWindWhoosh();
          setControlPrompt("");
        }
      } else {
        state.dustFactor = Math.max(0.05, state.dustFactor - dt * 0.4);
      }

      if (state.windGustTimer > 0) {
        state.windGustTimer = Math.max(0, state.windGustTimer - dt);
      }
    }

    // -------------------------------------------------------------
    // PHASE 4: Jammed Wheel, Backward Drive & Nightly Amnesia
    // -------------------------------------------------------------
    if (currentPhase.id === 4) {
      state.tau = 1.2;

      // Jammed wheel and backward driving flip
      if (km >= 5.0) {
        state.isJammedWheel = true;
        state.dir = -1; // Flip rover horizontally to drive backward!
        if (km < 6.0 && !state.marathonBeamDone) {
          setControlPrompt("[Hold D to Drive Backward]");
        }
      }

      // Occasional amnesia screen glitch
      if (km >= 5.6 && Math.random() < 0.015 && state.amnesiaGlitchTimer <= 0) {
        state.amnesiaGlitchTimer = 0.25;
        const glitchEl = document.getElementById('amnesiaGlitchOverlay');
        if (glitchEl) {
          glitchEl.style.opacity = '0.35';
          setTimeout(() => { if (glitchEl) glitchEl.style.opacity = '0'; }, 220);
        }
      }

      // 42.195 km marathon memory transmission
      if (km >= 6.10 && !state.marathonBeamDone) {
        setControlPrompt("[Press E to Beam Memories Home Before Sunset]");
        state.velocityKmPerSec = Math.min(state.velocityKmPerSec, 0.04);
      }

      if (state.antennaBeamProgress > 0) {
        state.antennaBeamProgress += dt * 0.8;
        if (state.antennaBeamProgress >= 3.0) {
          state.antennaBeamProgress = 0.0;
          state.marathonBeamDone = true;
          setControlPrompt("");
        }
      }
    }

    // -------------------------------------------------------------
    // PHASE 5: Perseverance Valley & The Final Message
    // -------------------------------------------------------------
    if (currentPhase.id === 5) {
      state.isJammedWheel = false;
      state.dir = 1;

      // Storm darkens completely
      state.tau = 3.0 + Math.min(7.8, (km - 6.95) * 6.5);

      if (km < 8.15 && !state.finalClimbDone) {
        setControlPrompt("[Hold D to Climb Perseverance Valley]");
      } else if (km >= 8.15 && !state.finalClimbDone) {
        // Crest reached, rover slows to dead halt
        state.velocityKmPerSec = 0.0;
        state.keys.right = false;
        setControlPrompt("[Press SPACE to Look for the Sun]");
      }

      // Camera tilts upward into void
      if (state.finalClimbDone && state.mastTiltProgress < 1.0) {
        state.mastTiltProgress = Math.min(1.0, state.mastTiltProgress + dt * 0.45);
      }
    }

    // -------------------------------------------------------------
    // DRIVING PHYSICS & VELOCITY RESOLUTION
    // -------------------------------------------------------------
    if (!state.finalClimbDone || state.odometerKm < 8.15) {
      let targetVel = 0.0;
      const driveSpeed = state.inPurgatory ? 0.03 : (state.dustFactor > 0.4 ? 0.45 : (currentPhase.id === 5 ? 0.28 : 0.65));

      if (state.keys.right) {
        targetVel = driveSpeed;
      } else if (state.keys.left) {
        targetVel = -driveSpeed * 0.7;
      }

      state.velocityKmPerSec += (targetVel - state.velocityKmPerSec) * Math.min(1.0, dt * 4.0);
      state.odometerKm = Math.max(0.0, state.odometerKm + state.velocityKmPerSec * dt);
      state.wheelSpinPhase += state.velocityKmPerSec * dt * (state.inPurgatory ? 22 : 9.5);
      audioEngine.setDriving(Math.abs(state.velocityKmPerSec) > 0.01);
    } else {
      state.velocityKmPerSec = 0.0;
      audioEngine.setDriving(false);
    }
  }

  // =========================================================================
  // 9. INPUT & INTERACTION CONTROLLER
  // =========================================================================
  function triggerPhaseRocking(key) {
    if (!state.inPurgatory || state.purgatoryFreed) return;
    if (state.lastRockKey !== key) {
      state.lastRockKey = key;
      state.rockCycles++;
      state.odometerKm += 0.045; // Incremental forward movement
      state.wheelSpinPhase += 1.8;
      audioEngine.playSpectrometerClick();

      if (state.rockCycles >= 7) {
        state.purgatoryFreed = true;
        state.inPurgatory = false;
        state.shoulderSparkTimer = 1.2;
        audioEngine.playSparkSound();
        setControlPrompt("");
      }
    }
  }

  function triggerSpaceAction() {
    audioEngine.init();
    // Phase 1 rock scan
    if (state.currentPhaseId === 1 && state.phase1DrillPromptShown && !state.phase1Drilled) {
      state.isDrilling = true;
      return;
    }

    // Phase 5 look for sun climax
    if (state.currentPhaseId === 5 && state.odometerKm >= 8.15 && !state.finalClimbDone) {
      state.finalClimbDone = true;
      setControlPrompt("");

      // Trigger pitch black fade & memorial sequence
      setTimeout(() => {
        const blackout = document.getElementById('finalBlackoutScreen');
        const quoteBox = document.getElementById('finalQuoteBox');
        const memorial = document.getElementById('finalMemorialText');
        const actionBtn = document.getElementById('finalActionBtn');

        if (blackout) {
          blackout.classList.remove('opacity-0', 'pointer-events-none');
          blackout.classList.add('opacity-100');
        }

        setTimeout(() => {
          if (quoteBox) {
            quoteBox.classList.remove('opacity-0', 'scale-95');
            quoteBox.classList.add('opacity-100', 'scale-100');
          }
          audioEngine.playFinaleChord();
        }, 1200);

        setTimeout(() => {
          if (memorial) {
            memorial.classList.remove('opacity-0');
            memorial.classList.add('opacity-100');
          }
        }, 3600);

        setTimeout(() => {
          if (actionBtn) {
            actionBtn.classList.remove('opacity-0');
            actionBtn.classList.add('opacity-100');
          }
        }, 6200);

      }, 1400);
    }
  }

  function restartMission() {
    state.odometerKm = 0.0;
    state.velocityKmPerSec = 0.0;
    state.roverSpeed = 0.0;
    state.currentPhaseId = 1;
    state.activeSubtitleIndex = 0;
    state.activeSubtitleText = "";
    state.activePromptText = "";
    state.phase1DrillPromptShown = false;
    state.phase1Drilled = false;
    state.isDrilling = false;
    state.drillProgress = 0.0;
    state.armDeployProgress = 0.0;
    state.inPurgatory = false;
    state.rockCycles = 0;
    state.purgatoryFreed = false;
    state.lastRockKey = '';
    state.shoulderSparkTimer = 0.0;
    state.dustFactor = 0.0;
    state.windDevilCleaned = false;
    state.windGustTimer = 0.0;
    state.isJammedWheel = false;
    state.dir = 1;
    state.amnesiaGlitchTimer = 0.0;
    state.antennaBeamProgress = 0.0;
    state.marathonBeamDone = false;
    state.finalClimbDone = false;
    state.keys.left = false;
    state.keys.right = false;
    state.displayedSubtitles.clear();

    const blackout = document.getElementById('finalBlackoutScreen');
    if (blackout) {
      blackout.classList.remove('opacity-100');
      blackout.classList.add('opacity-0', 'pointer-events-none');
    }
    const quoteBox = document.getElementById('finalQuoteBox');
    if (quoteBox) {
      quoteBox.classList.remove('opacity-100', 'scale-100');
      quoteBox.classList.add('opacity-0', 'scale-95');
    }
    const memorial = document.getElementById('finalMemorialText');
    if (memorial) {
      memorial.classList.remove('opacity-100');
      memorial.classList.add('opacity-0');
    }
    const actionBtn = document.getElementById('finalActionBtn');
    if (actionBtn) {
      actionBtn.classList.remove('opacity-100');
      actionBtn.classList.add('opacity-0');
    }

    setSubtitle(PHASES[0].subtitles[0].text);
    setControlPrompt("[Hold D to Drive]");
  }

  function triggerRadioBeam() {
    if (state.currentPhaseId === 4 && state.odometerKm >= 6.10 && !state.marathonBeamDone) {
      audioEngine.init();
      state.antennaBeamProgress = 0.01;
      audioEngine.playRadioTransmissionChirp();
    }
  }

  function setupControls() {
    // Wire Replay Button
    const actionBtn = document.getElementById('finalActionBtn');
    if (actionBtn) {
      actionBtn.onclick = () => {
        restartMission();
      };
    }

    // Wire Audio Toggle Button
    const audioBtn = document.getElementById('btnAudioToggle');
    if (audioBtn) {
      audioBtn.onclick = () => {
        state.audioMuted = !state.audioMuted;
        audioEngine.setMuted(state.audioMuted);
        audioBtn.textContent = state.audioMuted ? '🔇 SFX: OFF' : '🔊 SFX: ON';
      };
    }

    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener('keydown', (e) => {
      if (!window.__experienceActive) return;
      audioEngine.init();
      const key = e.key.toLowerCase();

      if (key === 'd' || key === 'w' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        state.keys.right = true;
        state.keys.left = false;
        triggerPhaseRocking('d');
      } else if (key === 'a' || key === 's' || e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        state.keys.left = true;
        state.keys.right = false;
        triggerPhaseRocking('a');
      } else if (e.key === ' ' || e.code === 'Space') {
        triggerSpaceAction();
      } else if (key === 'e') {
        triggerRadioBeam();
      } else if (e.key === 'Escape') {
        if (typeof window.closeOverlays === 'function') {
          window.closeOverlays();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!window.__experienceActive) return;
      const key = e.key.toLowerCase();
      if (key === 'd' || key === 'w' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        state.keys.right = false;
      } else if (key === 'a' || key === 's' || e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        state.keys.left = false;
      } else if (e.key === ' ' || e.code === 'Space') {
        if (state.currentPhaseId === 1) state.isDrilling = false;
      }
    });

    // Full-canvas interactive touch & mouse steering
    if (storyCanvas) {
      const handlePointer = (e, isDown) => {
        if (!window.__experienceActive) return;
        if (!isDown) {
          state.keys.right = false;
          state.keys.left = false;
          state.isDrilling = false;
          return;
        }
        audioEngine.init();

        const rect = storyCanvas.getBoundingClientRect();
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const relX = clientX - rect.left;

        if (state.currentPhaseId === 1 && state.phase1DrillPromptShown && !state.phase1Drilled) {
          triggerSpaceAction();
          return;
        }
        if (state.currentPhaseId === 4 && state.odometerKm >= 6.10 && !state.marathonBeamDone) {
          triggerRadioBeam();
          return;
        }
        if (state.currentPhaseId === 5 && state.odometerKm >= 8.15 && !state.finalClimbDone) {
          triggerSpaceAction();
          return;
        }

        if (relX > rect.width * 0.5) {
          state.keys.right = true;
          state.keys.left = false;
          triggerPhaseRocking('d');
        } else {
          state.keys.left = true;
          state.keys.right = false;
          triggerPhaseRocking('a');
        }
      };

      storyCanvas.addEventListener('mousedown', (e) => handlePointer(e, true));
      storyCanvas.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) handlePointer(e, true);
      });
      window.addEventListener('mouseup', (e) => handlePointer(e, false));

      storyCanvas.addEventListener('touchstart', (e) => handlePointer(e, true), { passive: true });
      storyCanvas.addEventListener('touchmove', (e) => handlePointer(e, true), { passive: true });
      window.addEventListener('touchend', (e) => handlePointer(e, false));
    }
  }

  // =========================================================================
  // 10. PUBLIC MODULE INTERFACE
  // =========================================================================
  window.startMissionExperience = function () {
    window.__experienceActive = true;
    storyCanvas = document.getElementById('storyCanvas');
    if (!storyCanvas) return;
    ctx2d = storyCanvas.getContext('2d');

    initParticles();
    resizeCanvas();
    setupControls();

    if (state.displayedSubtitles.size === 0) {
      state.displayedSubtitles.add(PHASES[0].subtitles[0].text);
      setSubtitle(PHASES[0].subtitles[0].text);
      setControlPrompt("[Hold D to Drive]");
    }

    // Reset blackout & memorial screens if restarting
    const blackout = document.getElementById('finalBlackoutScreen');
    if (blackout) {
      blackout.classList.add('opacity-0', 'pointer-events-none');
      blackout.classList.remove('opacity-100');
    }

    lastTime = performance.now();
    if (animId) cancelAnimationFrame(animId);

    function loop(now) {
      if (!window.__experienceActive) return;
      animId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const timeSec = now / 1000;

      updateGameplay(dt, timeSec);
      audioEngine.update(dt);
      try {
        render2DExperience(dt, timeSec);
      } catch (err) {
        console.error("render2DExperience error:", err);
      }
    }

    animId = requestAnimationFrame(loop);
    audioEngine.init();
  };

  window.pauseMissionExperience = function () {
    window.__experienceActive = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    state.keys.left = false;
    state.keys.right = false;
    audioEngine.setDriving(false);
  };

  window.resizeMissionExperience = function () {
    if (storyCanvas) resizeCanvas();
  };

  window.addEventListener('resize', () => {
    if (window.__experienceActive) resizeCanvas();
  });

})();
