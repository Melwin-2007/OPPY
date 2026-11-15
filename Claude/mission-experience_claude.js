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

        // Ducking gain to duck ambient audio when narrator speaks
        this.duckGain = this.ctx.createGain();
        this.duckGain.gain.value = 1.0;
        this.duckGain.connect(this.ctx.destination);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0.035;

        windSource.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.duckGain);
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
        this.servoGain.connect(this.duckGain);
        this.servoOsc.start();

        // Light BGM Pad: gentle warm space ambience
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.026;
        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 360;
        padFilter.Q.value = 1.0;

        const chordFreqs = [146.83, 220.00, 185.00];
        chordFreqs.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const noteGain = this.ctx.createGain();
          noteGain.gain.value = 0.33;
          osc.connect(noteGain);
          noteGain.connect(padFilter);
          osc.start();
        });
        padFilter.connect(this.bgmGain);
        this.bgmGain.connect(this.duckGain);

        this.initialized = true;
      } catch (err) {
        // Audio will initialize upon first user gesture
      }
    }

    duck(level) {
      if (!this.initialized || !this.ctx || !this.duckGain) return;
      const now = this.ctx.currentTime;
      this.duckGain.gain.cancelScheduledValues(now);
      this.duckGain.gain.setTargetAtTime(level || 0.35, now, 0.2);
    }

    unduck() {
      if (!this.initialized || !this.ctx || !this.duckGain) return;
      const now = this.ctx.currentTime;
      this.duckGain.gain.cancelScheduledValues(now);
      this.duckGain.gain.setTargetAtTime(1.0, now, 0.6);
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
        gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
          gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.22);
          osc.stop(now + idx * 0.22 + 10.0);
        });
      } catch (e) {}
    }
  }

  const audioEngine = new ProceduralAudioEngine();

  ProceduralAudioEngine.prototype.playStatic = function () {
    if (!this.initialized || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * 1.3);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.05;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
    } catch (e) {}
  };

  // ---------- female elegant narrator engine (cinematic storytelling) ----------
  const narrator = {
    enabled: true,
    speaking: false,
    currentId: null,
    currentUtterance: null,
    voice: null,
    heartbeat: null,

    init() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      this.pickVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
      }
      if (!this.heartbeat) {
        this.heartbeat = setInterval(() => {
          if (this.speaking && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 1500);
      }
    },

    pickVoice() {
      if (!window.speechSynthesis) return;
      const list = window.speechSynthesis.getVoices();
      if (!list || list.length === 0) return;

      // 1. British / UK English Female (Highest elegance, clear articulation & storytelling cadence)
      let v = list.find((x) => 
        /en[-_]GB/i.test(x.lang) && 
        /female|sonia|libby|hazel|maisie|susan|victoria|amy|serena|kate/i.test(x.name)
      );
      if (!v) {
        v = list.find((x) => /en[-_]GB/i.test(x.lang) && !/male|david|george|oliver|brian/i.test(x.name));
      }

      // 2. Commonwealth / Foreign Accented English Female (Irish, Australian, South African)
      if (!v) {
        v = list.find((x) => 
          /en[-_](IE|AU|NZ|ZA|IN)/i.test(x.lang) && 
          /female|karen|moira|catherine|clara|fiona|neerja|natasha/i.test(x.name)
        );
      }
      if (!v) {
        v = list.find((x) => /en[-_](IE|AU|NZ|ZA)/i.test(x.lang) && !/male/i.test(x.name));
      }

      // 3. High-quality natural English female voice
      if (!v) {
        v = list.find((x) => 
          x.lang.startsWith('en') && 
          /female|natural|samantha|aria|jenny|zira/i.test(x.name) && 
          !/male|david|mark/i.test(x.name)
        );
      }

      // 4. Any en-GB voice
      if (!v) {
        v = list.find((x) => /en[-_]GB/i.test(x.lang));
      }

      // 5. Fallback English
      if (!v) {
        v = list.find((x) => x.lang.startsWith('en')) || list[0];
      }

      this.voice = v;
    },

    cleanText(t) {
      if (!t) return '';
      return t
        .replace(/\[.*?\]/g, '')
        .replace(/-105°C/g, 'minus one hundred and five degrees Celsius')
        .replace(/19,000 km\/h/g, 'nineteen thousand kilometers per hour')
        .replace(/42-kilometer/g, 'forty-two kilometer')
        .replace(/45\.16 km/g, 'forty-five point one six kilometers')
        .replace(/192 meters/g, 'one hundred and ninety-two meters')
        .replace(/1 meter/g, 'one meter')
        .replace(/5-DOF/g, 'five-degree-of-freedom')
        .replace(/APXS/g, 'A-P-X-S')
        .replace(/Pancam/g, 'Pan-cam')
        .replace(/Navcam/g, 'Nav-cam')
        .replace(/tau > 10\.8/g, 'tau greater than ten point eight')
        .replace(/645 watt-hours/g, 'six hundred forty-five watt-hours')
        .replace(/22 watt-hours/g, 'twenty-two watt-hours')
        .replace(/2004/g, 'two thousand and four')
        .replace(/2005/g, 'two thousand and five')
        .replace(/2007/g, 'two thousand and seven')
        .replace(/2010/g, 'twenty ten')
        .replace(/2015/g, 'twenty fifteen')
        .replace(/2018/g, 'twenty eighteen')
        .replace(/2019/g, 'twenty nineteen')
        .replace(/90-day/g, 'ninety-day')
        .replace(/90 days/g, 'ninety days')
        .replace(/14 Years/g, 'fourteen years')
        .replace(/15 years/g, 'fifteen years')
        .replace(/—/g, ', ')
        .replace(/–/g, ' to ')
        .replace(/'/g, "'")
        .trim();
    },

    stop() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      this.speaking = false;
      this.currentId = null;
      this.currentUtterance = null;
      window.__activeNarratorUtterance = null;
      if (audioEngine && audioEngine.unduck) audioEngine.unduck();
    },

    speak(rawText, id) {
      if (!this.enabled || !rawText) return;
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const text = this.cleanText(rawText);
      if (!text) return;

      // Avoid repeating same caption if currently active
      if (id && this.currentId === id && this.speaking) return;

      // STOP previous voice immediately: guarantee NO overlapping voices!
      this.stop();

      this.currentId = id || text;
      this.pickVoice();

      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        u.voice = this.voice;
        u.lang = this.voice.lang || 'en-GB';
      } else {
        u.lang = 'en-GB';
      }

      // Elegant, measured storytelling cadence
      u.rate = 0.91;  // slightly relaxed, articulate pacing for clear storytelling
      u.pitch = 1.02; // warm, resonant tone
      u.volume = 1.0;

      u.onstart = () => {
        this.speaking = true;
        if (audioEngine && audioEngine.duck) audioEngine.duck(0.38);
      };

      u.onend = () => {
        this.speaking = false;
        this.currentUtterance = null;
        window.__activeNarratorUtterance = null;
        if (audioEngine && audioEngine.unduck) audioEngine.unduck();
      };

      u.onerror = () => {
        this.speaking = false;
        this.currentUtterance = null;
        window.__activeNarratorUtterance = null;
        if (audioEngine && audioEngine.unduck) audioEngine.unduck();
      };

      this.currentUtterance = u;
      window.__activeNarratorUtterance = u;

      try {
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }
  };

  // =========================================================================
  // 2. WORLD LAYOUT (km along the story path) & THE 5-PHASE STORYLINE
  // =========================================================================
  const L = {
    p1End: 2.4, p2End: 5.0, p3End: 8.2, p4End: 12.0, end: 15.0,
    outcrop: 1.75, drillStop: 1.655,
    duneStart: 3.1, duneEnd: 4.4, trap: 3.75,
    dustStart: 5.3, gust: 7.35,
    jam: 9.3, amnesia: 10.3, marathon: 11.4,
    crest: 14.7
  };

  const PHASES = [
    { id: 1, kmStart: 0.0, kmEnd: L.p1End,
      skyTop: [78, 48, 28], skyMid: [168, 108, 64], skyBottom: [224, 168, 114],
      terrainBase: [146, 64, 14], terrainShadow: [69, 26, 3] },
    { id: 2, kmStart: L.p1End, kmEnd: L.p2End,
      skyTop: [88, 54, 30], skyMid: [178, 118, 70], skyBottom: [230, 175, 120],
      terrainBase: [180, 83, 9], terrainShadow: [120, 53, 15] },
    { id: 3, kmStart: L.p2End, kmEnd: L.p3End,
      skyTop: [92, 48, 24], skyMid: [146, 84, 42], skyBottom: [184, 112, 60],
      terrainBase: [120, 53, 15], terrainShadow: [69, 26, 3] },
    { id: 4, kmStart: L.p3End, kmEnd: L.p4End,
      skyTop: [34, 24, 52], skyMid: [96, 54, 76], skyBottom: [200, 104, 84],
      terrainBase: [107, 33, 110], terrainShadow: [49, 10, 80] },
    { id: 5, kmStart: L.p4End, kmEnd: L.end,
      skyTop: [58, 22, 18], skyMid: [96, 38, 28], skyBottom: [132, 56, 38],
      terrainBase: [90, 18, 18], terrainShadow: [28, 6, 6] }
  ];

  // Every line of cinematic story text (exactly as written in the story spec)
  const STORY = {
    p1a: "January 25, 2004. Wrapped in giant airbags, Opportunity bounces 26 times across Mars and rolls straight into Eagle Crater.",
    p1b: "NASA built her to survive for only 90 days and drive less than a kilometer before Martian dust choked her solar panels.",
    p1c: "Reaching out her robotic arm, she spins her diamond-tipped drill into the ancient bedrock...",
    p1d: "Inside the rock, her sensors find tiny iron pebbles called 'Martian Blueberries'\u2014proving that liquid water once flowed across Mars.",
    p2a: "2005. Opportunity has already outlived her 90-day warranty, pushing deeper into the unknown desert.",
    p2b: "Suddenly, all six wheels break through a thin crust and sink axle-deep into soft, powdery sand\u2014a trap called Purgatory Dune.",
    p2c: "Her wheels spin helplessly. For five weeks, engineers on Earth command her to rock millimeter by millimeter\u2014spinning her wheels 192 meters just to move 1 meter...",
    p2d: "Her cleats finally bite into solid rock and she breaks free\u2014even as a heater switch breaks in her robotic shoulder, forcing her to sleep in the freezing -105\u00B0C cold every night to save battery.",
    p3a: "2007. A monstrous planet-wide dust storm swallows Mars, blocking 99% of the Sun.",
    p3b: "Thick red dust suffocates her solar wings. Her power drops to the edge of freezing death, and she is forced into silent hibernation in the dark.",
    p3c: "Just when all hope seems lost, Mars itself saves her\u2014swirling whirlwinds sweep across her deck, blasting the dust off her solar panels and bringing her back to life.",
    p4a: "2010. Halfway across the planet, her twin rover Spirit gets trapped in soft soil and freezes to death in the winter dark. Opportunity is now completely alone on Mars.",
    p4b: "Years of hard driving take their toll. Her front steering motor jams, forcing her to drive backward across the plains to keep her arthritic wheel gears from seizing.",
    p4c: "After a decade of cosmic radiation, her flash memory begins to fail\u2014giving her nightly amnesia that wipes everything she learns the moment she goes to sleep.",
    p4d: "Every evening before sunset, she tilts her antenna to the sky and beams every photograph and memory home before her mind resets\u2014becoming the first machine to complete a 42-kilometer marathon on another world.",
    p5a: "June 2018. Fourteen years on Mars\u2014nearly 60 times longer than she was ever meant to live. Opportunity climbs into Perseverance Valley.",
    p5b: "Above her, the darkest dust storm in Martian history blots out the sky, turning midday darker than midnight.",
    p5c: "Freezing in the dark, her solar wings can no longer generate enough energy to keep her warm or keep her internal clock ticking.",
    p5d: "On June 10, 2018, she uses her last breath of battery to point her camera up toward where the Sun should be, sending back one final, static-filled frame of the dark...",
    quote: "My battery is low and it\u2019s getting dark.",
    memorial: "For eight months, Earth called out into the silence more than a thousand times. On February 13, 2019, NASA beamed one last song across the stars\u2014\u2018I\u2019ll Be Seeing You\u2019\u2014and let her rest. 90 Days Planned. 14 Years Survived."
  };

  const PROMPTS = {
    drive: "[Hold D to Drive]",
    drill: "[Hold SPACE to Drill & Scan Rock]",
    rock: "[Tap A and D Repeatedly to Rock Free]",
    wind: "[Hold D to Drive Through the Wind Gusts]",
    backward: "[Hold D to Drive Backward]",
    beam: "[Press E to Beam Memories Home Before Sunset]",
    climb: "[Hold D to Climb Perseverance Valley]",
    sun: "[Press SPACE to Look for the Sun]",
    leave: "[Tap or Press ESC to Return]"
  };

  // =========================================================================
  // 3. MASTER GAMEPLAY STATE
  // =========================================================================
  function makeState() {
    return {
      odometerKm: 0.1,
      velocityKmPerSec: 0.0,
      wheelSpinPhase: 0.0,
      keys: { left: false, right: false },
      facing: 1,          // animated horizontal flip (1 forward, -1 reversed)
      facingTarget: 1,
      currentPhaseId: 1,
      lastPhaseId: 0,
      phaseHintTimer: 0.0,
      idleTime: 0.0,
      clock: 0.0,
      said: new Set(),

      // Phase 1
      armReady: false,
      phase1Drilled: false,
      isDrilling: false,
      drillProgress: 0.0,
      armDeployProgress: 0.0,
      blueberryGlow: 0.0,

      // Phase 2
      inPurgatory: false,
      purgatoryDone: false,
      rockCycles: 0,
      lastRockKey: null,
      rockTilt: 0.0,
      rockKick: 0.0,
      sink: 0.0,
      shoulderStrain: 0.0,
      shoulderStrainFlicker: 0.0,

      // Phase 3
      dustFactor: 0.0,
      tau: 0.5,
      windGustTimer: 0.0,
      windDevilCleaned: false,

      // Phase 4
      isJammedWheel: false,
      glitch: 0.0,
      glitchBurst: 0.0,
      marathonBeamDone: false,
      antennaBeamProgress: 0.0,

      // Phase 5 / ending
      mastTiltProgress: 0.0,
      ending: false,
      endT: 0.0,
      endDone: false,
      staticFlash: 0.0,
      endStages: {}
    };
  }

  let state = makeState();

  // DOM / canvas handles
  let storyCanvas = null;
  let ctx2d = null;
  let animId = null;
  let lastTime = 0;
  let listenersBound = false;
  let noiseCanvas = null;

  const particles = [];
  const stars = [];

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * 2000, y: Math.random() * 800,
        vx: 40 + Math.random() * 90, vy: -15 + Math.random() * 30,
        radius: 0.8 + Math.random() * 1.8
      });
    }
    stars.length = 0;
    for (let i = 0; i < 70; i++) {
      stars.push({ x: Math.random() * 2000, y: Math.random() * 450, size: 0.7 + Math.random() * 1.4, twinkle: Math.random() * Math.PI * 2 });
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function lerpArr(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }

  function getCurrentPhase(km) {
    for (let p of PHASES) {
      if (km >= p.kmStart && km < p.kmEnd) return p;
    }
    return PHASES[PHASES.length - 1];
  }

  // Smoothly blended sky / ground palette between phase centres
  function paletteAt(km) {
    const c = PHASES.map((p) => (p.kmStart + p.kmEnd) / 2);
    if (km <= c[0]) return PHASES[0];
    if (km >= c[c.length - 1]) return PHASES[PHASES.length - 1];
    for (let i = 0; i < c.length - 1; i++) {
      if (km < c[i + 1]) {
        const t = smooth((km - c[i]) / (c[i + 1] - c[i]));
        const a = PHASES[i], b = PHASES[i + 1];
        return {
          skyTop: lerpArr(a.skyTop, b.skyTop, t), skyMid: lerpArr(a.skyMid, b.skyMid, t),
          skyBottom: lerpArr(a.skyBottom, b.skyBottom, t),
          terrainBase: lerpArr(a.terrainBase, b.terrainBase, t),
          terrainShadow: lerpArr(a.terrainShadow, b.terrainShadow, t)
        };
      }
    }
    return PHASES[0];
  }

  // Overall scene darkness (dust storm, dusk, final blackout)
  const DARK_KF = [
    [0, 0], [L.dustStart, 0], [L.dustStart + 1.4, 0.5], [L.gust, 0.55], [L.gust + 0.9, 0.1],
    [L.p3End, 0.08], [L.amnesia, 0.1], [L.marathon + 0.5, 0.28], [L.p4End, 0.25],
    [L.p4End + 0.6, 0.35], [L.crest - 0.3, 0.88], [L.crest, 1.0], [99, 1.0]
  ];
  function darknessAt(km) {
    for (let i = 0; i < DARK_KF.length - 1; i++) {
      const a = DARK_KF[i], b = DARK_KF[i + 1];
      if (km >= a[0] && km < b[0]) return a[1] + (b[1] - a[1]) * smooth((km - a[0]) / (b[0] - a[0]));
    }
    return 1.0;
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
  // 4. CINEMATIC SUBTITLE DIRECTOR & CONTROL PROMPT CONTROLLER
  //    (the ONLY two kinds of on-screen text)
  // =========================================================================
  const subQueue = [];
  let subCurrent = null;
  let subGap = 0;
  let shownPrompt = '';

  function $(id) { return document.getElementById(id); }

  function holdFor(text) { return Math.max(4.5, 2.5 + text.length * 0.055); }

  function say(key, holdOverride) {
    if (state.said.has(key)) return;
    state.said.add(key);
    const text = STORY[key];
    subQueue.push({ text: text, hold: holdOverride || holdFor(text), t: 0 });
  }

  function updateSubtitles(dt) {
    const box = $('cinematicSubtitleBox');
    const el = $('cinematicSubtitleText');
    if (subCurrent) {
      subCurrent.t += dt;
      if (subCurrent.t >= subCurrent.hold) {
        if (box) box.style.opacity = '0';
        subCurrent = null;
        subGap = 1.0;
      }
    } else if (subQueue.length) {
      subGap -= dt;
      if (subGap <= 0) {
        subCurrent = subQueue.shift();
        if (el) el.textContent = subCurrent.text;
        if (box) box.style.opacity = '1';
        narrator.speak(subCurrent.text);
      }
    }
  }

  function applyPrompt(text) {
    if (text === shownPrompt) return;
    shownPrompt = text;
    const box = $('controlPromptBox');
    const el = $('controlPromptText');
    if (!box || !el) return;
    if (text) {
      el.textContent = text;
      box.style.opacity = '1';
    } else {
      box.style.opacity = '0';
    }
  }

  // Drive prompts only appear when the player is idle (or briefly at a phase start);
  // action prompts appear exactly when that action is needed.
  function desiredPrompt() {
    const km = state.odometerKm;
    const idle = state.idleTime > 1.1 || state.phaseHintTimer > 0;
    const id = state.currentPhaseId;

    if (state.endDone) return PROMPTS.leave;
    if (state.ending) return '';

    if (id === 1) {
      if (state.armReady && !state.phase1Drilled) return state.isDrilling ? '' : PROMPTS.drill;
      return idle ? PROMPTS.drive : '';
    }
    if (id === 2) {
      if (state.inPurgatory) return PROMPTS.rock;
      return idle ? PROMPTS.drive : '';
    }
    if (id === 3) return idle ? PROMPTS.wind : '';
    if (id === 4) {
      if (km >= L.marathon - 0.001 && !state.marathonBeamDone && state.antennaBeamProgress === 0) return PROMPTS.beam;
      if (state.antennaBeamProgress > 0) return '';
      return idle ? (state.isJammedWheel ? PROMPTS.backward : PROMPTS.drive) : '';
    }
    if (id === 5) {
      if (km >= L.crest - 0.001) return PROMPTS.sun;
      return idle ? PROMPTS.climb : '';
    }
    return '';
  }

  // =========================================================================
  // 5. PROCEDURAL MARTIAN ELEVATION GENERATOR
  // =========================================================================
  function bump(x, c, w, a) { return a * Math.exp(-Math.pow((x - c) / w, 2)); }

  function getTerrainElevation(k) {
    let h = Math.sin(k * 3.4) * 5 + Math.cos(k * 7.8) * 3;

    // Eagle Crater bowl + bedrock outcrop
    h += bump(k, 0.75, 0.6, -20);
    h += bump(k, L.outcrop, 0.14, 12);

    // Purgatory Dune sand ripples
    if (k > L.duneStart - 0.3 && k < L.duneEnd + 0.3) {
      const win = smooth((k - (L.duneStart - 0.3)) / 0.3) * (1 - smooth((k - L.duneEnd) / 0.3));
      h += (Math.sin((k - L.duneStart) * 18) * 7 - 9) * win;
    }

    // Rolling plains, fading out into the Perseverance Valley climb
    const climb = clamp((k - L.p4End) / (L.crest - L.p4End), 0, 1);
    if (k > L.p2End) {
      const ramp = smooth((k - L.p2End) / 0.6);
      h += (Math.sin(k * 2.3) * 10 + Math.cos(k * 1.1) * 12) * ramp * (1 - climb);
    }
    h += Math.pow(climb, 1.15) * 200 + Math.sin(k * 14) * 6 * climb;

    return h;
  }

  function kmToScreenX(targetKm, roverKm, W, dpr) {
    return W * 0.42 + (targetKm - roverKm) * 880 * dpr;
  }

  function getScreenGroundY(screenX, roverKm, W, H, dpr) {
    const worldKm = roverKm + (screenX - W * 0.42) / (880 * dpr);
    return H * 0.72 - getTerrainElevation(worldKm) * dpr;
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
    const km = state.odometerKm;
    const pal = paletteAt(km);
    const dark = darknessAt(km);
    const skyK = 1 - dark * 0.8;
    const groundK = 1 - dark * 0.85;
    const rgb = (c, k) => `rgb(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)})`;
    const phaseNow = getCurrentPhase(km);

    ctx2d.save();

    // 1. SKY
    const horizonY = H * 0.60;
    const skyGrad = ctx2d.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, rgb(pal.skyTop, skyK));
    skyGrad.addColorStop(0.55, rgb(pal.skyMid, skyK));
    skyGrad.addColorStop(1, rgb(pal.skyBottom, skyK));
    ctx2d.fillStyle = skyGrad;
    ctx2d.fillRect(0, 0, W, H);

    // Dusk progress (Phase 4): the sun sinks as the nightly memory-wipe approaches
    const sunSet = smooth((km - L.amnesia) / (L.marathon + 0.8 - L.amnesia));

    // Twilight stars
    const starVis = sunSet * (1 - clamp((dark - 0.1) / 0.4, 0, 1));
    if (starVis > 0.02) {
      ctx2d.fillStyle = '#ffffff';
      stars.forEach((s) => {
        const a = (0.25 + 0.55 * Math.sin(timeSec * 2.2 + s.twinkle)) * starVis;
        if (a > 0.04) {
          ctx2d.globalAlpha = a;
          ctx2d.fillRect(s.x % W, s.y % (horizonY * 0.9), s.size * dpr, s.size * dpr);
        }
      });
      ctx2d.globalAlpha = 1.0;
    }

    // Martian sun
    const sunAlpha = Math.max(0, 1 - dark * 1.25);
    if (sunAlpha > 0.02) {
      const sunX = W * 0.78 - clamp(km, 0, 15) * 6 * dpr;
      const sunY = H * 0.28 + sunSet * (horizonY - H * 0.28 - 6 * dpr);
      ctx2d.save();
      ctx2d.globalAlpha = sunAlpha;
      const halo = ctx2d.createRadialGradient(sunX, sunY, 6 * dpr, sunX, sunY, 120 * dpr);
      halo.addColorStop(0, 'rgba(255, 250, 240, 0.95)');
      halo.addColorStop(0.2, 'rgba(254, 215, 170, 0.45)');
      halo.addColorStop(0.6, 'rgba(251, 146, 60, 0.12)');
      halo.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx2d.fillStyle = halo;
      ctx2d.beginPath();
      ctx2d.arc(sunX, sunY, 120 * dpr, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.fillStyle = '#fffdf7';
      ctx2d.beginPath();
      ctx2d.arc(sunX, sunY, 14 * dpr, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.restore();
    }

    // 2. PARALLAX RIDGES
    const centerScreenX = W * 0.42;
    const pixelsPerKm = 880 * dpr;
    ctx2d.fillStyle = rgb(pal.skyTop, skyK * 0.8);
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 32 * dpr) {
      const wd = (x - centerScreenX) / (pixelsPerKm * 0.2) + km * 0.25;
      ctx2d.lineTo(x, horizonY - 35 * dpr - (Math.sin(wd * 1.5) * 18 + Math.cos(wd * 3.8) * 9) * dpr);
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();
    ctx2d.fill();

    ctx2d.fillStyle = rgb(pal.skyMid, skyK * 0.7);
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 24 * dpr) {
      const wd = (x - centerScreenX) / (pixelsPerKm * 0.5) + km * 0.55;
      ctx2d.lineTo(x, horizonY - 12 * dpr - (Math.sin(wd * 2.2) * 14 + Math.cos(wd * 5.1) * 7) * dpr);
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();
    ctx2d.fill();

    // 3. FOREGROUND TERRAIN
    ctx2d.beginPath();
    ctx2d.moveTo(0, H);
    for (let x = 0; x <= W; x += 16 * dpr) {
      ctx2d.lineTo(x, getScreenGroundY(x, km, W, H, dpr));
    }
    ctx2d.lineTo(W, H);
    ctx2d.closePath();
    const groundGrad = ctx2d.createLinearGradient(0, horizonY - 80 * dpr, 0, H);
    groundGrad.addColorStop(0, rgb(pal.terrainBase, groundK));
    groundGrad.addColorStop(1, rgb(pal.terrainShadow, groundK));
    ctx2d.fillStyle = groundGrad;
    ctx2d.fill();

    // 4. LANDMARK PROPS
    // Lander airbags (Eagle Crater landing site)
    const landerX = kmToScreenX(0.0, km, W, dpr);
    if (landerX > -150 * dpr && landerX < W + 150 * dpr) {
      const ly = getScreenGroundY(landerX, km, W, H, dpr);
      ctx2d.save();
      ctx2d.translate(landerX, ly);
      ctx2d.fillStyle = '#f8fafc';
      ctx2d.strokeStyle = '#cbd5e1';
      ctx2d.lineWidth = 1.5 * dpr;
      [-22, 0, 22].forEach((offX) => {
        ctx2d.beginPath();
        ctx2d.ellipse(offX * dpr, -8 * dpr, 14 * dpr, 9 * dpr, 0, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.stroke();
      });
      ctx2d.restore();
    }

    // Bedrock outcrop with Martian Blueberries
    const outcropX = kmToScreenX(L.outcrop, km, W, dpr);
    if (outcropX > -150 * dpr && outcropX < W + 150 * dpr) {
      const oy = getScreenGroundY(outcropX, km, W, H, dpr);
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
      const glow = state.blueberryGlow;
      [[-18, -10], [-6, -14], [8, -12], [18, -8], [-2, -6], [12, -16], [-28, -4], [-36, 0]].forEach(([bx, by]) => {
        if (glow > 0.02) {
          ctx2d.fillStyle = `rgba(56, 189, 248, ${0.28 * glow})`;
          ctx2d.beginPath();
          ctx2d.arc(bx * dpr, by * dpr, (3.2 + 6 * glow) * dpr, 0, Math.PI * 2);
          ctx2d.fill();
        }
        ctx2d.fillStyle = '#38bdf8';
        ctx2d.beginPath();
        ctx2d.arc(bx * dpr, by * dpr, 3.2 * dpr, 0, Math.PI * 2);
        ctx2d.fill();
      });
      ctx2d.restore();
    }

    // Marathon marker rock with a small flag (42.195 km)
    const marathonX = kmToScreenX(L.marathon + 0.14, km, W, dpr);
    if (marathonX > -150 * dpr && marathonX < W + 150 * dpr) {
      const my = getScreenGroundY(marathonX, km, W, H, dpr);
      ctx2d.save();
      ctx2d.translate(marathonX, my);
      ctx2d.fillStyle = rgb([88, 28, 135], groundK);
      ctx2d.beginPath();
      ctx2d.moveTo(-30 * dpr, 5 * dpr);
      ctx2d.lineTo(-18 * dpr, -28 * dpr);
      ctx2d.lineTo(16 * dpr, -30 * dpr);
      ctx2d.lineTo(34 * dpr, 5 * dpr);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.strokeStyle = '#e2e8f0';
      ctx2d.lineWidth = 1.6 * dpr;
      ctx2d.beginPath();
      ctx2d.moveTo(0, -29 * dpr);
      ctx2d.lineTo(0, -62 * dpr);
      ctx2d.stroke();
      ctx2d.fillStyle = '#38bdf8';
      ctx2d.beginPath();
      ctx2d.moveTo(0, -62 * dpr);
      ctx2d.lineTo(20 * dpr, -56 * dpr);
      ctx2d.lineTo(0, -50 * dpr);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();
    }

    // 5. ROVER KINEMATICS
    const roverScreenX = centerScreenX;
    const wheelRadius = 13.5 * dpr;
    const wheelBaseSpan = 64 * dpr;

    const wRearX = roverScreenX - wheelBaseSpan * 0.5;
    const wMidX = roverScreenX - wheelBaseSpan * 0.12;
    const wFrontX = roverScreenX + wheelBaseSpan * 0.5;

    const sinkOffset = state.sink * 7 * dpr;
    const jig = state.rockKick * 1.8 * dpr * Math.sin(timeSec * 34);
    const wRearY = getScreenGroundY(wRearX, km, W, H, dpr) - wheelRadius * 0.75 + sinkOffset + jig;
    const wMidY = getScreenGroundY(wMidX, km, W, H, dpr) - wheelRadius * 0.75 + sinkOffset - jig;
    const wFrontY = getScreenGroundY(wFrontX, km, W, H, dpr) - wheelRadius * 0.75 + sinkOffset + jig;

    const bogiePivotX = (wRearX + wMidX) * 0.5;
    const bogiePivotY = (wRearY + wMidY) * 0.5 - 7 * dpr;

    const chassisPivotX = roverScreenX;
    const chassisPivotY = (bogiePivotY + wFrontY) * 0.5 - 16 * dpr;
    const chassisPitch = Math.atan2(wFrontY - wRearY, wFrontX - wRearX) * 0.55 + state.rockTilt;

    const farOffsetX = -10 * dpr;
    const farOffsetY = -9 * dpr;

    // Ground shadow
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
    ctx2d.scale(state.facing, 1);

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
    if (state.shoulderStrain > 0 && Math.random() < 0.55) {
      for (let sp = 0; sp < 3; sp++) {
        ctx2d.strokeStyle = '#fef08a';
        ctx2d.lineWidth = 1.5 * dpr;
        ctx2d.beginPath();
        ctx2d.moveTo(0, 0);
        ctx2d.lineTo((Math.random() - 0.5) * 16 * dpr, (Math.random() - 0.5) * 16 * dpr);
        ctx2d.stroke();
      }
    }

    const armAngle1 = state.armDeployProgress * 0.95;
    const armAngle2 = state.armDeployProgress * -0.55;

    ctx2d.rotate(armAngle1);
    ctx2d.strokeStyle = '#cbd5e1';
    ctx2d.lineWidth = 3.2 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(22 * dpr, 6 * dpr);
    ctx2d.stroke();

    ctx2d.translate(22 * dpr, 6 * dpr);
    ctx2d.rotate(armAngle2);
    ctx2d.strokeStyle = '#94a3b8';
    ctx2d.lineWidth = 2.4 * dpr;
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(22 * dpr, 9 * dpr);
    ctx2d.stroke();

    // RAT Turret Head (Diamond drill)
    ctx2d.translate(22 * dpr, 9 * dpr);
    if (state.isDrilling) {
      ctx2d.rotate(timeSec * 35.0); // High-speed drill rotation
    }
    ctx2d.fillStyle = '#e2e8f0';
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 4.5 * dpr, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.fillStyle = '#38bdf8';
    ctx2d.fillRect(2 * dpr, -1.5 * dpr, 4 * dpr, 3 * dpr);
    if (state.isDrilling && state.armDeployProgress > 0.8) {
      ctx2d.strokeStyle = '#fde68a';
      ctx2d.lineWidth = 1.2 * dpr;
      for (let sp = 0; sp < 4; sp++) {
        ctx2d.beginPath();
        ctx2d.moveTo(7 * dpr, 0);
        ctx2d.lineTo((9 + Math.random() * 9) * dpr, (Math.random() - 0.5) * 14 * dpr);
        ctx2d.stroke();
      }
    }

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
    if (state.inPurgatory && state.rockKick > 0.08) {
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
    const gustZone = (phaseNow.id === 3 && km > L.gust - 0.6 && km < L.gust + 0.9) || state.windGustTimer > 0;
    ctx2d.fillStyle = `rgba(224, 168, 114, ${0.22 + dark * 0.4})`;
    particles.forEach((p) => {
      p.x += (p.vx + (gustZone ? 260 : 0)) * dt;
      p.y += p.vy * dt;
      if (p.x > W + 50) p.x = -50;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.radius * dpr, 0, Math.PI * 2);
      ctx2d.fill();
    });

    if (gustZone) {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(254, 215, 170, 0.4)';
      ctx2d.lineWidth = 2 * dpr;
      const swirlX = (timeSec * 220 * dpr) % (W * 1.2) - W * 0.1;
      for (let s = 0; s < 5; s++) {
        const sy = horizonY - 20 * dpr + s * 24 * dpr;
        ctx2d.beginPath();
        ctx2d.ellipse(swirlX + s * 30 * dpr, sy, 38 * dpr, 9 * dpr, Math.sin(timeSec * 6 + s) * 0.4, 0, Math.PI * 2);
        ctx2d.stroke();
      }
      ctx2d.restore();
    }

    // Dust-storm haze (Phase 3)
    if (phaseNow.id === 3 && dark > 0.05) {
      ctx2d.fillStyle = `rgba(140, 80, 40, ${dark * 0.26})`;
      ctx2d.fillRect(0, 0, W, H);
    }

    // Darkening veil (storm, dusk, and the final dark)
    if (dark > 0.02) {
      ctx2d.fillStyle = `rgba(0, 0, 0, ${dark * 0.42})`;
      ctx2d.fillRect(0, 0, W, H);
    }

    // Nightly-amnesia screen glitches (Phase 4)
    const gl = Math.max(state.glitchBurst, state.glitch * 0.35);
    if (gl > 0.03) {
      const n = 3 + Math.floor(gl * 8);
      for (let i = 0; i < n; i++) {
        const gy = Math.random() * H;
        const gh = (4 + Math.random() * 26) * dpr;
        const gx = (Math.random() - 0.5) * gl * 70 * dpr;
        try { ctx2d.drawImage(storyCanvas, 0, gy, W, gh, gx, gy, W, gh); } catch (e) {}
      }
      ctx2d.fillStyle = `rgba(56, 189, 248, ${0.05 * gl})`;
      ctx2d.fillRect(0, 0, W, H);
    }

    // Final static-filled frame (Phase 5)
    if (state.staticFlash > 0) {
      if (!noiseCanvas) {
        noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = 192;
        noiseCanvas.height = 108;
      }
      const nctx = noiseCanvas.getContext('2d');
      const img = nctx.createImageData(192, 108);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      ctx2d.save();
      ctx2d.imageSmoothingEnabled = false;
      ctx2d.globalAlpha = Math.min(0.92, state.staticFlash * 1.6);
      ctx2d.drawImage(noiseCanvas, 0, 0, W, H);
      ctx2d.restore();
    }

    ctx2d.restore();
  }

  // =========================================================================
  // 8. GAMEPLAY LOGIC & STORY SEQUENCING
  // =========================================================================
  function isAtMarathon() {
    return state.currentPhaseId === 4 && state.odometerKm >= L.marathon - 0.001 && !state.marathonBeamDone;
  }
  function isAtCrest() {
    return state.currentPhaseId === 5 && state.odometerKm >= L.crest - 0.001;
  }

  function startEnding() {
    if (state.ending) return;
    state.ending = true;
    state.endT = 0;
    state.keys.left = false;
    state.keys.right = false;
    state.velocityKmPerSec = 0;
    say('p5d', 7.5);
  }

  function updateEnding(dt) {
    state.endT += dt;
    const t = state.endT;
    const S = state.endStages;

    state.mastTiltProgress = clamp(t / 2.2, 0, 1);

    if (t >= 3.0 && !S.static) {
      S.static = true;
      state.staticFlash = 1.4;
      audioEngine.playStatic();
    }
    if (state.staticFlash > 0) state.staticFlash = Math.max(0, state.staticFlash - dt);

    // Fade to black only once the camera-tilt line has finished
    if (t >= 7.6 && !S.black && !subCurrent && subQueue.length === 0) {
      S.black = true;
      S.blackAt = t;
      const b = $('finalBlackoutScreen');
      if (b) b.style.opacity = '1';
    }
    if (S.black) {
      const r = t - S.blackAt;
      if (r >= 3.4 && !S.quote) {
        S.quote = true;
        const q = $('finalQuoteBox');
        if (q) q.style.opacity = '1';
        audioEngine.playFinaleChord();
        narrator.speak(STORY.quote, 'quote');
      }
      if (r >= 10.0 && !S.quoteOff) {
        S.quoteOff = true;
        const q = $('finalQuoteBox');
        if (q) q.style.opacity = '0';
      }
      if (r >= 12.5 && !S.memorial) {
        S.memorial = true;
        const m = $('finalMemorialText');
        if (m) m.style.opacity = '1';
        narrator.speak(STORY.memorial, 'memorial');
      }
      if (r >= 27.0 && !state.endDone) {
        state.endDone = true;
      }
    }
  }

  function updateGameplay(dt, timeSec) {
    state.clock += dt;
    const km = state.odometerKm;
    const phase = getCurrentPhase(km);
    state.currentPhaseId = phase.id;

    if (phase.id !== state.lastPhaseId) {
      state.lastPhaseId = phase.id;
      state.phaseHintTimer = 4.0;
    }
    if (state.phaseHintTimer > 0) state.phaseHintTimer -= dt;

    const driving = state.keys.right || state.keys.left;
    state.idleTime = driving ? 0 : state.idleTime + dt;

    // Smooth horizontal flip when the front steering motor jams
    state.facing += (state.facingTarget - state.facing) * Math.min(1, dt * 3.5);

    // Global visual decay timers
    state.rockKick = Math.max(0, state.rockKick - dt * 2.2);
    state.rockTilt = Math.sin(state.clock * 20) * 0.08 * state.rockKick;
    if (state.shoulderStrain > 0) state.shoulderStrain = Math.max(0, state.shoulderStrain - dt);
    state.tau = 0.5 + darknessAt(km) * 9.0;
    if (state.windGustTimer > 0) state.windGustTimer = Math.max(0, state.windGustTimer - dt);

    if (state.ending) updateEnding(dt);

    // ---------------------------------------------------------
    // PHASE 1: The 90-Day Promise & Ancient Water
    // ---------------------------------------------------------
    if (state.clock > 0.5) say('p1a');
    if (km >= 0.8) say('p1b');

    if (!state.phase1Drilled) {
      if (km >= L.drillStop - 0.12) say('p1c');
      state.armReady = km >= L.drillStop - 0.01;

      if (state.isDrilling && state.armReady) {
        state.drillProgress += dt;
        state.armDeployProgress = Math.min(1.0, state.armDeployProgress + dt * 2.5);
        state.blueberryGlow = Math.min(1.0, state.drillProgress / 2.0);
        if (state.drillProgress >= 2.4) {
          state.phase1Drilled = true;
          state.isDrilling = false;
          state.armReady = false;
          say('p1d');
          audioEngine.playSpectrometerClick();
        }
      } else {
        state.armDeployProgress = Math.max(0.0, state.armDeployProgress - dt * 1.2);
        state.blueberryGlow = Math.max(0.0, state.blueberryGlow - dt * 0.5);
      }
    } else {
      state.armDeployProgress = Math.max(0.0, state.armDeployProgress - dt * 1.4);
      state.blueberryGlow = Math.max(0.35, state.blueberryGlow - dt * 0.15);
    }

    // ---------------------------------------------------------
    // PHASE 2: Purgatory Dune & the Broken Shoulder
    // ---------------------------------------------------------
    if (km >= L.p1End + 0.05) say('p2a');

    if (!state.purgatoryDone && !state.inPurgatory && km >= L.trap) {
      state.inPurgatory = true;
      state.odometerKm = L.trap;
      state.velocityKmPerSec = 0.0;
      state.keys.left = false;
      state.keys.right = false;
      say('p2b');
    }
    if (state.inPurgatory) {
      if (state.rockCycles >= 3) say('p2c');
      state.odometerKm = L.trap + 0.01 * state.rockCycles;
      state.wheelSpinPhase += dt * (4 + 10 * state.rockKick);
    }
    const sinkTarget = state.inPurgatory ? 1.0 - 0.5 * (state.rockCycles / 10) : 0.0;
    state.sink += (sinkTarget - state.sink) * Math.min(1, dt * (state.inPurgatory ? 3.0 : 1.5));

    // ---------------------------------------------------------
    // PHASE 3: The Killer Dust Storm & The Wind Miracle
    // ---------------------------------------------------------
    if (km >= L.p2End + 0.05) say('p3a');

    let dustTarget;
    if (km >= L.p4End + 0.4) {
      dustTarget = 0.85 * clamp((km - L.p4End - 0.4) / 2.0, 0, 1);
    } else if (!state.windDevilCleaned) {
      dustTarget = clamp((km - L.dustStart) / 1.6, 0, 0.9);
    } else {
      dustTarget = 0.03;
    }
    const dustRate = dustTarget > state.dustFactor ? 2.0 : 0.45;
    state.dustFactor += (dustTarget - state.dustFactor) * Math.min(1, dt * dustRate);

    if (state.dustFactor >= 0.55) say('p3b');
    if (!state.windDevilCleaned && km >= L.gust && state.dustFactor > 0.3) {
      state.windDevilCleaned = true;
      state.windGustTimer = 5.0;
      audioEngine.playWindWhoosh();
      say('p3c');
    }

    // ---------------------------------------------------------
    // PHASE 4: Losing Spirit, Crippled Wheels & Nightly Amnesia
    // ---------------------------------------------------------
    if (km >= L.p3End + 0.1) say('p4a');
    if (km >= L.jam && km < L.p4End) {
      state.isJammedWheel = true;
      state.facingTarget = -1;
      say('p4b');
    }
    if (km >= L.amnesia) say('p4c');
    if (km >= L.marathon - 0.001) say('p4d');

    // Subtle glitching that grows as sunset approaches, until the memories are beamed home
    let glitchTarget = 0;
    if (phase.id === 4 && km >= L.amnesia && !state.marathonBeamDone) {
      glitchTarget = clamp((km - L.amnesia) / (L.marathon - L.amnesia), 0, 1);
      if (state.antennaBeamProgress > 0) glitchTarget *= Math.max(0, 1 - state.antennaBeamProgress / 3.0);
    }
    state.glitch += (glitchTarget - state.glitch) * Math.min(1, dt * 2.5);
    state.glitchBurst = Math.max(0, state.glitchBurst - dt * 2.5);
    if (state.glitch > 0.05 && Math.random() < dt * (1.2 + state.glitch * 5)) {
      state.glitchBurst = Math.min(0.55, 0.2 + state.glitch * 0.45 * Math.random() + 0.1);
    }

    if (state.antennaBeamProgress > 0) {
      state.antennaBeamProgress += dt * 0.8;
      if (state.antennaBeamProgress >= 3.0) {
        state.antennaBeamProgress = 0.0;
        state.marathonBeamDone = true;
      }
    }

    // ---------------------------------------------------------
    // PHASE 5: Perseverance Valley & The Final Message
    // ---------------------------------------------------------
    if (km >= L.p4End) {
      state.isJammedWheel = false;
      state.facingTarget = 1;
    }
    if (km >= L.p4End + 0.05) say('p5a');
    if (km >= 13.0) say('p5b');
    if (km >= 13.8) say('p5c');

    // ---------------------------------------------------------
    // DRIVING PHYSICS
    // ---------------------------------------------------------
    let maxSpeed = 0.13;
    if (phase.id === 3 || phase.id === 4) maxSpeed *= 1 - 0.6 * clamp(state.dustFactor / 0.9, 0, 1);
    if (phase.id === 5) maxSpeed = 0.1 * (1 - 0.4 * clamp((km - L.p4End) / (L.crest - L.p4End), 0, 1));
    if (subQueue.length > 0) maxSpeed *= 0.55; // let the story catch up

    const locked = state.inPurgatory || state.ending;
    let targetVel = 0.0;
    if (!locked) {
      if (state.keys.right) targetVel = maxSpeed;
      else if (state.keys.left) targetVel = -maxSpeed * 0.7;
    }

    if (state.inPurgatory) {
      state.velocityKmPerSec = 0.0;
    } else {
      state.velocityKmPerSec += (targetVel - state.velocityKmPerSec) * Math.min(1.0, dt * 4.0);
      state.odometerKm = clamp(state.odometerKm + state.velocityKmPerSec * dt, 0.0, L.crest);
      state.wheelSpinPhase += state.velocityKmPerSec * dt * 9.5;

      // Story stops: the rover halts where the player must act
      let stopAt = Infinity;
      if (!state.phase1Drilled) stopAt = Math.min(stopAt, L.drillStop);
      if (!state.marathonBeamDone) stopAt = Math.min(stopAt, L.marathon);
      stopAt = Math.min(stopAt, L.crest);
      if (state.odometerKm > stopAt) {
        state.odometerKm = stopAt;
        state.velocityKmPerSec = 0.0;
      }
    }
    audioEngine.setDriving(Math.abs(state.velocityKmPerSec) > 0.01);
  }

  // =========================================================================
  // 9. INPUT & INTERACTION CONTROLLER
  // =========================================================================
  function triggerPhaseRocking(key) {
    if (!state.inPurgatory || state.purgatoryDone) return;
    if (state.lastRockKey !== key) {
      state.lastRockKey = key;
      state.rockCycles++;
      state.rockKick = 1.0;
      state.wheelSpinPhase += 1.8;
      audioEngine.playSpectrometerClick();

      if (state.rockCycles >= 10) {
        state.purgatoryDone = true;
        state.inPurgatory = false;
        state.shoulderStrain = 4.0;
        audioEngine.playSparkSound();
        say('p2d');
      } else if (state.rockCycles >= 7) {
        state.shoulderStrain = Math.max(state.shoulderStrain, 0.35);
      }
    }
  }

  function triggerSpaceAction() {
    audioEngine.init();
    if (state.ending || state.endDone) return;
    if (state.currentPhaseId === 1 && state.armReady && !state.phase1Drilled) {
      state.isDrilling = true;
      return;
    }
    if (isAtCrest()) startEnding();
  }

  function triggerRadioBeam() {
    if (isAtMarathon() && state.antennaBeamProgress === 0) {
      audioEngine.init();
      state.antennaBeamProgress = 0.01;
      audioEngine.playRadioTransmissionChirp();
    }
  }

  function leaveExperience() {
    narrator.stop();
    if (typeof window.closeOverlays === 'function') window.closeOverlays();
  }

  function setupControls() {
    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener('keydown', (e) => {
      if (!window.__experienceActive) return;
      audioEngine.init();
      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        leaveExperience();
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        triggerSpaceAction();
        return;
      }
      if (key === 'd' || key === 'w' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        state.keys.right = true;
        state.keys.left = false;
        triggerPhaseRocking('d');
      } else if (key === 'a' || key === 's' || e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        state.keys.left = true;
        state.keys.right = false;
        triggerPhaseRocking('a');
      } else if (key === 'e') {
        triggerRadioBeam();
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
        state.isDrilling = false;
      }
    });

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
        if (state.endDone) { leaveExperience(); return; }
        if (state.ending) return;

        const rect = storyCanvas.getBoundingClientRect();
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const relX = clientX - rect.left;

        if (state.currentPhaseId === 1 && state.armReady && !state.phase1Drilled) { triggerSpaceAction(); return; }
        if (isAtMarathon()) { triggerRadioBeam(); return; }
        if (isAtCrest()) { triggerSpaceAction(); return; }

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
      storyCanvas.addEventListener('mousemove', (e) => { if (e.buttons === 1) handlePointer(e, true); });
      window.addEventListener('mouseup', (e) => handlePointer(e, false));
      storyCanvas.addEventListener('touchstart', (e) => handlePointer(e, true), { passive: true });
      window.addEventListener('touchend', (e) => handlePointer(e, false));
    }
  }

  // =========================================================================
  // 10. PUBLIC MODULE INTERFACE
  // =========================================================================
  function resetUI() {
    subQueue.length = 0;
    subCurrent = null;
    subGap = 0;
    shownPrompt = '';
    ['cinematicSubtitleBox', 'controlPromptBox', 'finalBlackoutScreen', 'finalQuoteBox', 'finalMemorialText'].forEach((id) => {
      const el = $(id);
      if (el) el.style.opacity = '0';
    });
  }

  window.startMissionExperience = function () {
    window.__experienceActive = true;
    storyCanvas = $('storyCanvas');
    if (!storyCanvas) return;
    ctx2d = storyCanvas.getContext('2d');

    narrator.init();
    state = makeState();
    resetUI();
    initParticles();
    resizeCanvas();
    setupControls();

    lastTime = performance.now();
    if (animId) cancelAnimationFrame(animId);

    function loop(now) {
      if (!window.__experienceActive) return;
      animId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const timeSec = now / 1000;

      updateGameplay(dt, timeSec);
      updateSubtitles(dt);
      applyPrompt(desiredPrompt());
      audioEngine.update(dt);
      try {
        render2DExperience(dt, timeSec);
      } catch (err) {
        console.error('render2DExperience error:', err);
      }
    }

    animId = requestAnimationFrame(loop);
    audioEngine.init();
  };

  window.pauseMissionExperience = function () {
    window.__experienceActive = false;
    narrator.stop();
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    state.keys.left = false;
    state.keys.right = false;
    state.isDrilling = false;
    audioEngine.setDriving(false);
    resetUI();
  };

  window.resizeMissionExperience = function () {
    if (storyCanvas) resizeCanvas();
  };

  window.addEventListener('resize', () => {
    if (window.__experienceActive) resizeCanvas();
  });

})();
