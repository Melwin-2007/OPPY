// =========================================================================
// OPPY'S LAST DANCE — 5-PHASE CINEMATIC MISSION EXPERIENCE (v12)
// Only two kinds of on-screen text: cinematic story subtitles + minimal control prompts.
// Target run time ≈ 2.5–3 minutes. Public API: startMissionExperience / pauseMissionExperience.
// =========================================================================
(function () {
  'use strict';

  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(typeof r === 'number' ? r : 0, Math.abs(w) / 2, Math.abs(h) / 2);
      this.beginPath(); this.moveTo(x + r, y); this.lineTo(x + w - r, y); this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r); this.quadraticCurveTo(x + w, y + h, x + w - r, y + h); this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r); this.lineTo(x, y + r); this.quadraticCurveTo(x, y, x + r, y); this.closePath(); return this;
    };
  }

  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgb = (a, al) => 'rgba(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ',' + (al == null ? 1 : al) + ')';

  const SPEED = 175, K = 1.15, BASE = 430, SINK_MAX = 17, WR = 17;

  // ---------- environments (sky / ground / mood) ----------
  const ENV = {
    day:    { t: [176, 112, 78], b: [242, 198, 152], g: [170, 100, 62], gd: [110, 62, 40], hz: 0.08, hc: [225, 165, 115], dk: 0, sy: 0.22, sa: 1, st: 0, gl: 0 },
    storm1: { t: [128, 66, 40], b: [190, 112, 66], g: [138, 78, 48], gd: [92, 52, 34], hz: 0.40, hc: [190, 110, 62], dk: 0.12, sy: 0.26, sa: 0.35, st: 0, gl: 0 },
    storm2: { t: [84, 42, 26], b: [124, 68, 40], g: [108, 60, 38], gd: [70, 40, 28], hz: 0.68, hc: [150, 84, 46], dk: 0.40, sy: 0.28, sa: 0.08, st: 0, gl: 0 },
    storm3: { t: [118, 60, 36], b: [170, 98, 58], g: [128, 72, 44], gd: [84, 48, 32], hz: 0.38, hc: [180, 104, 60], dk: 0.16, sy: 0.28, sa: 0.3, st: 0, gl: 0 },
    dusk:   { t: [52, 46, 84], b: [226, 124, 78], g: [102, 60, 52], gd: [60, 38, 40], hz: 0.10, hc: [240, 140, 90], dk: 0.08, sy: 0.50, sa: 1, st: 0.1, gl: 0 },
    dusk2:  { t: [32, 30, 66], b: [196, 98, 70], g: [86, 52, 50], gd: [50, 34, 38], hz: 0.10, hc: [220, 110, 80], dk: 0.16, sy: 0.60, sa: 0.9, st: 0.3, gl: 0.45 },
    dusk3:  { t: [20, 20, 50], b: [150, 66, 60], g: [74, 46, 48], gd: [42, 30, 36], hz: 0.10, hc: [190, 90, 70], dk: 0.24, sy: 0.67, sa: 0.8, st: 0.5, gl: 0.8 },
    p5a:    { t: [74, 32, 26], b: [150, 66, 44], g: [112, 60, 42], gd: [70, 40, 32], hz: 0.25, hc: [140, 64, 40], dk: 0.22, sy: 0.30, sa: 0.3, st: 0, gl: 0 },
    p5b:    { t: [30, 12, 12], b: [76, 30, 22], g: [84, 46, 36], gd: [48, 30, 26], hz: 0.35, hc: [80, 32, 22], dk: 0.50, sy: 0.30, sa: 0.06, st: 0.2, gl: 0 },
    p5c:    { t: [10, 6, 7], b: [34, 16, 12], g: [66, 38, 30], gd: [36, 24, 22], hz: 0.30, hc: [40, 18, 14], dk: 0.54, sy: 0.30, sa: 0, st: 0.5, gl: 0 },
    p5d:    { t: [3, 3, 5], b: [14, 8, 8], g: [58, 34, 28], gd: [30, 20, 20], hz: 0.25, hc: [20, 10, 10], dk: 0.60, sy: 0.30, sa: 0, st: 0.9, gl: 0 }
  };
  const ENV_KEYS = ['t', 'b', 'g', 'gd', 'hc'], ENV_NUM = ['hz', 'dk', 'sy', 'sa', 'st', 'gl'];
  const cloneEnv = (e) => JSON.parse(JSON.stringify(e));

  // ---------- story + step script ----------
  const HD = '[Hold D to Drive]', HB = '[Hold D to Drive Backward]', HC = '[Hold D to Climb Perseverance Valley]';
  const DEF = [
    [ // PHASE 1 — Eagle Crater, 2004
      { id: 'p1a', env: 'day', hint: HD, say: 'January 25, 2004. Wrapped in giant airbags, Opportunity bounces 26 times across Mars and rolls straight into Eagle Crater.' },
      { id: 'p1b', hint: HD, say: 'NASA built her to survive for only 90 days and drive less than a kilometer before Martian dust choked her solar panels.' },
      { id: 'drill', stay: 1, min: 5, need: { k: 'hold', secs: 2.4 }, prompt: '[Hold SPACE to Drill & Scan Rock]', say: 'Reaching out her robotic arm, she spins her diamond-tipped drill into the ancient bedrock...' },
      { id: 'p1d', hint: HD, dm: 0.6, say: "Inside the rock, her sensors find tiny iron pebbles called 'Martian Blueberries'—proving that liquid water once flowed across Mars." }
    ],
    [ // PHASE 2 — Purgatory Dune, 2005
      { id: 'p2a', hint: HD, say: '2005. Opportunity has already outlived her 90-day warranty, pushing deeper into the unknown desert.' },
      { id: 'sink', hint: HD, dm: 0.5, min: 6.5, say: 'Suddenly, all six wheels break through a thin crust and sink axle-deep into soft, powdery sand—a trap called Purgatory Dune.' },
      { id: 'rock', stay: 1, min: 6, need: { k: 'rock', n: 16 }, prompt: '[Tap A and D Repeatedly to Rock Free]', say: 'Her wheels spin helplessly. For five weeks, engineers on Earth command her to rock millimeter by millimeter—spinning her wheels 192 meters just to move 1 meter...' },
      { id: 'p2d', hint: HD, say: 'Her cleats finally bite into solid rock and she breaks free—even as a heater switch breaks in her robotic shoulder, forcing her to sleep in the freezing -105°C cold every night to save battery.' }
    ],
    [ // PHASE 3 — Dust storm, 2007
      { id: 'st1', env: 'storm1', hint: HD, sp: 0.9, say: '2007. A monstrous planet-wide dust storm swallows Mars, blocking 99% of the Sun.' },
      { id: 'st2', env: 'storm2', hint: HD, sp: 0.55, say: 'Thick red dust suffocates her solar wings. Her power drops to the edge of freezing death, and she is forced into silent hibernation in the dark.' },
      { id: 'gust', env: 'storm3', sp: 0.6, dm: 1.6, need: { k: 'dust' }, prompt: '[Hold D to Drive Through the Wind Gusts]', say: 'Just when all hope seems lost, Mars itself saves her—swirling whirlwinds sweep across her deck, blasting the dust off her solar panels and bringing her back to life.' }
    ],
    [ // PHASE 4 — Spirit lost, crippled wheel, amnesia, 2010–2015
      { id: 'sp1', env: 'dusk', hint: HD, say: '2010. Halfway across the planet, her twin rover Spirit gets trapped in soft soil and freezes to death in the winter dark. Opportunity is now completely alone on Mars.' },
      { id: 'jam', hint: HB, say: 'Years of hard driving take their toll. Her front steering motor jams, forcing her to drive backward across the plains to keep her arthritic wheel gears from seizing.' },
      { id: 'amn', env: 'dusk2', hint: HB, say: 'After a decade of cosmic radiation, her flash memory begins to fail—giving her nightly amnesia that wipes everything she learns the moment she goes to sleep.' },
      { id: 'beam', env: 'dusk3', hint: HB, min: 8.5, need: { k: 'press', key: 'e' }, prompt: '[Press E to Beam Memories Home Before Sunset]', say: 'Every evening before sunset, she tilts her antenna to the sky and beams every photograph and memory home before her mind resets—becoming the first machine to complete a 42-kilometer marathon on another world.' }
    ],
    [ // PHASE 5 — Perseverance Valley, 2018
      { id: 'cl1', env: 'p5a', hint: HC, say: 'June 2018. Fourteen years on Mars—nearly 60 times longer than she was ever meant to live. Opportunity climbs into Perseverance Valley.' },
      { id: 'cl2', env: 'p5b', hint: HC, sp: 0.7, say: 'Above her, the darkest dust storm in Martian history blots out the sky, turning midday darker than midnight.' },
      { id: 'cl3', env: 'p5c', hint: HC, sp: 0.45, say: 'Freezing in the dark, her solar wings can no longer generate enough energy to keep her warm or keep her internal clock ticking.' },
      { id: 'look', env: 'p5d', stay: 1, min: 7, need: { k: 'press', key: 'space' }, prompt: '[Press SPACE to Look for the Sun]', say: 'On June 10, 2018, she uses her last breath of battery to point her camera up toward where the Sun should be, sending back one final, static-filled frame of the dark...' }
    ]
  ];

  // compile: assign absolute world distances so scenery can be anchored to the story
  const STEPS = [];
  (function compile() {
    let x = 0;
    DEF.forEach((p, pi) => p.forEach((s) => {
      const st = Object.assign({ ph: pi + 1 }, s);
      st.min = s.min || Math.max(4.5, 2.5 + s.say.length / 20);
      st.x0 = x;
      const d = s.stay ? 0 : (s.d != null ? s.d : st.min * SPEED * 0.8 * (s.sp || 1) * (s.dm || 1));
      st.to = x + d; x = st.to; STEPS.push(st);
    }));
  })();
  const stepById = (id) => STEPS.find((s) => s.id === id);
  const ROCK_X = stepById('drill').to + 140 * K;
  const SINK_X = stepById('sink').to;
  const DUNE_A = stepById('p2a').x0 + 80, DUNE_B = stepById('rock').to + 420;
  const CLIMB_A = stepById('cl1').x0, CLIMB_B = stepById('cl3').to, CLIMB_H = 300;
  const GATE_X = stepById('beam').to + 130;

  // ---------- terrain ----------
  function gy(x) {
    let h = 4 * Math.sin(x * 0.013) + 2.2 * Math.sin(x * 0.031 + 1.7) + 1.1 * Math.sin(x * 0.07);
    h += 7 * Math.sin(x * 0.052) * sm(DUNE_A, DUNE_A + 160, x) * (1 - sm(DUNE_B - 160, DUNE_B, x));
    const c = sm(CLIMB_A, CLIMB_B, x);
    h -= CLIMB_H * c; h += 3 * Math.sin(x * 0.09) * c;
    const f = 1 - clamp(Math.abs(x - ROCK_X) / 90, 0, 1); h = lerp(h, 0, f * 0.9); // flat bedrock slab
    return BASE + h;
  }

  // ---------- audio (light BGM + atmospheric wind + motor SFX + sound FX) ----------
  const audio = {
    ctx: null, muted: false, ok: false, duckLevel: 1.0, _lastClick: 0,
    init() {
      if (this.ok) {
        this.resume();
        return;
      }
      try {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return;
        const x = this.ctx = new A();

        // Immediate resume check
        if (x.state === 'suspended') {
          x.resume().catch(() => {});
        }

        const n = x.sampleRate * 2, buf = x.createBuffer(1, n, x.sampleRate), o = buf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + w * 0.06;
          b1 = 0.96 * b1 + w * 0.2;
          b2 = 0.7 * b2 + w * 0.5;
          o[i] = (b0 + b1 + b2) * 0.12;
        }

        // Master gain
        this.master = x.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(x.destination);

        // Ducking gain: ducks background sounds smoothly when narrator speaks
        this.duckGain = x.createGain();
        this.duckGain.gain.value = 1.0;
        this.duckGain.connect(this.master);

        // Martian atmospheric wind
        const src = x.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        this.wf = x.createBiquadFilter();
        this.wf.type = 'bandpass';
        this.wf.frequency.value = 240;
        this.wf.Q.value = 1.4;
        this.wg = x.createGain();
        this.wg.gain.value = 0.065;
        src.connect(this.wf);
        this.wf.connect(this.wg);
        this.wg.connect(this.duckGain);
        src.start();

        // Driving DC servo motor
        this.so = x.createOscillator();
        this.so.type = 'sawtooth';
        this.so.frequency.value = 60;
        const sf = x.createBiquadFilter();
        sf.type = 'lowpass';
        sf.frequency.value = 240;
        this.sg = x.createGain();
        this.sg.gain.value = 0;
        this.so.connect(sf);
        sf.connect(this.sg);
        this.sg.connect(this.duckGain);
        this.so.start();

        // Light BGM Pad: gentle, warm celestial synth pad (peaceful storytelling ambience)
        this.bgmGain = x.createGain();
        this.bgmGain.gain.value = 0.075;

        const padFilter = x.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 420;
        padFilter.Q.value = 1.2;

        const padLfo = x.createOscillator();
        padLfo.frequency.value = 0.07;
        const padLfoGain = x.createGain();
        padLfoGain.gain.value = 70;
        padLfo.connect(padLfoGain);
        padLfoGain.connect(padFilter.frequency);
        padLfo.start();

        const chordFreqs = [146.83, 220.00, 185.00, 293.66];
        chordFreqs.forEach((freq) => {
          const osc = x.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const noteGain = x.createGain();
          noteGain.gain.value = 0.28;
          osc.connect(noteGain);
          noteGain.connect(padFilter);
          osc.start();
        });

        padFilter.connect(this.bgmGain);
        this.bgmGain.connect(this.duckGain);

        this.ok = true;
      } catch (e) {
        console.warn('WebAudio init error:', e);
      }
    },
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },
    duck(level) {
      if (!this.ok || !this.ctx || !this.duckGain) return;
      this.duckLevel = level || 0.25;
      const t = this.ctx.currentTime;
      this.duckGain.gain.cancelScheduledValues(t);
      this.duckGain.gain.setTargetAtTime(this.duckLevel, t, 0.15);
    },
    unduck() {
      if (!this.ok || !this.ctx || !this.duckGain) return;
      this.duckLevel = 1.0;
      const t = this.ctx.currentTime;
      this.duckGain.gain.cancelScheduledValues(t);
      this.duckGain.gain.setTargetAtTime(1.0, t, 0.5);
    },
    setMuted(m) { 
      this.muted = !!m; 
      if (this.ok && this.ctx) this.master.gain.setValueAtTime(m ? 0 : 1, this.ctx.currentTime); 
    },
    playClick() {
      if (!this.ok || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 600, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {}
    },
    playSpark() {
      if (!this.ok || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {}
    },
    playFarewellChord() {
      if (!this.ok || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [185.00, 220.00, 277.18, 440.00, 554.37].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = idx < 2 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);
          g.gain.setValueAtTime(0.001, now + idx * 0.18);
          g.gain.linearRampToValueAtTime(0.06, now + idx * 0.18 + 1.2);
          g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 8.0);
          osc.connect(g);
          g.connect(this.master);
          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 8.5);
        });
      } catch (e) {}
    },
    update() {
      if (!this.ok || !S) return;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime, st = S.E.hz;
      this.wg.gain.setTargetAtTime(0.065 + st * 0.18 + (S.gustOn ? 0.12 : 0), t, 0.2);
      this.wf.frequency.setTargetAtTime(220 + st * 360 + (S.gustOn ? 320 : 0), t, 0.2);
      const sp = Math.abs(S.v) + (S.trapped ? 70 : 0) + (S.drillOn ? 90 : 0);
      this.sg.gain.setTargetAtTime(sp > 4 ? Math.min(0.075, 0.02 + sp * 0.0003) : 0, t, 0.08);
      this.so.frequency.setTargetAtTime(55 + Math.min(160, sp * 0.5) + (S.drillOn ? 120 : 0), t, 0.08);

      if (S.drillOn && performance.now() - this._lastClick > 90) {
        this._lastClick = performance.now();
        this.playClick();
      }
    }
  };

  // ---------- female elegant narrator engine (cinematic storytelling) ----------
  const narrator = {
    enabled: true,
    speaking: false,
    currentId: null,
    currentUtterance: null,
    voice: null,
    heartbeat: null,
    pendingTimer: null,

    init() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      this.pickVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      if (!this.heartbeat) {
        this.heartbeat = setInterval(() => {
          if (this.speaking && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 1200);
      }
    },

    pickVoice() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const list = window.speechSynthesis.getVoices();
      if (!list || list.length === 0) return;

      // 1. British / UK English Female (Highest elegance & storytelling cadence)
      let v = list.find((x) => 
        /en[-_]GB/i.test(x.lang) && 
        /female|sonia|libby|hazel|maisie|susan|victoria|amy|serena|kate/i.test(x.name)
      );
      if (!v) {
        v = list.find((x) => /en[-_]GB/i.test(x.lang) && !/male|david|george|oliver|brian/i.test(x.name));
      }

      // 2. Commonwealth / Foreign Accented English Female (Irish, Australian, South African, Indian)
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

      // 5. Fallback English or system default
      if (!v) {
        v = list.find((x) => x.lang.startsWith('en')) || list[0];
      }

      this.voice = v;
    },

    cleanText(t) {
      if (!t) return '';
      return t
        .replace(/\[.*?\]/g, '') // remove prompts
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
      if (this.pendingTimer) {
        clearTimeout(this.pendingTimer);
        this.pendingTimer = null;
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      this.speaking = false;
      this.currentId = null;
      this.currentUtterance = null;
      window.__activeNarratorUtterance = null;
      if (typeof audio !== 'undefined' && audio.unduck) audio.unduck();
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

      // Asynchronous scheduling avoids Chrome cancel/speak collision
      this.pendingTimer = setTimeout(() => {
        if (!this.enabled || this.currentId !== (id || text)) return;
        this.pickVoice();

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const u = new SpeechSynthesisUtterance(text);
        if (this.voice) {
          u.voice = this.voice;
          u.lang = this.voice.lang || 'en-GB';
        } else {
          u.lang = navigator.language || 'en-US';
        }

        u.rate = 0.92;
        u.pitch = 1.02;
        u.volume = 1.0;

        u.onstart = () => {
          this.speaking = true;
          if (typeof audio !== 'undefined' && audio.duck) audio.duck(0.25);
        };

        u.onend = () => {
          this.speaking = false;
          this.currentUtterance = null;
          window.__activeNarratorUtterance = null;
          if (typeof audio !== 'undefined' && audio.unduck) audio.unduck();
        };

        u.onerror = () => {
          this.speaking = false;
          this.currentUtterance = null;
          window.__activeNarratorUtterance = null;
          if (typeof audio !== 'undefined' && audio.unduck) audio.unduck();
        };

        this.currentUtterance = u;
        window.__activeNarratorUtterance = u;

        try {
          window.speechSynthesis.speak(u);
        } catch (e) {
          console.warn('SpeechSynthesis speak error:', e);
        }
      }, 45);
    }
  };

  // ---------- state ----------
  let S = null, cvs = null, c = null, W = 0, H = 0, dpr = 1, sc = 1, raf = 0, lastT = 0, controlsReady = false;
  const keys = { d: 0, a: 0, space: 0, e: 0 };
  let noiseCv = null;

  function fresh() {
    return {
      x: 0, v: 0, ry: BASE - 44 * K, theta: 0, facing: 1, fAnim: 1, spin: 0,
      stepI: -1, stepT: 0, idle: 0, time: 0,
      sink: 0, sinkOn: 0, trapped: 0, freed: 0, rockN: 0, rockSide: '', rockAng: 0, rockKick: 0,
      dust: 0.06, gustOn: 0, gustT: 0, hold: 0, arm: 0, drillOn: 0, drilled: 0, blue: 0, spark: 0, jam: 0,
      tilt: 0, dish: 0, beam: 0, beamed: 0, pressE: 0, pressSpace: 0, glT: 0, glFlash: 0,
      fin: -1, statics: 0, blackA: 0, finished: 0, intro: 0,
      camX: -60, camY: BASE - 44 * K, speedMul: 1, parts: [], tip: { x: 0, y: 0 },
      E: cloneEnv(ENV.day), target: ENV.day
    };
  }

  // ---------- subtitles & prompts ----------
  let subTok = 0, prTok = 0, curPrompt = '';
  function say(t, id) {
    const box = $('cinematicSubtitleBox'), el = $('cinematicSubtitleText'); if (!box || !el) return;
    const tok = ++subTok;
    if (!t) { box.style.opacity = '0'; narrator.stop(); return; }
    narrator.speak(t, id || t);
    if (box.style.opacity === '1') { box.style.opacity = '0'; setTimeout(() => { if (tok === subTok) { el.textContent = t; box.style.opacity = '1'; } }, 650); }
    else { el.textContent = t; requestAnimationFrame(() => { if (tok === subTok) box.style.opacity = '1'; }); }
  }
  function prompt(t) {
    if (t === curPrompt) return; curPrompt = t;
    const box = $('controlPromptBox'), el = $('controlPromptText'); if (!box || !el) return;
    const tok = ++prTok;
    if (!t) { box.style.opacity = '0'; return; }
    if (box.style.opacity === '1') { box.style.opacity = '0'; setTimeout(() => { if (tok === prTok) { el.textContent = t; box.style.opacity = '1'; } }, 220); }
    else { el.textContent = t; box.style.opacity = '1'; }
  }

  // ---------- particles ----------
  function spawn(o) { if (S.parts.length < 420) S.parts.push(Object.assign({ l: 0, m: 1, s: 2, g: 0, c: '230,180,130', vx: 0, vy: 0, t: 0 }, o)); }

  // ---------- step machine ----------
  function enterStep(i) {
    S.stepI = i; S.stepT = 0;
    const st = STEPS[i]; if (!st) return;
    if (st.env) S.target = ENV[st.env];
    S.speedMul = st.sp || 1; S.pressE = 0; S.pressSpace = 0;
    say(st.say, st.id);
    if (st.id === 'jam') { S.jam = 1; S.facing = -1; }
    if (st.id === 'p2d') { S.spark = 1; audio.playSpark(); }
    if (st.id === 'cl1') { S.spark = 1; audio.playSpark(); }
  }

  function stepUpdate(dt) {
    const st = STEPS[S.stepI]; if (!st || S.fin >= 0) return;
    S.stepT += dt;
    const arrived = S.x >= st.to - 2;
    if (!arrived) { S.pressE = 0; S.pressSpace = 0; }
    let needOk = true;
    if (st.need) {
      const k = st.need.k; needOk = false;
      if (k === 'hold') {
        if (arrived) S.arm = Math.min(1, S.arm + dt * 1.1);
        if (arrived && S.arm > 0.95 && keys.space) { S.hold += dt; S.drillOn = 1; } else { S.hold = Math.max(0, S.hold - dt * 0.6); S.drillOn = 0; }
        if (S.hold >= st.need.secs) { needOk = true; S.drillOn = 0; S.drilled = 1; }
      } else if (k === 'rock') { needOk = S.freed; }
      else if (k === 'dust') { needOk = S.dust <= 0.04; }
      else if (k === 'press') {
        const f = st.need.key === 'e' ? 'pressE' : 'pressSpace';
        if (arrived && S[f]) { startPress(st); }
        needOk = st.need.key === 'e' ? S.beamed : false;
      }
    }
    // step-specific logic
    if (st.id === 'sink' && arrived && !S.sinkOn) { S.sinkOn = 1; S.trapped = 1; }
    if (st.id === 'sink') needOk = S.sinkOn && S.sink > SINK_MAX * 0.9;
    if (st.id === 'st1') S.dust = Math.min(0.2, S.dust + dt * 0.03);
    if (st.id === 'st2') S.dust = Math.min(0.92, S.dust + dt * 0.14);
    if (st.id === 'gust') {
      S.gustT += dt; S.gustOn = (S.gustT % 4) < 2.6 ? 1 : 0;
      if (S.gustOn && (S.v > 25 || arrived)) S.dust = Math.max(0, S.dust - dt * 0.3);
    } else S.gustOn = 0;
    if (S.drilled && S.blue < 1) S.blue = Math.min(1, S.blue + dt * 0.5);

    if (st.id === 'look') { if (arrived && S.pressSpace && S.fin < 0) { S.fin = 0; S.pressSpace = 0; } return; }
    if (S.stepT >= st.min && arrived && needOk && (!narrator.speaking || S.stepT >= st.min + 4.5)) {
      if (S.stepI < STEPS.length - 1) enterStep(S.stepI + 1);
    }
  }
  function startPress(st) { if (st.id === 'beam' && !S.beam) { S.beam = 0.001; S.pressE = 0; } }

  // ---------- main update ----------
  function update(dt) {
    S.time += dt;
    const st = STEPS[S.stepI];
    // environment blend
    const k = 1 - Math.exp(-dt * 0.9), E = S.E, T = S.target;
    ENV_KEYS.forEach((n) => { E[n] = mix(E[n], T[n], k); });
    ENV_NUM.forEach((n) => { E[n] = lerp(E[n], T[n], k); });

    // movement
    const frozen = S.fin >= 0;
    let vt = 0;
    if (!frozen) {
      if (keys.d && !S.trapped) vt = SPEED * S.speedMul * (1 - 0.65 * S.dust);
      else if (keys.a && !S.trapped) vt = -SPEED * 0.45;
      if (st && st.need && st.need.k === 'press' && S.beam > 0 && !S.beamed) vt = 0;
    }
    if (st && st.id === 'cl3') { const p = clamp((S.x - st.x0) / Math.max(1, st.to - st.x0), 0, 1); vt *= lerp(1, 0.4, p); }
    S.v = lerp(S.v, vt, 1 - Math.exp(-dt * 6));
    S.x += S.v * dt;
    if (st) S.x = clamp(S.x, st.x0 - 0, st.to);
    if (S.x >= st.to - 0.5) S.v = Math.min(S.v, 0);
    if (Math.abs(S.v) > 12) S.idle = 0; else S.idle += dt;
    if (S.trapped) S.idle = 0;
    S.spin += (S.v * dt) / (WR * K) + (S.trapped ? 11 * dt : 0);

    // sink / rocking
    if (S.sinkOn) {
      const targetSink = S.trapped ? SINK_MAX * (1 - 0.4 * S.rockN / 16) : 0;
      S.sink = lerp(S.sink, targetSink, 1 - Math.exp(-dt * (S.trapped ? 1.8 : 2.4)));
      if (S.trapped && S.sink > 3 && Math.random() < dt * 22) spawn({ x: S.x + (Math.random() - 0.5) * 120, y: gy(S.x) - 4, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 60, g: 160, m: 0.9, s: 2 + Math.random() * 2 });
    }
    S.rockKick = Math.max(0, S.rockKick - dt * 3);
    S.rockAng = (S.rockSide === 'a' ? -1 : 1) * 0.07 * S.rockKick;
    if (S.fAnim !== S.facing) S.fAnim = lerp(S.fAnim, S.facing, 1 - Math.exp(-dt * 9));

    // arm / mast / dish
    if (!(st && st.id === 'drill')) S.arm = Math.max(0, S.arm - dt * 0.9);
    if (S.fin >= 0) S.tilt = Math.min(1, S.tilt + dt * 0.85);
    if (S.beam > 0) {
      S.beam += dt;
      S.dish = sm(0, 1, S.beam) * (1 - sm(4.2, 5.4, S.beam));
      if (S.beam > 0.8 && Math.random() < dt * 14) spawn({ t: 1, x: S.x - 30 * S.facing * K, y: S.ry - 78 * K, vx: (Math.random() - 0.5) * 40, vy: -260 - Math.random() * 120, m: 2.6, s: 3, c: '255,226,170' });
      if (S.beam > 3.6) { S.beamed = 1; }
    }
    S.glFlash = Math.max(0, S.glFlash - dt * 6);
    if (S.beam > 2.2 && !S._gl0) { S._gl0 = 1; S.target = Object.assign({}, S.target, { gl: 0 }); }
    if (S.E.gl > 0.05) { S.glT -= dt; if (S.glT <= 0) { S.glFlash = 1; S.glT = (0.5 + Math.random() * 1.6) / S.E.gl; } }

    // wind gusts / storm particles
    const storm = STEPS[S.stepI].ph === 3;
    if (storm || S.gustOn) {
      const n = S.gustOn ? 90 : 20;
      if (Math.random() < dt * n) spawn({ t: 2, x: S.camX - 520 + Math.random() * 120, y: S.camY - 250 + Math.random() * 520, vx: 520 + Math.random() * 320, vy: -20 + Math.random() * 40, m: 1.6, s: 1 + Math.random() * 1.5, c: '215,128,76' });
      if (S.gustOn && S.dust > 0.04 && Math.random() < dt * 60) spawn({ t: 2, x: S.x - 50 + Math.random() * 90, y: S.ry - 30 * K - Math.random() * 12, vx: 260 + Math.random() * 280, vy: -80 - Math.random() * 90, m: 1.1, s: 1.5 + Math.random() * 2, c: '200,110,62' });
    }
    // wheel dust
    if (Math.abs(S.v) > 30 && Math.random() < dt * 18) spawn({ x: S.x - 70, y: gy(S.x - 70) - 3, vx: -S.v * 0.25, vy: -25 - Math.random() * 25, g: 40, m: 0.8, s: 1.5 + Math.random() * 1.8 });
    // drill sparks
    if (S.drillOn && Math.random() < dt * 70) spawn({ x: S.tip.x, y: S.tip.y, vx: (Math.random() - 0.3) * 160, vy: -90 - Math.random() * 120, g: 420, m: 0.45, s: 1.4, c: '255,214,120' });
    for (let i = S.parts.length - 1; i >= 0; i--) {
      const p = S.parts[i]; p.l += dt; if (p.l > p.m) { S.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
    }

    // finale timeline
    if (S.fin >= 0) finaleUpdate(dt);
    stepUpdate(dt);
    prompt(promptWanted());

    // camera
    S.camX = lerp(S.camX, S.x + 150, 1 - Math.exp(-dt * 4));
    S.camY = lerp(S.camY, S.ry, 1 - Math.exp(-dt * 2.2));
    const g = $('amnesiaGlitchOverlay'); if (g) g.style.opacity = S.glFlash > 0.1 ? String(0.18 * S.glFlash) : '0';
    audio.update();
  }

  function promptWanted() {
    const st = STEPS[S.stepI]; if (!st || S.fin >= 0 || S.finished) return '';
    const arrived = S.x >= st.to - 3;
    if (st.need) {
      if (st.need.k === 'dust') return S.dust > 0.04 ? st.prompt : '';
      if (st.need.k === 'rock') return S.trapped && S.sink > 5 ? st.prompt : '';
      if (st.need.k === 'press') return (arrived && (st.id !== 'beam' || !S.beam) && S.stepT > 1.5) ? st.prompt : '';
      if (st.need.k === 'hold') return (arrived && S.arm > 0.6 && !S.drilled) ? st.prompt : '';
    }
    if (st.hint && !arrived && S.idle > 1.5 && !S.trapped) return st.hint;
    return '';
  }

  // ---------- finale ----------
  function finaleUpdate(dt) {
    S.fin += dt; const f = S.fin;
    S.statics = (f > 1.6 && f < 3.4) ? 1 : 0;
    if (f > 3.4) S.blackA = Math.min(1, S.blackA + dt * 0.9);
    if (f > 4.6 && !S._b1) {
      S._b1 = 1; say(''); prompt('');
      const b = $('finalBlackoutScreen'), q = $('finalQuoteBox');
      if (b) { b.style.opacity = '1'; }
      if (q) { q.style.opacity = '1'; q.style.transform = 'scale(1)'; }
      audio.playFarewellChord();
      narrator.speak("My battery is low and it's getting dark.", 'quote');
    }
    if (f > 10.5 && !S._b2) { S._b2 = 1; const q = $('finalQuoteBox'); if (q) q.style.opacity = '0'; }
    if (f > 12 && !S._b3) {
      S._b3 = 1; const m = $('finalMemorialText'); if (m) m.style.opacity = '1';
      narrator.speak("For eight months, Earth called out into the silence more than a thousand times. On February 13, 2019, NASA beamed one last song across the stars, I'll Be Seeing You, and let her rest. 90 Days Planned. 14 Years Survived.", 'memorial');
    }
    if (f > 23 && !S._b4) { S._b4 = 1; S.finished = 1; const a = $('finalActionBtn'); if (a) { a.style.opacity = '1'; a.style.pointerEvents = 'auto'; } }
  }

  function restart() {
    narrator.stop();
    ['finalBlackoutScreen', 'finalQuoteBox', 'finalMemorialText', 'finalActionBtn'].forEach((id) => { const e = $(id); if (e) { e.style.opacity = '0'; if (id === 'finalActionBtn') e.style.pointerEvents = 'none'; } });
    const q = $('finalQuoteBox'); if (q) q.style.transform = 'scale(.95)';
    const b = $('finalBlackoutScreen'); if (b) b.style.pointerEvents = 'none';
    S = fresh(); curPrompt = '';
    const pb = $('controlPromptBox'), sb = $('cinematicSubtitleBox'); if (pb) pb.style.opacity = '0'; if (sb) sb.style.opacity = '0';
    enterStep(0);
  }

  // =========================================================================
  // RENDERING
  // =========================================================================
  function ridge(par, baseY, amp, col, seed) {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    const shift = (BASE - 44 * K - S.camY) * sc * par;
    for (let sx = 0; sx <= W + 16; sx += 16) {
      const wx = sx / sc + S.camX * par;
      const y = baseY + shift - amp * (0.5 + 0.5 * Math.sin(wx * 0.004 + seed) + 0.25 * Math.sin(wx * 0.011 + seed * 2.3) + 0.12 * Math.sin(wx * 0.027 + seed * 0.7));
      c.lineTo(sx, y);
    }
    c.lineTo(W, H); c.closePath(); c.fill();
  }

  function drawSky() {
    const E = S.E;
    const g = c.createLinearGradient(0, 0, 0, H * 0.66); g.addColorStop(0, rgb(E.t)); g.addColorStop(1, rgb(E.b));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (E.st > 0.02) { for (let i = 0; i < 90; i++) { const x = rnd(i) * W, y = rnd(i + 99) * H * 0.55; c.fillStyle = 'rgba(255,240,230,' + (E.st * (0.35 + 0.65 * rnd(i + 7)) * (0.7 + 0.3 * Math.sin(S.time * 2 + i))) + ')'; c.fillRect(x, y, 1.5, 1.5); } }
    if (E.sa > 0.02) {
      const sx = W * 0.72, sy = H * E.sy + (BASE - 44 * K - S.camY) * sc * 0.05, r = 26 * sc;
      const gl = c.createRadialGradient(sx, sy, 0, sx, sy, r * 7); gl.addColorStop(0, rgb(mix(E.b, [255, 240, 210], 0.6), 0.55 * E.sa)); gl.addColorStop(1, rgb(E.b, 0));
      c.fillStyle = gl; c.fillRect(sx - r * 7, sy - r * 7, r * 14, r * 14);
      c.fillStyle = rgb([255, 236, 200], E.sa); c.beginPath(); c.arc(sx, sy, r, 0, 6.283); c.fill();
    }
    const far = mix(E.g, E.b, 0.62), mid = mix(E.g, E.b, 0.35);
    ridge(0.05, H * 0.58, 70 * sc, rgb(far), 1.3);
    ridge(0.12, H * 0.62, 50 * sc, rgb(mid), 4.1);
    ridge(0.24, H * 0.66, 30 * sc, rgb(mix(E.g, E.gd, 0.4)), 7.7);
  }

  function groundPath(x0, x1) {
    c.beginPath(); c.moveTo(x0, gy(x0));
    for (let x = x0; x <= x1; x += 10) c.lineTo(x, gy(x));
    c.lineTo(x1, S.camY + 700); c.lineTo(x0, S.camY + 700); c.closePath();
  }
  function drawGround(x0, x1, clipOnly) {
    const E = S.E, g = c.createLinearGradient(0, S.camY + 40, 0, S.camY + 330);
    g.addColorStop(0, rgb(E.g)); g.addColorStop(1, rgb(E.gd));
    c.fillStyle = g; groundPath(x0, x1); c.fill();
    if (clipOnly) return;
    c.strokeStyle = rgb(mix(E.g, [255, 220, 170], 0.25), 0.8); c.lineWidth = 1.6; c.beginPath();
    for (let x = x0; x <= x1; x += 10) { if (x === x0) c.moveTo(x, gy(x)); else c.lineTo(x, gy(x)); } c.stroke();
    // dune ripple lines
    if (x1 > DUNE_A && x0 < DUNE_B) {
      c.strokeStyle = rgb(E.gd, 0.35); c.lineWidth = 1.2;
      for (let k = 1; k <= 3; k++) { c.beginPath(); let f = 1; for (let x = Math.max(x0, DUNE_A); x <= Math.min(x1, DUNE_B); x += 12) { const y = gy(x) + k * 9; if (f) { c.moveTo(x, y); f = 0; } else c.lineTo(x, y); } c.stroke(); }
    }
    // pebbles & rocks
    const i0 = Math.floor(x0 / 70), i1 = Math.ceil(x1 / 70);
    for (let i = i0; i <= i1; i++) {
      if (rnd(i * 3.3) < 0.55) continue; const x = i * 70 + rnd(i) * 60, y = gy(x), s = 3 + rnd(i + 5) * 9;
      if (Math.abs(x - ROCK_X) < 90) continue;
      c.fillStyle = rgb(mix(E.gd, [20, 10, 8], 0.35)); c.beginPath(); c.ellipse(x, y + 3, s * 1.3, s * 0.7, 0, Math.PI, 0); c.fill();
      c.fillStyle = rgb(mix(E.g, [255, 210, 160], 0.2), 0.6); c.beginPath(); c.ellipse(x - s * 0.2, y + 2, s * 0.6, s * 0.25, 0, Math.PI, 0); c.fill();
    }
    // wheel tracks
    c.fillStyle = rgb(E.gd, 0.55);
    for (let x = Math.max(0, Math.floor(x0 / 9) * 9); x < Math.min(S.x - 60, x1); x += 9) { c.fillRect(x, gy(x) + 4, 4, 1.4); c.fillRect(x + 2, gy(x) + 9, 4, 1.2); }
  }

  function drawScenery() {
    // P1 landing site: deflated airbags & lander petals
    const E = S.E;
    for (let i = 0; i < 4; i++) {
      const x = -70 - i * 46 + (i % 2) * 12, y = gy(x);
      c.fillStyle = rgb(mix([226, 220, 206], E.gd, 0.2 + E.dk)); c.beginPath(); c.ellipse(x, y - 2, 38, 10 + (i % 3) * 4, 0, Math.PI, 0); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(x + 6, y - 1, 30, 6, 0, Math.PI, 0); c.fill();
    }
    c.fillStyle = rgb(mix([200, 176, 120], E.gd, 0.2)); c.beginPath(); c.moveTo(-250, gy(-250)); c.lineTo(-215, gy(-215) - 22); c.lineTo(-180, gy(-180) - 4); c.closePath(); c.fill();
    c.fillStyle = rgb(mix([176, 150, 100], E.gd, 0.3)); c.beginPath(); c.moveTo(-330, gy(-330)); c.lineTo(-290, gy(-290) - 16); c.lineTo(-250, gy(-250) - 2); c.closePath(); c.fill();
    // bedrock slab with blueberries
    const rx = ROCK_X;
    c.fillStyle = rgb(mix(E.gd, [70, 40, 34], 0.5)); c.beginPath(); c.moveTo(rx - 82, gy(rx - 82) + 4);
    for (let x = rx - 80; x <= rx + 80; x += 10) c.lineTo(x, gy(x) - 11 - 2.5 * Math.sin(x * 0.3));
    c.lineTo(rx + 84, gy(rx + 84) + 4); c.closePath(); c.fill();
    c.strokeStyle = rgb(mix(E.g, [255, 225, 190], 0.3), 0.6); c.lineWidth = 1.2; c.beginPath();
    for (let x = rx - 80; x <= rx + 80; x += 10) { const y = gy(x) - 11 - 2.5 * Math.sin(x * 0.3); if (x === rx - 80) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
    if (S.blue > 0.01) {
      for (let i = 0; i < 9; i++) {
        const x = rx - 56 + i * 14 + rnd(i) * 5, y = gy(x) - 11 - 2.5 * Math.sin(x * 0.3) + 1, r = 2.4 + rnd(i + 3) * 2.2;
        c.fillStyle = 'rgba(120,132,146,' + S.blue + ')'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(220,230,245,' + S.blue * 0.8 + ')'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, 6.283); c.fill();
        const gl = 0.5 + 0.5 * Math.sin(S.time * 3 + i); c.fillStyle = 'rgba(130,200,255,' + (S.blue * 0.18 * gl) + ')'; c.beginPath(); c.arc(x, y, r * 3, 0, 6.283); c.fill();
      }
    }
    if (S.hold > 0.05 || S.drilled) { c.fillStyle = 'rgba(18,10,8,0.85)'; c.beginPath(); c.ellipse(rx, gy(rx) - 6, 7, 2.4, 0, 0, 6.283); c.fill(); }
    // marathon gate
    const gx = GATE_X, gyy = gy(gx);
    if (Math.abs(gx - S.camX) < 900) {
      c.fillStyle = rgb(mix([220, 214, 200], E.gd, 0.25 + E.dk * 0.5)); c.fillRect(gx - 4, gyy - 120, 7, 120); c.fillRect(gx + 120, gy(gx + 120) - 120, 7, 120);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? 'rgba(20,18,18,0.9)' : 'rgba(240,236,226,0.92)'; c.fillRect(gx + 3 + i * 7.3, gyy - 122 + j * 8, 7.3, 8); }
    }
  }

  // ----- rover -----
  function wheel(x, y, ang, shade, jam) {
    c.save(); c.translate(x, y); if (jam) { c.rotate(-0.32); c.scale(0.8, 1); }
    c.fillStyle = '#251f1b'; c.beginPath(); c.arc(0, 0, WR, 0, 6.283); c.fill();
    c.strokeStyle = '#0c0a09'; c.lineWidth = 1.2; c.stroke();
    c.rotate(ang);
    c.strokeStyle = '#54402e'; c.lineWidth = 2.4; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; c.moveTo(Math.cos(a) * 14.2, Math.sin(a) * 14.2); c.lineTo(Math.cos(a) * 17.2, Math.sin(a) * 17.2); } c.stroke();
    const rg = c.createRadialGradient(-3, -3, 1, 0, 0, 12); rg.addColorStop(0, '#f0ece2'); rg.addColorStop(1, '#b4ad9f');
    c.fillStyle = rg; c.beginPath(); c.arc(0, 0, 12, 0, 6.283); c.fill();
    c.strokeStyle = '#b8622a'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 8.6, 0, 6.283); c.stroke();
    c.strokeStyle = '#2a1710'; c.lineWidth = 1.1; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(0, 0, 8.6, i * 0.698, i * 0.698 + 0.4); c.stroke(); }
    c.fillStyle = '#d8d3c8'; c.beginPath(); c.arc(0, 0, 5, 0, 6.283); c.fill();
    c.fillStyle = '#2b2622'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(Math.cos(i * 1.047) * 3.4, Math.sin(i * 1.047) * 3.4, 0.9, 0, 6.283); c.fill(); }
    c.beginPath(); c.arc(0, 0, 1.8, 0, 6.283); c.fill();
    if (shade) { c.fillStyle = 'rgba(0,0,0,' + shade + ')'; c.beginPath(); c.arc(0, 0, WR, 0, 6.283); c.fill(); }
    c.restore();
  }
  function strut(x1, y1, x2, y2, w, dim) {
    c.lineCap = 'round';
    c.strokeStyle = dim ? '#4c4a46' : '#6f6c66'; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.strokeStyle = dim ? '#8a8780' : '#d2cfc6'; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    if (!dim) {
      const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / 12); c.fillStyle = '#3b3935';
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n * 0.86 + 0.07; c.beginPath(); c.ellipse(lerp(x1, x2, t), lerp(y1, y2, t), 2.6, Math.max(0.8, w * 0.22), Math.atan2(y2 - y1, x2 - x1), 0, 6.283); c.fill(); }
    }
    c.lineCap = 'butt';
  }
  function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function circ(x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }

  function drawRover() {
    const f = S.facing, cs = Math.cos(S.theta), sn = Math.sin(S.theta), E = S.E;
    // wheel centres in world, then local
    const defs = [78, 6, -72], hubs = [];
    const sinkY = S.sink;
    defs.forEach((lx) => {
      const wx = S.x + f * lx * K, wy = gy(wx) - WR * K + sinkY;
      const dx = wx - S.x, dy = wy - S.ry; hubs.push({ x: (dx * cs + dy * sn) * f / K, y: (-dx * sn + dy * cs) / K });
    });
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(S.x, gy(S.x) + 3, 95 * K, 6, 0, 0, 6.283); c.fill();

    c.save(); c.translate(S.x, S.ry); c.rotate(S.theta); c.scale(S.fAnim * K, K);
    const ang = S.spin * f, jamF = S.jam;
    // far side (dim)
    hubs.forEach((h, i) => wheel(h.x - 8, h.y - 6, ang + 0.7, 0.55, jamF && i === 0));
    strut(8, -2, hubs[0].x - 8, hubs[0].y - 6, 4, 1); strut(8, -2, -30, 12, 4, 1);
    strut(-30, 12, hubs[1].x - 8, hubs[1].y - 6, 3.5, 1); strut(-30, 12, hubs[2].x - 8, hubs[2].y - 6, 3.5, 1);

    // ---- robotic arm (stowed/deployed), behind the body nose ----
    const sh = { x: 60, y: 10 }, ease = S.arm * S.arm * (3 - 2 * S.arm);
    const tipT = { x: lerp(44, 140, ease), y: lerp(28, 47, ease) };
    const jit = S.drillOn ? (Math.random() - 0.5) * 1.4 : 0;
    const dx = tipT.x - sh.x, dy = tipT.y - sh.y, d = clamp(Math.hypot(dx, dy), 22, 118), a0 = Math.atan2(dy, dx);
    const l1 = 58, l2 = 62, cA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), A = Math.acos(cA);
    const elIK = { x: sh.x + Math.cos(a0 - A) * l1, y: sh.y + Math.sin(a0 - A) * l1 }, kk = d / Math.max(1, Math.hypot(dx, dy));
    const el = { x: lerp(73, elIK.x, ease), y: lerp(22, elIK.y, ease) };
    const tip = { x: lerp(52, sh.x + dx * kk, ease), y: lerp(25, sh.y + dy * kk + jit, ease) };
    // world tip for sparks
    const tx = tip.x * K * f, ty = (tip.y + 13) * K;
    S.tip.x = S.x + tx * cs - ty * sn; S.tip.y = S.ry + tx * sn + ty * cs;

    // ---- WEB body (gold Kapton foil) ----
    const bg = c.createLinearGradient(0, -22, 0, 18); bg.addColorStop(0, '#e0b457'); bg.addColorStop(0.55, '#b98b32'); bg.addColorStop(1, '#8a6422');
    c.fillStyle = bg; rr(-62, -22, 126, 38, 5); c.fill();
    c.save(); rr(-62, -22, 126, 38, 5); c.clip();
    for (let i = 0; i < 26; i++) { c.fillStyle = i % 3 ? 'rgba(255,228,150,0.20)' : 'rgba(60,38,12,0.28)'; const x = -62 + rnd(i) * 120, y = -22 + rnd(i + 20) * 34; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y + 3); c.lineTo(x + 10, y + 12); c.lineTo(x - 3, y + 9); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.38)'; c.fillRect(-62, 11, 126, 6);
    c.restore();
    c.strokeStyle = '#1e1a16'; c.lineWidth = 1.4; rr(-62, -22, 126, 38, 5); c.stroke();
    // rear transom + nose bulkhead + hazcams
    c.fillStyle = '#e9e2d2'; rr(-72, -28, 16, 24, 3); c.fill(); c.strokeStyle = '#8c8576'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#26221f'; rr(58, -16, 13, 26, 3); c.fill();
    circ(66, -6, 2.6, '#0b0b0e'); circ(66, 3, 2.6, '#0b0b0e'); circ(66, -6, 1, '#38bdf8'); circ(66, 3, 1, '#38bdf8');

    // ---- rocker-bogie (near side) ----
    strut(8, -2, 50, 14, 5, 0); strut(50, 14, hubs[0].x, hubs[0].y, 4.5, 0);
    strut(8, -2, -30, 12, 5, 0); strut(-30, 12, hubs[1].x, hubs[1].y, 4, 0); strut(-30, 12, hubs[2].x, hubs[2].y, 4, 0);
    circ(8, -2, 4.6, '#2a2724'); circ(8, -2, 2, '#9a968c'); circ(-30, 12, 3.8, '#2a2724'); circ(50, 14, 3.2, '#8d8a82');
    // diff bar
    c.strokeStyle = '#8a877f'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, 12); c.lineTo(-52, -6); c.stroke();

    // wheel forks + wheels
    hubs.forEach((h, i) => {
      c.fillStyle = '#34312d'; c.fillRect(h.x - 3, h.y - 24, 6, 9);
      c.fillStyle = '#c9c4b8'; c.fillRect(h.x - 5, h.y - 28, 10, 5);
    });
    hubs.forEach((h, i) => wheel(h.x, h.y, ang, 0, jamF && i === 0));
    if (jamF) { const h = hubs[0]; if (Math.random() < 0.08) { c.strokeStyle = 'rgba(255,220,120,.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(h.x, h.y - 18); c.lineTo(h.x + 6 + Math.random() * 6, h.y - 26 - Math.random() * 6); c.stroke(); } }

    // ---- arm drawn over body nose ----
    strut(sh.x, sh.y, el.x, el.y, 4.2, 0);
    c.strokeStyle = '#b8622a'; c.lineWidth = 4.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(el.x, el.y); c.lineTo(tip.x, tip.y); c.stroke(); c.lineCap = 'butt';
    circ(sh.x, sh.y, 5, '#b8622a'); circ(sh.x, sh.y, 2, '#2a1710'); circ(el.x, el.y, 3.6, '#d2cfc6'); circ(el.x, el.y, 1.4, '#3b3935');
    c.save(); c.translate(tip.x, tip.y); c.fillStyle = '#26221f'; c.beginPath(); c.arc(0, 0, 6.4, 0, 6.283); c.fill();
    c.fillStyle = '#cfc9bb'; c.fillRect(-3, -9, 6, 5); c.fillStyle = '#e9e2d2'; c.fillRect(3, -4, 6, 5);
    c.fillStyle = '#b8622a'; c.fillRect(-3.6, 3, 7.2, 8);
    if (S.drillOn) { c.fillStyle = '#ffd36a'; for (let i = 0; i < 3; i++) c.fillRect(-3 + ((S.time * 40 + i * 2.4) % 6), 3, 1.2, 8); }
    else { c.fillStyle = '#e9c35a'; c.fillRect(-1.4, 11, 2.8, 3); }
    c.restore();
    if (S.spark) {
      const on = Math.sin(S.time * 23) + Math.sin(S.time * 9.7) > 1.1;
      if (on) { c.strokeStyle = 'rgba(255,238,150,0.95)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(sh.x, sh.y); c.lineTo(sh.x + (Math.random() - 0.4) * 16, sh.y - 4 - Math.random() * 12); } c.stroke(); circ(sh.x, sh.y - 2, 3.4, 'rgba(255,220,120,0.4)'); }
    }

    // ---- solar deck (near edge + top surface) ----
    c.fillStyle = '#8a7340'; c.beginPath(); c.moveTo(-68, -24); c.lineTo(72, -24); c.lineTo(72, -19); c.lineTo(-68, -19); c.closePath(); c.fill();
    const sg = c.createLinearGradient(0, -48, 0, -24); sg.addColorStop(0, '#3a2c20'); sg.addColorStop(1, '#241b14');
    c.fillStyle = sg; c.beginPath(); c.moveTo(-68, -24); c.lineTo(72, -24); c.lineTo(92, -47); c.lineTo(-48, -47); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(176,128,70,0.5)'; c.lineWidth = 0.8; c.beginPath();
    for (let i = 1; i < 10; i++) { const t = i / 10; c.moveTo(lerp(-68, 72, t), -24); c.lineTo(lerp(-48, 92, t), -47); }
    for (let j = 1; j < 3; j++) { const t = j / 3; c.moveTo(lerp(-68, -48, t), lerp(-24, -47, t)); c.lineTo(lerp(72, 92, t), lerp(-24, -47, t)); } c.stroke();
    c.strokeStyle = '#a58a4c'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-68, -24); c.lineTo(72, -24); c.lineTo(92, -47); c.lineTo(-48, -47); c.closePath(); c.stroke();
    if (S.dust > 0.01) { c.fillStyle = 'rgba(196,104,56,' + (S.dust * 0.88) + ')'; c.beginPath(); c.moveTo(-68, -24); c.lineTo(72, -24); c.lineTo(92, -47); c.lineTo(-48, -47); c.closePath(); c.fill(); c.fillStyle = 'rgba(196,104,56,' + (S.dust * 0.7) + ')'; c.fillRect(-68, -24, 140, 5); }
    circ(-52, -33, 2.4, '#e9e2d2'); // MarsDial

    // ---- UHF mast + HGA dish ----
    c.strokeStyle = '#cfc9bb'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-58, -26); c.lineTo(-58, -78); c.stroke(); circ(-58, -78, 1.8, '#26221f');
    c.strokeStyle = '#e9e2d2'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-30, -30); c.lineTo(-30, -48); c.stroke();
    const dt_ = S.dish, dcx = -30 + 6 * dt_, dcy = -56 - 6 * dt_, drx = 5 + 12 * dt_, dry = 17 - 11 * dt_;
    c.fillStyle = '#b8622a'; c.beginPath(); c.ellipse(dcx, dcy, drx, dry, 0.18 * (1 - dt_), 0, 6.283); c.fill();
    c.fillStyle = '#26221f'; c.beginPath(); c.ellipse(dcx + 1.5 * (1 - dt_), dcy, drx * 0.85, dry * 0.9, 0.18 * (1 - dt_), 0, 6.283); c.fill();
    circ(dcx + 1.5, dcy, 1.6, '#e9e2d2');

    // ---- PMA mast + camera head ----
    c.fillStyle = '#e9e2d2'; c.beginPath(); c.moveTo(34, -27); c.lineTo(48, -27); c.lineTo(44, -40); c.lineTo(38, -40); c.closePath(); c.fill();
    c.fillStyle = '#b8622a'; c.fillRect(36, -46, 10, 7); c.fillStyle = '#7a3a18'; for (let i = 0; i < 4; i++) c.fillRect(37 + i * 2.4, -45, 0.9, 5);
    c.fillStyle = '#e4ddcc'; c.fillRect(38, -96, 6, 52); c.fillStyle = '#1e1a16'; c.fillRect(40.4, -96, 1.3, 52); c.fillStyle = '#7d6a38'; c.fillRect(38, -72, 6, 5);
    c.save(); c.translate(41, -99); c.rotate(-1.25 * S.tilt);
    c.fillStyle = '#e9e2d2'; rr(-9, -9, 30, 13, 3); c.fill(); c.strokeStyle = '#8c8576'; c.lineWidth = 0.9; c.stroke();
    c.fillStyle = '#d9d2c1'; c.fillRect(-6, 4, 24, 5);
    const pan = Math.sin(S.time * 0.9) * (S.fin >= 0 ? 0 : 1.6);
    circ(-3 + pan, -3, 3.4, '#0b0b0e'); circ(15 + pan, -3, 3.4, '#0b0b0e'); circ(-3 + pan, -3, 1.4, '#38bdf8'); circ(15 + pan, -3, 1.4, '#38bdf8');
    c.fillStyle = '#9d8440'; c.fillRect(4 + pan, -6, 3, 6); c.fillRect(8 + pan, -6, 3, 6);
    c.restore();

    c.restore();
  }

  function drawParticles() {
    S.parts.forEach((p) => {
      const a = 1 - p.l / p.m;
      if (p.t === 2) { c.strokeStyle = 'rgba(' + p.c + ',' + (0.42 * a) + ')'; c.lineWidth = p.s; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); c.stroke(); }
      else if (p.t === 1) { c.strokeStyle = 'rgba(' + p.c + ',' + (0.7 * a) + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(p.x, p.y, 3 + p.l * 14, 0, 6.283); c.stroke(); c.fillStyle = 'rgba(' + p.c + ',' + a + ')'; c.fillRect(p.x - 2, p.y - 2, 4, 4); }
      else { c.fillStyle = 'rgba(' + p.c + ',' + (0.75 * a) + ')'; c.beginPath(); c.arc(p.x, p.y, p.s * (0.7 + 0.5 * p.l), 0, 6.283); c.fill(); }
    });
  }

  function render() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSky();
    // world
    c.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (W * 0.36 - S.camX * sc), dpr * (H * 0.56 - S.camY * sc));
    const x0 = S.camX - (W * 0.36) / sc - 30, x1 = S.camX + (W * 0.7) / sc + 30;
    drawGround(x0, x1); drawScenery();
    // pose
    const slope = Math.atan2(gy(S.x + 60) - gy(S.x - 60), 120);
    S.theta = lerp(S.theta, 0.5 * slope + S.rockAng + S.sink * 0.0022 * S.facing, 0.25);
    const yA = gy(S.x + 78 * S.facing * K), yB = gy(S.x - 72 * S.facing * K);
    S.ry = (yA + yB) / 2 - 44 * K + S.sink * 0.9 + (Math.abs(S.v) > 10 ? Math.sin(S.time * 14) * 0.5 : 0);
    drawRover();
    if (S.sink > 0.6) drawGround(S.x - 130, S.x + 130, true);
    drawParticles();

    // screen space overlays
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const E = S.E;
    if (E.hz > 0.01) { c.fillStyle = rgb(E.hc, E.hz * 0.55); c.fillRect(0, 0, W, H); const hg = c.createLinearGradient(0, H * 0.4, 0, H * 0.75); hg.addColorStop(0, rgb(E.hc, 0)); hg.addColorStop(0.6, rgb(E.hc, E.hz * 0.5)); hg.addColorStop(1, rgb(E.hc, 0)); c.fillStyle = hg; c.fillRect(0, H * 0.4, W, H * 0.35); }
    if (E.dk > 0.01) { c.fillStyle = 'rgba(2,1,2,' + E.dk + ')'; c.fillRect(0, 0, W, H); }
    const vg = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    // memory-loss glitch slices
    if (S.glFlash > 0.15) {
      for (let i = 0; i < 4; i++) { const y = Math.random() * H, h = 6 + Math.random() * 26, dx = (Math.random() - 0.5) * 40 * S.glFlash; try { c.drawImage(cvs, 0, y * dpr, W * dpr, h * dpr, dx, y, W, h); } catch (e) {} }
      c.fillStyle = 'rgba(120,200,255,' + (0.05 * S.glFlash) + ')'; c.fillRect(0, 0, W, H);
    }
    // static frame (final photo)
    if (S.statics) {
      if (!noiseCv) { noiseCv = document.createElement('canvas'); noiseCv.width = 160; noiseCv.height = 90; }
      const nc = noiseCv.getContext('2d'), id = nc.createImageData(160, 90);
      for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      nc.putImageData(id, 0, 0); c.imageSmoothingEnabled = false; c.globalAlpha = 0.55; c.drawImage(noiseCv, 0, 0, W, H); c.globalAlpha = 1; c.imageSmoothingEnabled = true;
    }
    if (S.blackA > 0) { c.fillStyle = 'rgba(0,0,0,' + S.blackA + ')'; c.fillRect(0, 0, W, H); }
    if (S.intro < 1) { c.fillStyle = 'rgba(0,0,0,' + (1 - S.intro) + ')'; c.fillRect(0, 0, W, H); }
  }

  // =========================================================================
  // INPUT / LIFECYCLE
  // =========================================================================
  function resize() {
    if (!cvs) return; const r = cvs.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.max(320, r.width); H = Math.max(240, r.height);
    cvs.width = W * dpr; cvs.height = H * dpr; sc = H / 600;
  }

  function setupControls() {
    if (controlsReady) return; controlsReady = true;
    const kmap = { KeyD: 'd', ArrowRight: 'd', KeyA: 'a', ArrowLeft: 'a', Space: 'space', KeyE: 'e' };
    window.addEventListener('keydown', (ev) => {
      if (!window.__experienceActive || !S) return;
      if (ev.code === 'Escape') { 
        narrator.stop();
        if (typeof window.closeOverlays === 'function') window.closeOverlays(); 
        return; 
      }
      if (ev.code === 'KeyR' && S.finished) { restart(); return; }
      const k = kmap[ev.code]; if (!k) return; ev.preventDefault(); audio.init();
      if (!ev.repeat && !keys[k]) {
        if (k === 'space') S.pressSpace = 1; if (k === 'e') S.pressE = 1;
        const cur = STEPS[S.stepI];
        if ((k === 'a' || k === 'd') && S.trapped && cur && cur.id === 'rock' && S.rockSide !== k) { S.rockSide = k; S.rockN++; S.rockKick = 1; if (S.rockN >= 16) { S.trapped = 0; S.freed = 1; S.v = 150; for (let i = 0; i < 24; i++) spawn({ x: S.x + (Math.random() - 0.5) * 140, y: gy(S.x) - 4, vx: (Math.random() - 0.3) * 200, vy: -80 - Math.random() * 120, g: 200, m: 1, s: 2 + Math.random() * 2 }); } }
      }
      keys[k] = 1;
    });
    window.addEventListener('keyup', (ev) => { const k = kmap[ev.code]; if (k) keys[k] = 0; });
    window.addEventListener('blur', () => { keys.d = keys.a = keys.space = keys.e = 0; });
    const btn = $('btnAudioToggle');
    if (btn) btn.addEventListener('click', () => { audio.init(); audio.setMuted(!audio.muted); btn.textContent = audio.muted ? '🔇 SFX: OFF' : '🔊 SFX: ON'; });
    const vb = $('btnVoiceToggle');
    if (vb) {
      vb.addEventListener('click', () => {
        narrator.enabled = !narrator.enabled;
        if (!narrator.enabled) {
          narrator.stop();
        } else {
          const cur = STEPS[S.stepI];
          if (cur && cur.say) narrator.speak(cur.say, cur.id);
        }
        const textSpan = $('btnVoiceText');
        if (textSpan) textSpan.textContent = narrator.enabled ? 'VOICE: ON' : 'VOICE: OFF';
        else vb.textContent = narrator.enabled ? '🎙️ VOICE: ON' : '🎙️ VOICE: OFF';
        vb.className = narrator.enabled
          ? 'px-3 py-1 rounded-full border border-oppy-accent/70 bg-black/60 hover:border-oppy-accent backdrop-blur-md text-white text-[11px] font-sans uppercase transition-colors cursor-pointer shadow-lg flex items-center space-x-1.5'
          : 'px-3 py-1 rounded-full border border-white/20 bg-black/60 hover:border-white/40 backdrop-blur-md text-oppy-textMuted text-[11px] font-sans uppercase transition-colors cursor-pointer shadow-lg flex items-center space-x-1.5';
      });
    }
    const rb = $('finalActionBtn'); if (rb) rb.addEventListener('click', () => { if (S && S.finished) restart(); });
    // touch / mouse: action prompts map to a tap, otherwise left/right halves = A / D
    const pd = (ev, down) => {
      if (!window.__experienceActive || !S) return; audio.init();
      const st = STEPS[S.stepI], r = cvs.getBoundingClientRect(), cx = ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX;
      const fire = (code) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
      if (st && st.need && S.x >= st.to - 3 && st.need.k === 'hold') return fire('Space');
      if (st && st.need && st.need.k === 'press' && S.x >= st.to - 3) return fire(st.need.key === 'e' ? 'KeyE' : 'Space');
      if (!down) { ['Space', 'KeyE', 'KeyD', 'KeyA'].forEach(fire); return; }
      fire(cx - r.left > r.width * 0.5 ? 'KeyD' : 'KeyA');
    };
    ['mousedown', 'touchstart'].forEach((n) => cvs.addEventListener(n, (e) => pd(e, true), { passive: true }));
    ['mouseup', 'touchend', 'touchcancel'].forEach((n) => window.addEventListener(n, (e) => pd(e, false)));
  }

  window.__merAudioUnlock = function () {
    audio.init();
    audio.resume();
    narrator.init();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  // Automatic user gesture audio unlock
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, () => {
      if (window.__experienceActive) {
        audio.init();
        audio.resume();
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, { passive: true });
  });

  window.startMissionExperience = function () {
    window.__experienceActive = true;
    cvs = $('storyCanvas'); if (!cvs) return; c = cvs.getContext('2d');
    resize(); setupControls();
    narrator.init();
    if (!S || S.finished) restart();
    else if (S && STEPS[S.stepI]) narrator.speak(STEPS[S.stepI].say, STEPS[S.stepI].id);
    lastT = performance.now(); if (raf) cancelAnimationFrame(raf);
    audio.init();
    const loop = (now) => {
      if (!window.__experienceActive) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      S.intro = Math.min(1, S.intro + dt * 0.7);
      try { update(dt); render(); } catch (err) { console.error('mission loop error:', err); }
    };
    raf = requestAnimationFrame(loop);
  };
  window.pauseMissionExperience = function () {
    window.__experienceActive = false; if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (S && S.fin >= 0) S.finished = 1;
    keys.d = keys.a = keys.space = keys.e = 0;
    if (audio.ok) { audio.sg.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.05); }
    narrator.stop();
  };
  window.resizeMissionExperience = resize;
  window.addEventListener('resize', () => { if (window.__experienceActive) resize(); });
})();
