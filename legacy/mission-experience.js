// =========================================================================
// MISSION EXPERIENCE SIMULATION ENGINE (Extracted from NASA MER-B Core)
// Realistic 2.5D Martian Terrain, Rocker-Bogie Suspension Kinematics & Audio
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


  // 1. ACTS DATABASE (Martian Terrain & Environmental Parameters)
              // =========================================================================
            // 1. MISSION DATABASE: 6 HISTORICAL ACTS & 7 EXPANDABLE 3D SUBSYSTEMS
            // =========================================================================
            const ACTS = [
                {
                    id: 1,
                    name: 'ACT I · EAGLE CRATER',
                    fullTitle: 'ACT I // THE INTERPLANETARY HOLE-IN-ONE (EAGLE CRATER)',
                    dateStr: 'JAN – APR 2004',
                    kmStart: 0.0,
                    kmEnd: 0.8,
                    solStart: 1,
                    solEnd: 90,
                    landmarkKm: 0.42,
                    landmarkName: 'Eagle Crater Bedrock Outcrop — "Martian Blueberries"',
                    landmarkHint: 'Deploying 5-DOF Robotic Arm, RAT Diamond Grinder & Mössbauer/APXS Spectrometers',
                    activeHardware: 'IDD 5-DOF Robotic Arm & RAT Grinder',
                    subtitle: '“Designed for just 90 sols and 1 kilometer. Inside Eagle Crater, Oppy reaches out its robotic arm and discovers hematite ‘blueberries’—proving ancient liquid water once soaked Mars.”',
                    scienceNote: '[SCIENCE TELEMETRY]: Mössbauer MIMOS II & APXS confirm jarosite + gray crystalline hematite concretions',
                    syncPart: 'arm',
                    skyTop: [78, 48, 28],
                    skyMid: [168, 108, 64],
                    skyBottom: [224, 168, 114],
                    groundNear: '#7c3219',
                    groundMid: '#9e4624',
                    groundFar: '#c26b3f'
                },
                {
                    id: 2,
                    name: 'ACT II · PURGATORY DUNE',
                    fullTitle: 'ACT II // ENDURANCE CRATER, HEAT SHIELD ROCK & PURGATORY DUNE',
                    dateStr: 'MAY 2004 – NOV 2005',
                    kmStart: 0.8,
                    kmEnd: 8.5,
                    solStart: 91,
                    solEnd: 654,
                    landmarkKm: 5.2,
                    landmarkName: 'Purgatory Dune Trap & Heat Shield Meteorite',
                    landmarkHint: 'All 6 wheels axle-deep in soft sand! Hold [D] to spin cleats & crawl onto firm bedrock',
                    activeHardware: '6-Wheel Rocker-Bogie & Cleated Aluminum Wheels',
                    subtitle: '“Sol 446: All six wheels sink into Purgatory Dune. For five weeks, engineers fight for every millimeter—192 meters of wheel spins just to gain 1 meter of ground—until Oppy breaks free.”',
                    scienceNote: '[HARDWARE TELEMETRY]: Discovered Fe-Ni Heat Shield Rock meteorite · Joint-1 Shoulder Heater Switch Fault',
                    syncPart: 'suspension',
                    skyTop: [84, 50, 26],
                    skyMid: [178, 112, 62],
                    skyBottom: [230, 172, 110],
                    groundNear: '#84361a',
                    groundMid: '#a84b25',
                    groundFar: '#ce7342'
                },
                {
                    id: 3,
                    name: 'ACT III · VICTORIA & 2007 STORM',
                    fullTitle: 'ACT III // VICTORIA CRATER & SURVIVING THE 2007 KILLER DUST STORM',
                    dateStr: 'SEP 2006 – AUG 2008',
                    kmStart: 8.5,
                    kmEnd: 18.0,
                    solStart: 951,
                    solEnd: 1634,
                    landmarkKm: 11.4,
                    landmarkName: 'Victoria Crater (Duck Bay) & 2007 Global Dust Storm',
                    landmarkHint: 'Opacity τ = 5.0 drops solar output to 128 Wh until Martian wind cleaning gusts sweep the wings!',
                    activeHardware: 'Triple-Junction GaAs Solar Array Wings',
                    subtitle: '“99% of direct sunlight vanishes. Solar output drops to 128 watt-hours—just above freezing death. Then, the Martian wind itself saves Oppy, sweeping the dust from its wings.”',
                    scienceNote: '[POWER TELEMETRY]: Dust Factor plummets to 0.21 (128 Wh) → Martian Dust Devil Cleaning Event restores 700 Wh',
                    syncPart: 'solar',
                    skyTop: [68, 24, 12],
                    skyMid: [128, 48, 22],
                    skyBottom: [168, 72, 34],
                    groundNear: '#5e2210',
                    groundMid: '#7d3018',
                    groundFar: '#9c4223'
                },
                {
                    id: 4,
                    name: 'ACT IV · LOSING SPIRIT & ENDEAVOUR',
                    fullTitle: 'ACT IV // LOSING TWIN SPIRIT & THE 21-KM ODYSSEY TO ENDEAVOUR CRATER',
                    dateStr: 'MAR 2010 – MAY 2013',
                    kmStart: 18.0,
                    kmEnd: 36.5,
                    solStart: 2200,
                    solEnd: 3300,
                    landmarkKm: 32.5,
                    landmarkName: 'Endeavour Crater (Spirit Point & Matijevic Hill)',
                    landmarkHint: 'Driving backward to spare jammed front-right steering · Pancam & Mini-TES scan Homestake gypsum vein',
                    activeHardware: 'Pancam Masthead & Mini-TES Infrared Periscope',
                    subtitle: '“In 2010, its twin Spirit falls silent forever. Alone on Mars, driving backward to spare an arthritic front wheel, Oppy treks 21 kilometers to Endeavour Crater—discovering ancient, drinkable water.”',
                    scienceNote: '[MINERALOGY TELEMETRY]: Homestake calcium-sulfate gypsum vein + iron-magnesium smectite clays (neutral pH water)',
                    syncPart: 'mast',
                    skyTop: [22, 26, 42],
                    skyMid: [112, 72, 54],
                    skyBottom: [188, 124, 82],
                    groundNear: '#632916',
                    groundMid: '#853a20',
                    groundFar: '#ad5433'
                },
                {
                    id: 5,
                    name: 'ACT V · FLASH AMNESIA & MARATHON',
                    fullTitle: 'ACT V // BANK 7 FLASH MEMORY AMNESIA & THE FIRST MARTIAN MARATHON',
                    dateStr: 'DEC 2014 – MAR 2017',
                    kmStart: 36.5,
                    kmEnd: 44.0,
                    solStart: 3540,
                    solEnd: 4700,
                    landmarkKm: 42.195,
                    landmarkName: 'Marathon Valley (42.195 km) — RAM-Only Telemetry Downlink',
                    landmarkHint: 'Bank 7 Flash Memory fails · High-Gain & UHF Antennas beam volatile RAM data home before every sunset',
                    activeHardware: 'Warm Electronics Box (RAD6000 CPU) & High-Gain Antenna',
                    subtitle: '“Stripped of its long-term flash memory by a decade of cosmic radiation, Oppy forgets everything each night—beaming every memory home before sunset as it completes the first marathon on another world.”',
                    scienceNote: '[AVIONICS TELEMETRY]: Sol 4027 RAM-Only Mode Engaged · 42.195 km Extraterrestrial Marathon Record Set on Sol 3968',
                    syncPart: 'web',
                    skyTop: [28, 28, 44],
                    skyMid: [128, 76, 48],
                    skyBottom: [196, 128, 78],
                    groundNear: '#6b2b15',
                    groundMid: '#8f3d20',
                    groundFar: '#b85834'
                },
                {
                    id: 6,
                    name: 'ACT VI · PERSEVERANCE VALLEY FINALE',
                    fullTitle: 'ACT VI // PERSEVERANCE VALLEY & THE FINAL MESSAGE (SOL 5111)',
                    dateStr: 'JUNE 10, 2018 – FEB 13, 2019',
                    kmStart: 44.0,
                    kmEnd: 45.16,
                    solStart: 5100,
                    solEnd: 5111,
                    landmarkKm: 45.16,
                    landmarkName: 'Perseverance Valley Final Resting Site (45.16 km)',
                    landmarkHint: 'Planetary Dust Storm τ > 10.8 · Solar drops to 22 Wh · Pancam tilts upward into pitch-black sky',
                    activeHardware: 'Li-Ion Battery Pack & High-Gain X-Band Dish',
                    subtitle: '“SOL 5111: Atmospheric opacity spikes past 10.8. Solar energy plummets to 22 watt-hours. ‘My battery is low and it’s getting dark.’ — 90 Sols Planned. 5,352 Sols Survived.”',
                    scienceNote: '[FINAL DOWNLINK]: June 10, 2018 · 22 Wh Solar Output · Tau > 10.8 · Mission Declared Complete Feb 13, 2019',
                    syncPart: 'battery',
                    skyTop: [8, 5, 5],
                    skyMid: [22, 10, 8],
                    skyBottom: [38, 16, 10],
                    groundNear: '#2e1108',
                    groundMid: '#42190c',
                    groundFar: '#592312'
                }
            ];

            const SUBSYSTEM_INFO = {
                all: {
                    code: 'MER-B // FULL SYSTEM',
                    actLink: 'ALL 6 ACTS',
                    title: 'Mars Exploration Rover Opportunity (MER-B)',
                    spec1: '185 kg Dry Mass · 1.5m × 2.3m × 1.6m',
                    spec2: 'Planned: 90 Sols | Actual: 5,352 Sols',
                    desc: 'Launched July 7, 2003 and landed January 25, 2004 inside Eagle Crater at Meridiani Planum. Opportunity operated 55 times longer than its 90-sol design life, traversing 45.16 km across six major geological epochs.',
                    impact: 'Click any subsystem on the 3D rover or in the bottom bar—or drive with [D] in the 2.5D story—to isolate and inspect its mechanism.'
                },
                arm: {
                    code: 'SUBSYSTEM 01 // IDD-RAT',
                    actLink: 'ACT I SYNC · EAGLE CRATER',
                    title: '5-DOF Robotic Arm (IDD) & Instrument Turret',
                    spec1: '5 Azimuth/Elevation Joints · 4-Tool Turret',
                    spec2: 'RAT + Microscopic Imager + MB + APXS',
                    desc: 'The Instrument Deployment Device (IDD) holds a rotating turret with the diamond-toothed Rock Abrasion Tool (RAT—shielded with aluminum recovered from the 9/11 World Trade Center), Microscopic Imager (MI), Mössbauer Spectrometer, and Alpha Particle X-Ray Spectrometer (APXS).',
                    impact: 'Ground 4.5 mm into Eagle Crater outcrops on Sol 30, proving ancient liquid water via hematite "blueberries" and jarosite sulfate.'
                },
                suspension: {
                    code: 'SUBSYSTEM 02 // MOBILITY',
                    actLink: 'ACT II SYNC · PURGATORY DUNE',
                    title: 'Rocker-Bogie Suspension & 6 Cleated Wheels',
                    spec1: '6 × 25 cm Machined Aluminum Wheels',
                    spec2: 'Max Tilt: 32° · Perforated Titanium Struts',
                    desc: 'Springless perforated box-beam Rocker-Bogie linkage connected through a central differential bar keeps all six cleated aluminum wheels planted over boulders larger than the wheel diameter while inner spiral flexures absorb shock.',
                    impact: 'Escaped axle-deep sand at Purgatory Dune (Sol 446–484) and drove over 25 km backward after the right-front steering actuator jammed.'
                },
                solar: {
                    code: 'SUBSYSTEM 03 // POWER ARRAY',
                    actLink: 'ACT III SYNC · VICTORIA STORM',
                    title: 'Winged Gallium Arsenide Solar Arrays',
                    spec1: 'Triple-Junction GaInP/GaAs/Ge Cells',
                    spec2: 'Peak: 140 W (900 Wh/sol) · Survival: ~100 Wh',
                    desc: 'Deployable 7-facet winged solar array table covered in triple-junction photovoltaic cells, complete with the MarsDial calibration sundial on the rear deck corner.',
                    impact: 'Survived the 2007 global dust storm (128 Wh low point) thanks to serendipitous Martian wind "Cleaning Events" that repeatedly swept dust off the panels.'
                },
                mast: {
                    code: 'SUBSYSTEM 04 // PMA MAST',
                    actLink: 'ACT IV SYNC · ENDEAVOUR CRATER',
                    title: 'Pancam & Mini-TES Mast Assembly',
                    spec1: '1.5 m Elevation · 360° Azimuth / ±90° Pitch',
                    spec2: 'Stereo Pancam + Navcams + Mini-TES IR',
                    desc: 'The Pancam Mast Assembly (PMA) acts as the rover’s human-height eyes, housing twin multispectral Panoramic Cameras (Pancam), wide-angle Navigation Cameras, and the Miniature Thermal Emission Spectrometer (Mini-TES) periscope.',
                    impact: 'Surveyed the Homestake gypsum vein and ancient smectite clay minerals at Endeavour Crater, confirming neutral, drinkable ancient water.'
                },
                web: {
                    code: 'SUBSYSTEM 05 // AVIONICS & WEB',
                    actLink: 'ACT V SYNC · MARATHON VALLEY',
                    title: 'Warm Electronics Box (WEB) & RAD6000 Computer',
                    spec1: '20 MHz BAE RAD6000 CPU · 128 MB DRAM',
                    spec2: '256 MB Flash + 8 × Pu-238 RHU Heaters',
                    desc: 'Insulated with crinkled gold Kapton foil and aerogel walls, the WEB protects the radiation-hardened RAD6000 flight computer and 8 Plutonium-238 Radioisotope Heater Units (1 Watt thermal each) against −105°C nights.',
                    impact: 'When cosmic rays wore out Bank 7 Flash memory in 2014, JPL reprogrammed the RAD6000 on Sol 4027 to operate in volatile RAM-Only Mode.'
                },
                antennas: {
                    code: 'SUBSYSTEM 06 // TELECOM',
                    actLink: 'ACT V & VI SYNC · DEEP SPACE LINK',
                    title: 'High-Gain (HGA) & UHF Low-Gain Antennas',
                    spec1: 'Steerable X-Band Dish + UHF Monopole',
                    spec2: 'DSN Direct-to-Earth + Odyssey/MRO Relay',
                    desc: 'The 2-axis gimbaled High-Gain Antenna beams X-Band telemetry directly to Earth’s Deep Space Network dishes, while the omnidirectional UHF antenna on its lattice riser relays daily science through Mars Odyssey and MRO.',
                    impact: 'Transmitted every day’s volatile RAM science before sunset in Act V, and received over 1,000 recovery commands plus "I’ll Be Seeing You" in 2019.'
                },
                battery: {
                    code: 'SUBSYSTEM 07 // ENERGY STORAGE',
                    actLink: 'ACT VI SYNC · SOL 5111 FINALE',
                    title: 'Lithium-Ion Rechargeable Battery Pack',
                    spec1: 'Dual 8-Cell Yardney Li-Ion (2 × 8 Ah)',
                    spec2: '32V Bus · >5,000 Martian Sol Cycles',
                    desc: 'Two rechargeable lithium-ion battery packs mounted inside the forward Warm Electronics Box store daytime solar power to keep survival heaters and the mission clock alive through freezing Martian nights.',
                    impact: 'Endured over 5,000 charge-discharge cycles—10× any prior space battery—before the June 10, 2018 storm (τ > 10.8) drained solar input to 22 Wh.'
                }
            };


  // 2. CENTRAL REAL-TIME SIMULATION STATE
              // =========================================================================
            // 2. CENTRAL SYNCHRONIZED APPLICATION STATE
            // =========================================================================
            const state = {
                odometerKm: 0.0,
                velocityKmPerSec: 0.0,
                currentAct: 1,
                sol: 1,
                solarWh: 900,
                tau: 0.50,
                dustFactor: 0.95,
                panelDustVisual: 0.05,
                wheelSpinPhase: 0,
                drivingBackward: false,
                keys: { left: false, right: false },
                autoCruise: false,
                sync3DTo2D: true,
                selected3DPart: 'arm',
                explodeAmount: 0.0,
                targetExplodeAmount: 0.0,
                armDeployProgress: 0.45,
                armTargetDeploy: 0.0,
                scanActiveTimer: 2.8,
                windGustTimer: 0.0,
                antennaBeamTimer: 0.0,
                glitchIntensity: 0.0,
                finaleShown: false,
                finaleDismissed: false,
                audioEnabled: true,
                cardExpanded: false,
                cinematicMode: false,
                drawerOpen: false
            };


  // 3. PROCEDURAL WEB AUDIO SOUNDSCAPE ENGINE
              // =========================================================================
            // 3. PROCEDURAL WEB AUDIO API SOUNDSCAPE ENGINE
            // =========================================================================
            class ProceduralAudioEngine {
                constructor() {
                    this.ctx = null;
                    this.initialized = false;
                    this.windGain = null;
                    this.servoOsc = null;
                    this.servoGain = null;
                    this.lastClickTime = 0;
                }

                init() {
                    if (this.initialized) return;
                    try {
                        const AudioCtx = window.AudioContext || window.webkitAudioContext;
                        if (!AudioCtx) return;
                        this.ctx = new AudioCtx();

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
                            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
                            b6 = white * 0.115926;
                        }
                        const windSource = this.ctx.createBufferSource();
                        windSource.buffer = noiseBuffer;
                        windSource.loop = true;

                        this.windFilter = this.ctx.createBiquadFilter();
                        this.windFilter.type = 'bandpass';
                        this.windFilter.frequency.value = 260;
                        this.windFilter.Q.value = 1.8;

                        this.windGain = this.ctx.createGain();
                        this.windGain.gain.value = 0.035;

                        windSource.connect(this.windFilter);
                        this.windFilter.connect(this.windGain);
                        this.windGain.connect(this.ctx.destination);
                        windSource.start();

                        this.servoOsc = this.ctx.createOscillator();
                        this.servoOsc.type = 'sawtooth';
                        this.servoOsc.frequency.value = 68;

                        const servoFilter = this.ctx.createBiquadFilter();
                        servoFilter.type = 'lowpass';
                        servoFilter.frequency.value = 240;

                        this.servoGain = this.ctx.createGain();
                        this.servoGain.gain.value = 0.0;

                        this.servoOsc.connect(servoFilter);
                        servoFilter.connect(this.servoGain);
                        this.servoGain.connect(this.ctx.destination);
                        this.servoOsc.start();

                        this.initialized = true;
                    } catch (err) {
                        // Ignore audio restrictions prior to gesture
                    }
                }

                update(dt) {
                    if (!this.initialized || !this.ctx) return;
                    if (this.ctx.state === 'suspended' && state.audioEnabled) {
                        this.ctx.resume().catch(() => { });
                    }
                    const now = this.ctx.currentTime;
                    if (!state.audioEnabled) {
                        this.windGain.gain.setTargetAtTime(0, now, 0.1);
                        this.servoGain.gain.setTargetAtTime(0, now, 0.1);
                        return;
                    }

                    const stormFactor = Math.min(1, state.tau / 10.8);
                    const gustBoost = state.windGustTimer > 0 ? 0.22 : 0;
                    this.windGain.gain.setTargetAtTime(0.035 + stormFactor * 0.16 + gustBoost, now, 0.15);
                    this.windFilter.frequency.setTargetAtTime(220 + stormFactor * 380 + (state.windGustTimer > 0 ? 450 : 0), now, 0.15);

                    const speedAbs = Math.abs(state.velocityKmPerSec);
                    const isDriving = speedAbs > 0.01;
                    const purgatorySpin = (state.odometerKm > 4.7 && state.odometerKm < 5.7 && isDriving) ? 1.6 : 1.0;
                    this.servoGain.gain.setTargetAtTime(isDriving ? Math.min(0.07, 0.02 + speedAbs * 0.01) : 0.0, now, 0.08);
                    this.servoOsc.frequency.setTargetAtTime(60 + Math.min(180, speedAbs * 30 * purgatorySpin), now, 0.08);

                    if (state.scanActiveTimer > 0 && performance.now() - this.lastClickTime > 95) {
                        this.lastClickTime = performance.now();
                        this.playSpectrometerClick();
                    }
                }

                playSpectrometerClick() {
                    if (!this.initialized || !state.audioEnabled || !this.ctx) return;
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(1100 + Math.random() * 900, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);
                    gain.gain.setValueAtTime(0.04, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.04);
                }

                playWindWhoosh() {
                    if (!this.initialized) this.init();
                    if (!this.initialized || !state.audioEnabled || !this.ctx) return;
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(520, now + 0.4);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 1.2);
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(0.065, now + 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 1.25);
                }

                playFinaleChord() {
                    if (!this.initialized) this.init();
                    if (!this.initialized || !state.audioEnabled || !this.ctx) return;
                    const notes = [311.13, 392.00, 466.16, 587.33, 622.25, 523.25, 466.16, 392.00];
                    const now = this.ctx.currentTime;
                    notes.forEach((freq, idx) => {
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'sine';
                        const start = now + idx * 0.55;
                        osc.frequency.setValueAtTime(freq, start);
                        gain.gain.setValueAtTime(0.001, start);
                        gain.gain.linearRampToValueAtTime(0.05, start + 0.12);
                        gain.gain.exponentialRampToValueAtTime(0.0008, start + 1.6);
                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start(start);
                        osc.stop(start + 1.65);
                    });
                }
            }

            const audioEngine = new ProceduralAudioEngine();


  // 4. HISTORICAL TELEMETRY MATHEMATICAL CURVES
              // =========================================================================
            // 4. TELEMETRY & ACT COMPUTATION FROM ODOMETER (0.00 km -> 45.16 km)
            // =========================================================================
            function getActForKm(km) {
                for (let i = 0; i < ACTS.length; i++) {
                    if (km <= ACTS[i].kmEnd || i === ACTS.length - 1) {
                        return ACTS[i];
                    }
                }
                return ACTS[0];
            }

            function computeTelemetryFromKm(km) {
                const act = getActForKm(km);
                const spanKm = Math.max(0.001, act.kmEnd - act.kmStart);
                const t = Math.max(0, Math.min(1, (km - act.kmStart) / spanKm));

                state.sol = Math.round(act.solStart + t * (act.solEnd - act.solStart));

                if (act.id === 1) {
                    state.tau = 0.50 + t * 0.20;
                    state.solarWh = Math.round(900 - t * 80);
                    state.dustFactor = 0.95 - t * 0.06;
                    state.panelDustVisual = 0.06 + t * 0.12;
                    state.drivingBackward = false;
                    state.glitchIntensity = 0;
                } else if (act.id === 2) {
                    state.tau = 0.70 + t * 0.45;
                    state.solarWh = Math.round(810 - t * 220);
                    state.dustFactor = 0.88 - t * 0.24;
                    state.panelDustVisual = 0.18 + t * 0.30;
                    state.drivingBackward = false;
                    state.glitchIntensity = 0;
                } else if (act.id === 3) {
                    if (km < 11.55) {
                        const stormT = Math.max(0, Math.min(1, (km - 8.5) / 3.0));
                        state.tau = 1.15 + stormT * 3.85;
                        state.solarWh = Math.round(590 - stormT * 462);
                        state.dustFactor = 0.64 - stormT * 0.43;
                        state.panelDustVisual = 0.48 + stormT * 0.44;
                    } else {
                        const cleanT = Math.max(0, Math.min(1, (km - 11.55) / 1.5));
                        state.tau = 5.0 - cleanT * 4.1;
                        state.solarWh = Math.round(128 + cleanT * 572);
                        state.dustFactor = 0.21 + cleanT * 0.57;
                        state.panelDustVisual = Math.max(0.12, 0.92 - cleanT * 0.80);
                    }
                    state.drivingBackward = false;
                    state.glitchIntensity = 0;
                } else if (act.id === 4) {
                    state.tau = 0.85 + Math.sin(t * Math.PI) * 0.55;
                    state.solarWh = Math.round(680 - t * 190);
                    state.dustFactor = 0.75 - t * 0.18;
                    state.panelDustVisual = 0.22 + t * 0.26;
                    state.drivingBackward = true;
                    state.glitchIntensity = 0;
                } else if (act.id === 5) {
                    state.tau = 0.95 + t * 0.75;
                    state.solarWh = Math.round(540 - t * 160);
                    state.dustFactor = 0.62 - t * 0.15;
                    state.panelDustVisual = 0.35 + t * 0.22;
                    state.drivingBackward = true;
                    state.glitchIntensity = 0.35 + 0.45 * Math.sin(performance.now() * 0.01);
                    state.antennaBeamTimer = 1.0;
                } else {
                    const stormSpike = Math.pow(t, 1.35);
                    state.tau = 1.80 + stormSpike * 9.00;
                    state.solarWh = Math.max(22, Math.round(340 - stormSpike * 318));
                    state.dustFactor = Math.max(0.02, 0.45 - stormSpike * 0.43);
                    state.panelDustVisual = Math.min(0.98, 0.55 + stormSpike * 0.43);
                    state.drivingBackward = true;
                    state.glitchIntensity = stormSpike * 0.65;
                }

                if (state.windGustTimer > 0) {
                    state.panelDustVisual = Math.max(0.05, state.panelDustVisual * 0.25);
                }

                if (act.id !== state.currentAct) {
                    state.currentAct = act.id;
                    if (act.id === 3) {
                        state.windGustTimer = 2.5;
                    }
                    if (state.sync3DTo2D && act.syncPart) {
                        select3DSubsystem(act.syncPart, false);
                    }
                }
            }


  // 5. CACHED DOM REFERENCES
  let dom = {};

  function cacheDom() {
    dom = {
      hudActBadge: document.getElementById('hudActBadge'),
      hudSol: document.getElementById('hudSol'),
      hudOdometer: document.getElementById('hudOdometer'),
      hudSolar: document.getElementById('hudSolar'),
      hudSolarBar: document.getElementById('hudSolarBar'),
      hudTau: document.getElementById('hudTau'),
      hudTauState: document.getElementById('hudTauState'),
      missionScrubber: document.getElementById('missionScrubber'),
      scrubberPct: document.getElementById('scrubberPct'),
      cinemaChapterHeader: document.getElementById('cinemaChapterHeader'),
      cinemaYearBadge: document.getElementById('cinemaYearBadge'),
      cinemaDriveModeBadge: document.getElementById('cinemaDriveModeBadge'),
      landmarkTitle: document.getElementById('landmarkTitle'),
      landmarkSub: document.getElementById('landmarkSub'),
      active2DHardwareText: document.getElementById('active2DHardwareText'),
      movieSubtitleText: document.getElementById('movieSubtitleText'),
      movieScienceNote: document.getElementById('movieScienceNote'),
      pancamStaticPip: document.getElementById('pancamStaticPip'),
      finaleOverlay: document.getElementById('finaleOverlay')
    };
  }

  
            function setHealthPillStyle(container, dot, statusLevel) {
                if (!container || !dot) return;
                if (statusLevel === 'ok') {
                    container.className = 'px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1';
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
                } else if (statusLevel === 'warn') {
                    container.className = 'px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1';
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse';
                } else {
                    container.className = 'px-2 py-0.5 rounded bg-red-950/70 border border-red-500/50 text-red-300 flex items-center gap-1';
                    dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-ping';
                }
            }

            function updateHUD() {
                const act = getActForKm(state.odometerKm);

                if (dom.hudActBadge) dom.hudActBadge.textContent = act.name;
                if (dom.hudSol) dom.hudSol.textContent = `SOL ${state.sol}`;
                if (dom.hudOdometer) dom.hudOdometer.textContent = `${state.odometerKm.toFixed(2)} km`;
                if (dom.hudSolar) dom.hudSolar.textContent = `${state.solarWh} Wh`;
                if (dom.hudSolarBar) {
                    const pct = Math.min(100, Math.max(3, (state.solarWh / 950) * 100));
                    dom.hudSolarBar.style.width = `${pct}%`;
                    dom.hudSolarBar.className = state.solarWh < 100
                        ? 'h-full bg-red-500 transition-all duration-150 animate-pulse'
                        : state.solarWh < 300
                            ? 'h-full bg-amber-500 transition-all duration-150'
                            : 'h-full bg-emerald-400 transition-all duration-150';
                }

                const tauPrefix = state.tau >= 10.75 ? '>10.8' : state.tau.toFixed(2);
                if (dom.hudTau) dom.hudTau.textContent = `τ = ${tauPrefix}`;
                if (dom.hudTauState) {
                    if (state.tau < 1.5) {
                        dom.hudTauState.textContent = 'CLEAR';
                        dom.hudTauState.className = 'text-[8px] font-mono-tech text-emerald-400';
                    } else if (state.tau < 4.5) {
                        dom.hudTauState.textContent = 'HAZY';
                        dom.hudTauState.className = 'text-[8px] font-mono-tech text-amber-400';
                    } else {
                        dom.hudTauState.textContent = 'STORM!';
                        dom.hudTauState.className = 'text-[8px] font-mono-tech text-red-400 font-bold animate-pulse';
                    }
                }

                if (dom.cinemaChapterHeader) dom.cinemaChapterHeader.textContent = act.fullTitle;
                if (dom.cinemaYearBadge) dom.cinemaYearBadge.textContent = act.dateStr;

                if (dom.cinemaDriveModeBadge) {
                    if (Math.abs(state.velocityKmPerSec) < 0.01) {
                        dom.cinemaDriveModeBadge.textContent = '■ PARKED / STANDBY';
                        dom.cinemaDriveModeBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-mono-tech text-slate-400';
                    } else if (state.drivingBackward) {
                        dom.cinemaDriveModeBadge.textContent = '◀ REV DRIVE';
                        dom.cinemaDriveModeBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-mono-tech text-sky-400 font-semibold';
                    } else {
                        dom.cinemaDriveModeBadge.textContent = '▶ FWD DRIVE';
                        dom.cinemaDriveModeBadge.className = 'px-2 py-0.5 rounded-full text-[9px] font-mono-tech text-emerald-400 font-semibold';
                    }
                }

                if (dom.active2DHardwareText) dom.active2DHardwareText.textContent = act.activeHardware;
                if (dom.landmarkTitle) dom.landmarkTitle.textContent = act.landmarkName;
                if (dom.landmarkSub) dom.landmarkSub.textContent = act.landmarkHint;
                if (dom.movieSubtitleText) dom.movieSubtitleText.textContent = act.subtitle;
                if (dom.movieScienceNote) dom.movieScienceNote.textContent = act.scienceNote;

                if (dom.missionScrubber) dom.missionScrubber.value = state.odometerKm;
                if (dom.scrubberPct) dom.scrubberPct.textContent = `${Math.round((state.odometerKm / 45.16) * 100)}%`;

                if (dom.pancamStaticPip) {
                    if (act.id === 6 && state.tau > 8.0) {
                        dom.pancamStaticPip.classList.remove('hidden');
                        dom.pancamStaticPip.classList.add('flex');
                    } else {
                        dom.pancamStaticPip.classList.add('hidden');
                        dom.pancamStaticPip.classList.remove('flex');
                    }
                }

                if (dom.finaleOverlay) {
                    if (state.odometerKm >= 45.15 && !state.finaleDismissed) {
                        state.finaleShown = true;
                        const btnAuto = document.getElementById('btnAutoCruise');
                        if (btnAuto) btnAuto.textContent = 'AUTO-DRIVE: OFF';
                        dom.finaleOverlay.classList.remove('hidden');
                        audioEngine.playFinaleChord();
                    } else if (state.odometerKm < 45.05) {
                        state.finaleDismissed = false;
                        if (state.finaleShown) {
                            state.finaleShown = false;
                            dom.finaleOverlay.classList.add('hidden');
                        }
                    }
                }
            }


  // 6. HYBRID 2.5D PERSPECTIVE STORY ENGINE (CANVAS)
  let storyCanvas, ctx2d, staticCanvas, staticCtx;
  const dustParticles = [];
  const sparkParticles = [];
  const sandSprayParticles = [];
  const stars = [];
  const rocks3D = [];

  function initParticles() {
    if (dustParticles.length > 0) return;
    for (let i = 0; i < 95; i++) {
      dustParticles.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.7 + Math.random() * 2.2,
        vx: -0.05 - Math.random() * 0.14,
        vy: (Math.random() - 0.5) * 0.02,
        alpha: 0.18 + Math.random() * 0.45
      });
    }
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: 0.5 + Math.random() * 1.3,
        twinkle: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 260; i++) {
      const rKm = (i * 0.18) + Math.sin(i * 7.3) * 0.06;
      const zLayer = (i % 3);
      rocks3D.push({
        km: rKm,
        zLayer,
        w: 9 + (i * 13 % 22),
        h: 6 + (i * 7 % 14),
        seed: i
      });
    }
  }

              // =========================================================================
            // 6. HYBRID 2.5D PERSPECTIVE STORY ENGINE (HTML5 CANVAS)
            // =========================================================================
            // storyCanvas bound in init
            // ctx2d bound in init
            // staticCanvas bound in init
            // staticCtx bound in init

            // dustParticles declared above
            // sparkParticles declared above
            // sandSprayParticles declared above
            // stars declared above
            // rocks3D declared above

            for (let i = 0; i < 95; i++) {
                dustParticles.push({
                    x: Math.random(),
                    y: Math.random(),
                    r: 0.7 + Math.random() * 2.2,
                    vx: -0.05 - Math.random() * 0.14,
                    vy: (Math.random() - 0.5) * 0.02,
                    alpha: 0.18 + Math.random() * 0.45
                });
            }
            for (let i = 0; i < 90; i++) {
                stars.push({
                    x: Math.random(),
                    y: Math.random() * 0.55,
                    r: 0.5 + Math.random() * 1.3,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
            // Pre-generate deterministic 3D-shaded Martian rocks across the 45.16 km traverse
            for (let i = 0; i < 260; i++) {
                const rKm = (i * 0.18) + Math.sin(i * 7.3) * 0.06;
                const zLayer = (i % 3); // 0 = background, 1 = midplane, 2 = foreground
                rocks3D.push({
                    km: rKm,
                    zLayer,
                    w: 9 + (i * 13 % 22),
                    h: 6 + (i * 7 % 14),
                    seed: i
                });
            }

            function resize2DCanvas() {
                const rect = storyCanvas.parentElement.getBoundingClientRect();
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                storyCanvas.width = Math.max(300, Math.floor(rect.width * dpr));
                storyCanvas.height = Math.max(200, Math.floor(rect.height * dpr));
            }

            function getTerrainElevation(worldKm) {
                let h = Math.sin(worldKm * 3.2) * 8 + Math.cos(worldKm * 7.5) * 4;
                if (worldKm < 0.9) {
                    const craterBowl = Math.exp(-Math.pow((worldKm - 0.25) / 0.38, 2)) * -24;
                    const outcropBump = Math.exp(-Math.pow((worldKm - 0.42) / 0.08, 2)) * 14;
                    h += craterBowl + outcropBump;
                }
                if (worldKm > 1.4 && worldKm < 3.2) {
                    h += Math.sin((worldKm - 1.4) * 3.5) * 26;
                }
                if (worldKm > 4.5 && worldKm < 6.1) {
                    h += Math.sin(worldKm * 28.0) * 10 + Math.exp(-Math.pow((worldKm - 5.2) / 0.35, 2)) * 15;
                }
                if (worldKm > 9.0 && worldKm < 13.0) {
                    const promontory = Math.exp(-Math.pow((worldKm - 10.3) / 0.65, 2)) * 44;
                    const craterDrop = Math.exp(-Math.pow((worldKm - 11.2) / 0.55, 2)) * -30;
                    h += promontory + craterDrop;
                }
                if (worldKm > 18.0 && worldKm < 29.5) {
                    h *= 0.35;
                }
                if (worldKm > 30.0 && worldKm < 35.5) {
                    h += Math.exp(-Math.pow((worldKm - 32.5) / 1.1, 2)) * 48;
                }
                if (worldKm > 37.5 && worldKm < 43.8) {
                    h += Math.sin((worldKm - 37.5) * 2.1) * 35 + Math.cos(worldKm * 11) * 5;
                }
                if (worldKm >= 43.8) {
                    const valleySlope = (worldKm - 43.8) * -26;
                    const rocks = Math.sin(worldKm * 19.0) * 5;
                    h += valleySlope + rocks;
                }
                return h;
            }

            function spawnSparks(x, y, count) {
                for (let i = 0; i < count; i++) {
                    const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
                    const speed = 40 + Math.random() * 110;
                    sparkParticles.push({
                        x,
                        y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 20,
                        life: 0.25 + Math.random() * 0.35,
                        color: Math.random() > 0.35 ? '#fbbf24' : '#38bdf8'
                    });
                }
            }

            function spawnSandSpray(x, y, dir) {
                for (let i = 0; i < 4; i++) {
                    sandSprayParticles.push({
                        x: x + (Math.random() - 0.5) * 14,
                        y: y - 2,
                        vx: -dir * (35 + Math.random() * 75) + (Math.random() - 0.5) * 25,
                        vy: -25 - Math.random() * 55,
                        r: 2 + Math.random() * 3.5,
                        life: 0.35 + Math.random() * 0.35
                    });
                }
            }

            // Helper to draw a high-detail 2.5D Perspective MER Wheel (matching NASA reference image_1e7cd9.jpg)
            function drawHybrid25DWheel(ctx, x, y, radius, spinAngle, dpr, isFarSide, isJammedRF) {
                ctx.save();
                ctx.translate(x, y);
                const depthWidth = 11 * dpr;

                // 1. 3D Cylindrical Tire Barrel (Depth extrusion)
                const barrelGrad = ctx.createLinearGradient(0, -radius, 0, radius);
                barrelGrad.addColorStop(0, isFarSide ? '#1c1917' : '#332d29');
                barrelGrad.addColorStop(0.5, isFarSide ? '#0c0a09' : '#1c1917');
                barrelGrad.addColorStop(1, '#090706');
                ctx.fillStyle = barrelGrad;
                ctx.beginPath();
                ctx.ellipse(-depthWidth * 0.5, 0, radius * 0.96, radius, 0, Math.PI * 0.5, Math.PI * 1.5);
                ctx.lineTo(depthWidth * 0.5, -radius);
                ctx.ellipse(depthWidth * 0.5, 0, radius * 0.96, radius, 0, -Math.PI * 0.5, Math.PI * 0.5);
                ctx.closePath();
                ctx.fill();

                // Horizontal Chevron Tread Ribs across the 3D barrel
                ctx.strokeStyle = isFarSide ? 'rgba(120, 113, 108, 0.25)' : 'rgba(214, 211, 209, 0.45)';
                ctx.lineWidth = 1.3 * dpr;
                for (let c = 0; c < 12; c++) {
                    const a = spinAngle + (c / 12) * Math.PI * 2;
                    const sinA = Math.sin(a);
                    const cosA = Math.cos(a);
                    if (cosA > -0.2) {
                        const ty = sinA * radius;
                        ctx.beginPath();
                        ctx.moveTo(-depthWidth * 0.48, ty);
                        ctx.lineTo(depthWidth * 0.48, ty);
                        ctx.stroke();
                    }
                }

                // 2. Front Wheel Face at +depthWidth * 0.5
                ctx.translate(depthWidth * 0.45, 0);

                // Outer metallic tire rim
                ctx.fillStyle = isFarSide ? '#18181b' : '#27272a';
                ctx.strokeStyle = isFarSide ? '#52525b' : '#a1a1aa';
                ctx.lineWidth = 2.2 * dpr;
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * 0.94, radius, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Iconic Copper/Orange Inner Rim Ring (from NASA render image_1e7cd9.jpg!)
                ctx.strokeStyle = isJammedRF ? '#ef4444' : (isFarSide ? '#9a3412' : '#ea580c');
                ctx.lineWidth = 2.6 * dpr;
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * 0.74, radius * 0.78, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Deep Concave Brushed Aluminum Inner Dish
                const dishGrad = ctx.createRadialGradient(-2 * dpr, -2 * dpr, 1 * dpr, 0, 0, radius * 0.7);
                dishGrad.addColorStop(0, isFarSide ? '#52525b' : '#e4e4e7');
                dishGrad.addColorStop(0.65, isFarSide ? '#3f3f46' : '#71717a');
                dishGrad.addColorStop(1, '#18181b');
                ctx.fillStyle = dishGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * 0.66, radius * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Rotating Spiral Titanium Shock-Absorbing Flexures inside hub
                ctx.save();
                ctx.rotate(spinAngle);
                ctx.strokeStyle = isFarSide ? '#27272a' : '#3f3f46';
                ctx.lineWidth = 2 * dpr;
                for (let s = 0; s < 4; s++) {
                    const sa = (s / 4) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(Math.cos(sa) * radius * 0.25, Math.sin(sa) * radius * 0.25, radius * 0.32, sa, sa + Math.PI * 0.85);
                    ctx.stroke();
                }
                ctx.restore();

                // Center machined axle cap
                ctx.fillStyle = isJammedRF ? '#ef4444' : '#d4d4d8';
                ctx.beginPath();
                ctx.arc(0, 0, 3.8 * dpr, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // Helper to draw perforated silver/titanium Rocker-Bogie struts with lightening holes (matching image_1e7ca2.jpg)
            function drawPerforatedStrut(ctx, x1, y1, x2, y2, width, dpr, isFarSide) {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.hypot(dx, dy);
                const ang = Math.atan2(dy, dx);

                ctx.save();
                ctx.translate(x1, y1);
                ctx.rotate(ang);

                // Metallic box-beam body
                const grad = ctx.createLinearGradient(0, -width * 0.5, 0, width * 0.5);
                grad.addColorStop(0, isFarSide ? '#475569' : '#e2e8f0');
                grad.addColorStop(0.5, isFarSide ? '#334155' : '#94a3b8');
                grad.addColorStop(1, isFarSide ? '#1e293b' : '#475569');
                ctx.fillStyle = grad;
                ctx.strokeStyle = isFarSide ? '#1e293b' : '#cbd5e1';
                ctx.lineWidth = 0.9 * dpr;

                ctx.beginPath();
                ctx.roundRect(0, -width * 0.5, len, width, 2 * dpr);
                ctx.fill();
                ctx.stroke();

                // Machined circular lightening holes along strut
                const holeSpacing = 7.5 * dpr;
                const holeCount = Math.floor((len - 10 * dpr) / holeSpacing);
                ctx.fillStyle = '#0f172a';
                for (let i = 1; i <= holeCount; i++) {
                    ctx.beginPath();
                    ctx.arc(i * holeSpacing, 0, width * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            // Helper to draw elevated floating Holographic Landmark Callout Pin (Never collides with rover!)
            function drawFloatingWaypointPin(ctx, screenX, groundY, labelText, subText, colorHex, dpr) {
                const pinTopY = groundY - 122 * dpr;
                ctx.save();

                // Vertical laser leader line to ground
                const lineGrad = ctx.createLinearGradient(screenX, pinTopY, screenX, groundY);
                lineGrad.addColorStop(0, colorHex);
                lineGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
                ctx.strokeStyle = lineGrad;
                ctx.lineWidth = 1.5 * dpr;
                ctx.setLineDash([4 * dpr, 4 * dpr]);
                ctx.beginPath();
                ctx.moveTo(screenX, pinTopY + 12 * dpr);
                ctx.lineTo(screenX, groundY - 6 * dpr);
                ctx.stroke();
                ctx.setLineDash([]);

                // Ground target ring
                ctx.strokeStyle = colorHex;
                ctx.beginPath();
                ctx.ellipse(screenX, groundY - 4 * dpr, 14 * dpr, 4 * dpr, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Floating pill badge high in the sky
                ctx.font = `bold ${9.5 * dpr}px "JetBrains Mono", monospace`;
                const textW = Math.max(ctx.measureText(labelText).width, ctx.measureText(subText).width) + 20 * dpr;
                const boxH = 28 * dpr;
                ctx.fillStyle = 'rgba(10, 8, 7, 0.82)';
                ctx.strokeStyle = colorHex;
                ctx.lineWidth = 1.2 * dpr;
                ctx.beginPath();
                ctx.roundRect(screenX - textW * 0.5, pinTopY - boxH * 0.5, textW, boxH, 6 * dpr);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = colorHex;
                ctx.textAlign = 'center';
                ctx.fillText(labelText, screenX, pinTopY - 2 * dpr);
                ctx.fillStyle = '#cbd5e1';
                ctx.font = `${8 * dpr}px "JetBrains Mono", monospace`;
                ctx.fillText(subText, screenX, pinTopY + 9 * dpr);

                ctx.restore();
            }

            function render2DStory(dt, timeSec) {

                if (storyCanvas && storyCanvas.parentElement) {
                    const rect = storyCanvas.parentElement.getBoundingClientRect();
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    const targetW = Math.max(300, Math.floor(rect.width * dpr));
                    const targetH = Math.max(200, Math.floor(rect.height * dpr));
                    if (storyCanvas.width !== targetW || storyCanvas.height !== targetH) {
                        storyCanvas.width = targetW;
                        storyCanvas.height = targetH;
                    }
                }

                const W = storyCanvas.width;
                const H = storyCanvas.height;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                ctx2d.save();

                const act = getActForKm(state.odometerKm);
                const km = state.odometerKm;

                // 1. Authentic Butterscotch/Amber Martian Atmospheric Sky Gradient (matching NASA JPL reference images)
                const stormDarken = Math.max(0, Math.min(0.92, (state.tau - 1.0) / 9.8));
                const topR = Math.round(act.skyTop[0] * (1 - stormDarken * 0.85));
                const topG = Math.round(act.skyTop[1] * (1 - stormDarken * 0.85));
                const topB = Math.round(act.skyTop[2] * (1 - stormDarken * 0.85));
                const midR = Math.round(act.skyMid[0] * (1 - stormDarken * 0.80));
                const midG = Math.round(act.skyMid[1] * (1 - stormDarken * 0.82));
                const midB = Math.round(act.skyMid[2] * (1 - stormDarken * 0.85));
                const botR = Math.round(act.skyBottom[0] * (1 - stormDarken * 0.78));
                const botG = Math.round(act.skyBottom[1] * (1 - stormDarken * 0.82));
                const botB = Math.round(act.skyBottom[2] * (1 - stormDarken * 0.85));

                const horizonY = H * 0.58;
                const skyGrad = ctx2d.createLinearGradient(0, 0, 0, horizonY);
                skyGrad.addColorStop(0, `rgb(${topR},${topG},${topB})`);
                skyGrad.addColorStop(0.55, `rgb(${midR},${midG},${midB})`);
                skyGrad.addColorStop(1, `rgb(${botR},${botG},${botB})`);
                ctx2d.fillStyle = skyGrad;
                ctx2d.fillRect(0, 0, W, H);

                // 2. Stars in twilight acts (Act IV & V)
                if ((act.id === 4 || act.id === 5) && state.tau < 2.5) {
                    ctx2d.fillStyle = '#ffffff';
                    stars.forEach((s) => {
                        const alpha = (0.3 + 0.5 * Math.sin(timeSec * 2.0 + s.twinkle)) * (1 - (state.tau - 0.5) * 0.4);
                        if (alpha > 0.05) {
                            ctx2d.globalAlpha = alpha;
                            ctx2d.beginPath();
                            ctx2d.arc(s.x * W, s.y * horizonY, s.r * dpr, 0, Math.PI * 2);
                            ctx2d.fill();
                        }
                    });
                    ctx2d.globalAlpha = 1;
                }

                // 3. Volumetric Martian Sun & Atmospheric Mie Scattering Halo
                const sunVisibility = Math.max(0, 1 - state.tau / 8.5);
                const sunX = W * 0.75;
                const sunY = H * 0.22 + (act.id === 6 ? (km - 44.0) * 35 * dpr : 0);
                if (sunVisibility > 0.01) {
                    const sunGlow = ctx2d.createRadialGradient(sunX, sunY, 3 * dpr, sunX, sunY, 130 * dpr);
                    sunGlow.addColorStop(0, `rgba(255, 250, 235, ${sunVisibility})`);
                    sunGlow.addColorStop(0.18, `rgba(255, 210, 150, ${sunVisibility * 0.75})`);
                    sunGlow.addColorStop(0.5, `rgba(235, 145, 80, ${sunVisibility * 0.32})`);
                    sunGlow.addColorStop(1, 'rgba(210, 110, 55, 0)');
                    ctx2d.fillStyle = sunGlow;
                    ctx2d.beginPath();
                    ctx2d.arc(sunX, sunY, 130 * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                }

                // 4. Multi-Layer 2.5D Parallax Mountain & Crater Ridges
                // Layer A: Far Distant Mountains (0.18x parallax)
                ctx2d.fillStyle = `rgb(${Math.max(20, botR - 42)}, ${Math.max(12, botG - 32)}, ${Math.max(8, botB - 24)})`;
                ctx2d.beginPath();
                ctx2d.moveTo(0, H);
                for (let sx = 0; sx <= W; sx += 16 * dpr) {
                    const dKm = km * 0.18 + (sx / W) * 3.0;
                    const elev = Math.sin(dKm * 1.6) * 32 * dpr + Math.cos(dKm * 3.7) * 14 * dpr;
                    ctx2d.lineTo(sx, horizonY - 24 * dpr - elev);
                }
                ctx2d.lineTo(W, H);
                ctx2d.closePath();
                ctx2d.fill();

                // Layer B: Mid-Distance Mesa & Crater Rim (0.45x parallax)
                ctx2d.fillStyle = act.groundFar;
                ctx2d.beginPath();
                ctx2d.moveTo(0, H);
                for (let sx = 0; sx <= W; sx += 12 * dpr) {
                    const mKm = km * 0.45 + (sx / W) * 2.0;
                    const elev = Math.sin(mKm * 2.5) * 18 * dpr + Math.cos(mKm * 6.1) * 8 * dpr;
                    ctx2d.lineTo(sx, horizonY + 12 * dpr - elev);
                }
                ctx2d.lineTo(W, H);
                ctx2d.closePath();
                ctx2d.fill();

                // Coordinate conversion for Primary 2.5D Rover Traverse Plane
                const viewSpanKm = 1.15;
                const roverScreenX = W * 0.42;
                const baseGroundY = H * 0.72;
                const kmPerPx = viewSpanKm / W;
                const pxPerKm = W / viewSpanKm;

                function screenXToKm(sx) {
                    return km + (sx - roverScreenX) * kmPerPx;
                }
                function kmToScreenX(worldKm) {
                    return roverScreenX + (worldKm - km) * pxPerKm;
                }
                function getScreenGroundY(sx) {
                    const wKm = screenXToKm(sx);
                    return baseGroundY - getTerrainElevation(wKm) * dpr;
                }

                // 5. Draw 2.5D Receding Terrain Plane with Perspective Strata & Shadows
                const terrGrad = ctx2d.createLinearGradient(0, horizonY + 10 * dpr, 0, H);
                terrGrad.addColorStop(0, act.groundMid);
                terrGrad.addColorStop(0.45, act.groundNear);
                terrGrad.addColorStop(1, '#260d06');

                ctx2d.fillStyle = terrGrad;
                ctx2d.beginPath();
                ctx2d.moveTo(0, H);
                for (let sx = 0; sx <= W; sx += 8 * dpr) {
                    ctx2d.lineTo(sx, getScreenGroundY(sx) - 14 * dpr); // Far edge of rover path
                }
                ctx2d.lineTo(W, H);
                ctx2d.closePath();
                ctx2d.fill();

                // 5b. Rover Dual Wheel Track Ruts Left Behind on the Martian Surface!
                ctx2d.strokeStyle = 'rgba(45, 16, 6, 0.55)';
                ctx2d.lineWidth = 3.5 * dpr;
                [-7 * dpr, 9 * dpr].forEach((zTrackOffset) => {
                    ctx2d.beginPath();
                    let started = false;
                    for (let sx = 0; sx <= roverScreenX + 50 * dpr; sx += 10 * dpr) {
                        const wKm = screenXToKm(sx);
                        if (wKm >= 0 && wKm <= km + 0.03) {
                            const gy = getScreenGroundY(sx) + zTrackOffset;
                            if (!started) {
                                ctx2d.moveTo(sx, gy);
                                started = true;
                            } else {
                                ctx2d.lineTo(sx, gy);
                            }
                        }
                    }
                    ctx2d.stroke();
                });

                // 5c. Render 3D-Shaded Martian Boulders & Regolith Rocks (Background & Midplane)
                rocks3D.forEach((rk) => {
                    if (rk.zLayer === 2) return; // Draw foreground rocks after rover
                    const rx = kmToScreenX(rk.km);
                    if (rx < -60 * dpr || rx > W + 60 * dpr) return;
                    const ry = getScreenGroundY(rx) + (rk.zLayer === 0 ? -12 * dpr : -3 * dpr);
                    const scale = rk.zLayer === 0 ? 0.65 : 0.9;
                    const rw = rk.w * scale * dpr;
                    const rh = rk.h * scale * dpr;

                    ctx2d.save();
                    ctx2d.translate(rx, ry);
                    // Ground shadow
                    ctx2d.fillStyle = 'rgba(15, 5, 2, 0.45)';
                    ctx2d.beginPath();
                    ctx2d.ellipse(3 * dpr, 2 * dpr, rw * 0.65, rh * 0.22, 0, 0, Math.PI * 2);
                    ctx2d.fill();

                    // 3D faceted rock polygon
                    const rGrad = ctx2d.createLinearGradient(-rw * 0.5, -rh, rw * 0.5, 0);
                    rGrad.addColorStop(0, '#a85834');
                    rGrad.addColorStop(0.55, '#5c2410');
                    rGrad.addColorStop(1, '#290e05');
                    ctx2d.fillStyle = rGrad;
                    ctx2d.beginPath();
                    ctx2d.moveTo(-rw * 0.55, 0);
                    ctx2d.lineTo(-rw * 0.38, -rh * 0.85);
                    ctx2d.lineTo(rw * 0.12, -rh);
                    ctx2d.lineTo(rw * 0.52, -rh * 0.45);
                    ctx2d.lineTo(rw * 0.45, 2 * dpr);
                    ctx2d.closePath();
                    ctx2d.fill();
                    ctx2d.restore();
                });

                // 6. Render 3D-Shaded Geological Landmarks & Elevated Non-Colliding Callout Pins
                // 6a. Act I: Airbag Lander (0.05 km)
                const landerX = kmToScreenX(0.05);
                if (landerX > -250 * dpr && landerX < W + 250 * dpr) {
                    const ly = getScreenGroundY(landerX) - 6 * dpr;
                    ctx2d.save();
                    ctx2d.translate(landerX, ly);
                    ctx2d.fillStyle = '#92400e';
                    for (let i = -3; i <= 3; i++) {
                        ctx2d.beginPath();
                        ctx2d.ellipse(i * 16 * dpr, 2 * dpr, 15 * dpr, 6.5 * dpr, 0, 0, Math.PI * 2);
                        ctx2d.fill();
                    }
                    ctx2d.fillStyle = '#cbd5e1';
                    ctx2d.beginPath();
                    ctx2d.moveTo(-52 * dpr, 0);
                    ctx2d.lineTo(-26 * dpr, -10 * dpr);
                    ctx2d.lineTo(26 * dpr, -10 * dpr);
                    ctx2d.lineTo(52 * dpr, 0);
                    ctx2d.closePath();
                    ctx2d.fill();
                    ctx2d.restore();
                    drawFloatingWaypointPin(ctx2d, landerX, ly, 'EAGLE CRATER LANDER', '0.00 KM · SOL 1 TOUCHDOWN', '#f59e0b', dpr);
                }

                // 6b. Act I: Eagle Crater Outcrop & Hematite "Blueberries" (0.42 km)
                const eagleOutcropX = kmToScreenX(0.42);
                if (eagleOutcropX > -220 * dpr && eagleOutcropX < W + 220 * dpr) {
                    const oy = getScreenGroundY(eagleOutcropX);
                    ctx2d.save();
                    ctx2d.translate(eagleOutcropX, oy);
                    const outGrad = ctx2d.createLinearGradient(-45 * dpr, -26 * dpr, 45 * dpr, 8 * dpr);
                    outGrad.addColorStop(0, '#b45309');
                    outGrad.addColorStop(0.5, '#7c2d12');
                    outGrad.addColorStop(1, '#3b1106');
                    ctx2d.fillStyle = outGrad;
                    ctx2d.beginPath();
                    ctx2d.moveTo(-50 * dpr, 6 * dpr);
                    ctx2d.lineTo(-35 * dpr, -22 * dpr);
                    ctx2d.lineTo(18 * dpr, -25 * dpr);
                    ctx2d.lineTo(52 * dpr, 6 * dpr);
                    ctx2d.closePath();
                    ctx2d.fill();
                    // Glowing Hematite "Blueberries"
                    [[-20, -10], [-7, -15], [6, -12], [19, -9], [-2, -6], [14, -18]].forEach(([bx, by]) => {
                        ctx2d.fillStyle = '#38bdf8';
                        ctx2d.beginPath();
                        ctx2d.arc(bx * dpr, by * dpr, 3 * dpr, 0, Math.PI * 2);
                        ctx2d.fill();
                    });
                    ctx2d.restore();
                    drawFloatingWaypointPin(ctx2d, eagleOutcropX, oy, 'HEMATITE "BLUEBERRIES"', '0.42 KM · ANCIENT WATER BEDROCK', '#38bdf8', dpr);
                }

                // 6c. Act II: Heat Shield Rock Meteorite (3.60 km) & Purgatory Dune (5.20 km)
                const shieldX = kmToScreenX(3.60);
                if (shieldX > -220 * dpr && shieldX < W + 220 * dpr) {
                    const sy = getScreenGroundY(shieldX);
                    ctx2d.save();
                    ctx2d.translate(shieldX, sy);
                    const metGrad = ctx2d.createRadialGradient(0, -10 * dpr, 2 * dpr, 4 * dpr, -8 * dpr, 18 * dpr);
                    metGrad.addColorStop(0, '#f1f5f9');
                    metGrad.addColorStop(0.55, '#64748b');
                    metGrad.addColorStop(1, '#1e293b');
                    ctx2d.fillStyle = metGrad;
                    ctx2d.beginPath();
                    ctx2d.ellipse(0, -8 * dpr, 17 * dpr, 12 * dpr, -0.15, 0, Math.PI * 2);
                    ctx2d.fill();
                    ctx2d.restore();
                    drawFloatingWaypointPin(ctx2d, shieldX, sy, 'HEAT SHIELD ROCK', '3.60 KM · FE-NI METEORITE', '#fbbf24', dpr);
                }

                const purgatoryX = kmToScreenX(5.20);
                if (purgatoryX > -250 * dpr && purgatoryX < W + 250 * dpr) {
                    const py = getScreenGroundY(purgatoryX);
                    drawFloatingWaypointPin(ctx2d, purgatoryX, py, '⚠ PURGATORY DUNE TRAP', '5.20 KM · SOL 446 SAND RIPPLE', '#ef4444', dpr);
                }

                // 6d. Act III: Victoria Crater Promontory (10.30 km)
                const victoriaX = kmToScreenX(10.30);
                if (victoriaX > -260 * dpr && victoriaX < W + 260 * dpr) {
                    const vy = getScreenGroundY(victoriaX);
                    drawFloatingWaypointPin(ctx2d, victoriaX, vy, 'VICTORIA CRATER // CAPE VERDE', '10.30 KM · 2007 DUST STORM', '#f59e0b', dpr);
                }

                // 6e. Act IV: Spirit Silent Memorial (22.00 km) & Endeavour Homestake Vein (32.50 km)
                const spiritX = kmToScreenX(22.00);
                if (spiritX > -280 * dpr && spiritX < W + 280 * dpr) {
                    const spy = getScreenGroundY(spiritX);
                    drawFloatingWaypointPin(ctx2d, spiritX, spy, '📡 TWIN SPIRIT (MER-A) SILENT', '22.00 KM · MARCH 2010', '#38bdf8', dpr);
                }

                const endeavourX = kmToScreenX(32.50);
                if (endeavourX > -260 * dpr && endeavourX < W + 260 * dpr) {
                    const ey = getScreenGroundY(endeavourX);
                    ctx2d.save();
                    ctx2d.translate(endeavourX, ey);
                    ctx2d.strokeStyle = '#f8fafc';
                    ctx2d.lineWidth = 4 * dpr;
                    ctx2d.beginPath();
                    ctx2d.moveTo(-30 * dpr, 6 * dpr);
                    ctx2d.lineTo(-10 * dpr, -8 * dpr);
                    ctx2d.lineTo(18 * dpr, -5 * dpr);
                    ctx2d.lineTo(35 * dpr, 4 * dpr);
                    ctx2d.stroke();
                    ctx2d.restore();
                    drawFloatingWaypointPin(ctx2d, endeavourX, ey, 'ENDEAVOUR // HOMESTAKE GYPSUM', '32.50 KM · NEUTRAL WATER CLAYS', '#38bdf8', dpr);
                }

                // 6f. Act V: First Martian Marathon (42.195 km) & Act VI: Perseverance Valley (45.16 km)
                const marathonX = kmToScreenX(42.195);
                if (marathonX > -260 * dpr && marathonX < W + 260 * dpr) {
                    const my = getScreenGroundY(marathonX);
                    drawFloatingWaypointPin(ctx2d, marathonX, my, '🏁 FIRST MARTIAN MARATHON', '42.195 KM · SOL 3968 RECORD', '#f59e0b', dpr);
                }

                const finalX = kmToScreenX(45.16);
                if (finalX > -240 * dpr && finalX < W + 240 * dpr) {
                    const fy = getScreenGroundY(finalX);
                    drawFloatingWaypointPin(ctx2d, finalX, fy, 'SOL 5111 FINAL RESTING SITE', '45.16 KM · PERSEVERANCE VALLEY', '#ef4444', dpr);
                }

                // =========================================================================
                // 7. RENDER HYBRID 2.5D PERSPECTIVE OPPORTUNITY ROVER (6 WHEELS, 3D DEPTH!)
                // =========================================================================
                const dir = state.drivingBackward ? -1 : 1;
                const wheelSpacing = 48 * dpr;
                const wheelRadius = 15.5 * dpr;

                const wRearX = roverScreenX - dir * wheelSpacing;
                const wMidX = roverScreenX;
                const wFrontX = roverScreenX + dir * wheelSpacing;

                const inPurgatoryDune = km >= 4.80 && km <= 5.65;
                const sinkPx = inPurgatoryDune ? Math.sin(((km - 4.80) / 0.85) * Math.PI) * 11 * dpr : 0;

                // Near-side (Foreground) Wheel Coordinates
                const wRearY = getScreenGroundY(wRearX) - wheelRadius + sinkPx + 5 * dpr;
                const wMidY = getScreenGroundY(wMidX) - wheelRadius + sinkPx + 5 * dpr;
                const wFrontY = getScreenGroundY(wFrontX) - wheelRadius + sinkPx + 5 * dpr;

                // Far-side (2.5D Z-Depth Offset) Wheel Coordinates
                const farOffsetX = -16 * dpr;
                const farOffsetY = -12 * dpr;
                const farRearX = wRearX + farOffsetX;
                const farMidX = wMidX + farOffsetX;
                const farFrontX = wFrontX + farOffsetX;
                const farRearY = wRearY + farOffsetY;
                const farMidY = wMidY + farOffsetY;
                const farFrontY = wFrontY + farOffsetY;

                const bogiePivotX = (wRearX + wMidX) * 0.5;
                const bogiePivotY = Math.min(wRearY, wMidY) - 19 * dpr;
                const farBogiePivotX = bogiePivotX + farOffsetX;
                const farBogiePivotY = bogiePivotY + farOffsetY;

                const chassisPivotX = roverScreenX;
                const avgWheelY = (wRearY + wMidY + wFrontY) / 3;
                const chassisPivotY = avgWheelY - 38 * dpr;
                const chassisPitch = Math.atan2(wFrontY - wRearY, wFrontX - wRearX) * 0.55;

                if (inPurgatoryDune && Math.abs(state.velocityKmPerSec) > 0.01) {
                    spawnSandSpray(wFrontX, wFrontY + wheelRadius, 1);
                    spawnSandSpray(wMidX, wMidY + wheelRadius, 1);
                    spawnSandSpray(wRearX, wRearY + wheelRadius, 1);
                }

                // 7A. Ground Shadow Cast by the 3D Rover Hull & Solar Wings
                ctx2d.fillStyle = 'rgba(12, 4, 2, 0.55)';
                ctx2d.beginPath();
                ctx2d.ellipse(roverScreenX - 4 * dpr, avgWheelY + wheelRadius - 2 * dpr, 76 * dpr, 13 * dpr, 0, 0, Math.PI * 2);
                ctx2d.fill();

                // 7B. FAR-SIDE (LEFT/BACKGROUND) ROCKER-BOGIE LINKAGES & 3 FAR WHEELS (Gives true 2.5D depth!)
                drawPerforatedStrut(ctx2d, farRearX, farRearY, farBogiePivotX, farBogiePivotY, 4.5 * dpr, dpr, true);
                drawPerforatedStrut(ctx2d, farBogiePivotX, farBogiePivotY, farMidX, farMidY, 4.5 * dpr, dpr, true);
                drawPerforatedStrut(ctx2d, farBogiePivotX, farBogiePivotY, chassisPivotX + farOffsetX, chassisPivotY + farOffsetY + 6 * dpr, 5.5 * dpr, dpr, true);
                drawPerforatedStrut(ctx2d, chassisPivotX + farOffsetX, chassisPivotY + farOffsetY + 6 * dpr, farFrontX, farFrontY, 5.5 * dpr, dpr, true);

                drawHybrid25DWheel(ctx2d, farRearX, farRearY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);
                drawHybrid25DWheel(ctx2d, farMidX, farMidY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);
                drawHybrid25DWheel(ctx2d, farFrontX, farFrontY, wheelRadius * 0.9, state.wheelSpinPhase, dpr, true, false);

                // 7C. ROVER 2.5D CHASSIS (WEB Gold Kapton Hull, 7-Panel Perspective Solar Wings, Mast, HGA, Arm)
                ctx2d.save();
                ctx2d.translate(chassisPivotX, chassisPivotY);
                ctx2d.rotate(chassisPitch);
                ctx2d.scale(dir, 1);

                // 1. Far-Side Solar Wing Panel (Perspective Depth Wing behind Mast)
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

                // 2. Warm Electronics Box (WEB) 3D Multi-Faceted Crinkled Gold Kapton Hull
                // Side face (bright gold Kapton)
                const webSideGrad = ctx2d.createLinearGradient(-38 * dpr, -14 * dpr, 38 * dpr, 14 * dpr);
                webSideGrad.addColorStop(0, '#d97706');
                webSideGrad.addColorStop(0.35, '#fbbf24');
                webSideGrad.addColorStop(0.7, '#b45309');
                webSideGrad.addColorStop(1, '#78350f');
                ctx2d.fillStyle = webSideGrad;
                ctx2d.strokeStyle = '#fde68a';
                ctx2d.lineWidth = 1.2 * dpr;
                ctx2d.beginPath();
                ctx2d.moveTo(-38 * dpr, -13 * dpr);
                ctx2d.lineTo(26 * dpr, -13 * dpr);
                ctx2d.lineTo(22 * dpr, 13 * dpr);
                ctx2d.lineTo(-32 * dpr, 13 * dpr);
                ctx2d.closePath();
                ctx2d.fill();
                ctx2d.stroke();

                // Front Nose Angled Face (3D perspective front chest of WEB with Hazcams & copper harnesses)
                const webFrontGrad = ctx2d.createLinearGradient(24 * dpr, -13 * dpr, 46 * dpr, 13 * dpr);
                webFrontGrad.addColorStop(0, '#b45309');
                webFrontGrad.addColorStop(0.5, '#92400e');
                webFrontGrad.addColorStop(1, '#451a03');
                ctx2d.fillStyle = webFrontGrad;
                ctx2d.strokeStyle = '#f59e0b';
                ctx2d.beginPath();
                ctx2d.moveTo(26 * dpr, -13 * dpr);
                ctx2d.lineTo(44 * dpr, -10 * dpr);
                ctx2d.lineTo(36 * dpr, 11 * dpr);
                ctx2d.lineTo(22 * dpr, 13 * dpr);
                ctx2d.closePath();
                ctx2d.fill();
                ctx2d.stroke();

                // Silver machined aluminum structural ribs & crinkled foil texture on WEB
                ctx2d.strokeStyle = 'rgba(226, 232, 240, 0.55)';
                ctx2d.lineWidth = 1.5 * dpr;
                [-22, -4, 14].forEach((rx) => {
                    ctx2d.beginPath();
                    ctx2d.moveTo(rx * dpr, -13 * dpr);
                    ctx2d.lineTo((rx - 2) * dpr, 13 * dpr);
                    ctx2d.stroke();
                });

                // Front Hazcam Stereo Pair lenses mounted on the chest
                ctx2d.fillStyle = '#0f172a';
                ctx2d.strokeStyle = '#cbd5e1';
                ctx2d.lineWidth = 1 * dpr;
                ctx2d.fillRect(30 * dpr, -6 * dpr, 10 * dpr, 5 * dpr);
                ctx2d.strokeRect(30 * dpr, -6 * dpr, 10 * dpr, 5 * dpr);
                ctx2d.fillStyle = '#38bdf8';
                ctx2d.beginPath();
                ctx2d.arc(33 * dpr, -3.5 * dpr, 1.5 * dpr, 0, Math.PI * 2);
                ctx2d.arc(37.5 * dpr, -3.5 * dpr, 1.5 * dpr, 0, Math.PI * 2);
                ctx2d.fill();

                // 3. Near-Side & Center 2.5D Perspective Winged Solar Array Table (Matches image_1e7ca2.jpg!)
                ctx2d.save();
                ctx2d.beginPath();
                ctx2d.moveTo(-56 * dpr, -16 * dpr); // Rear tail panel
                ctx2d.lineTo(48 * dpr, -16 * dpr);  // Front nose edge
                ctx2d.lineTo(36 * dpr, -4 * dpr);   // Near-side wing front tip
                ctx2d.lineTo(-42 * dpr, -4 * dpr);  // Near-side wing rear tip
                ctx2d.closePath();

                // Photovoltaic cell color blended with Martian dust accumulation
                const cleanBlue = [24, 58, 138];
                const dustyRust = [165, 68, 32];
                const dMix = state.panelDustVisual * 0.85;
                const cellR = Math.round(cleanBlue[0] * (1 - dMix) + dustyRust[0] * dMix);
                const cellG = Math.round(cleanBlue[1] * (1 - dMix) + dustyRust[1] * dMix);
                const cellB = Math.round(cleanBlue[2] * (1 - dMix) + dustyRust[2] * dMix);

                ctx2d.fillStyle = `rgb(${cellR}, ${cellG}, ${cellB})`;
                ctx2d.fill();
                ctx2d.strokeStyle = '#e2e8f0';
                ctx2d.lineWidth = 1.6 * dpr;
                ctx2d.stroke();

                // Individual Solar Cell Grid Lines across the foreshortened wing
                ctx2d.strokeStyle = 'rgba(148, 163, 184, 0.38)';
                ctx2d.lineWidth = 0.8 * dpr;
                for (let sx = -44; sx <= 38; sx += 10) {
                    ctx2d.beginPath();
                    ctx2d.moveTo(sx * dpr, -16 * dpr);
                    ctx2d.lineTo((sx - 6) * dpr, -4 * dpr);
                    ctx2d.stroke();
                }
                ctx2d.beginPath();
                ctx2d.moveTo(-50 * dpr, -10 * dpr);
                ctx2d.lineTo(42 * dpr, -10 * dpr);
                ctx2d.stroke();
                ctx2d.restore();

                // Act VI Frost Crystals Creeping Across Deck
                if (act.id === 6 && km >= 44.3) {
                    const frostAlpha = Math.min(0.85, (km - 44.3) / 0.85);
                    ctx2d.strokeStyle = `rgba(186, 230, 253, ${frostAlpha})`;
                    ctx2d.lineWidth = 2 * dpr;
                    ctx2d.strokeRect(-42 * dpr, -15 * dpr, 82 * dpr, 12 * dpr);
                }

                // 4. High-Gain Antenna (Tan/Gold Oval Dish) & Lattice UHF Tower on Rear Deck (Matches image_1e7cd9.jpg & image_1e7ca2.jpg)
                ctx2d.save();
                ctx2d.translate(-18 * dpr, -17 * dpr);
                // Tall Lattice UHF Riser & Black Monopole
                ctx2d.fillStyle = '#64748b';
                ctx2d.fillRect(-16 * dpr, -14 * dpr, 5 * dpr, 14 * dpr);
                ctx2d.fillStyle = '#1e293b';
                ctx2d.fillRect(-15 * dpr, -38 * dpr, 3 * dpr, 24 * dpr);
                ctx2d.fillStyle = '#d97706';
                ctx2d.fillRect(-15.5 * dpr, -18 * dpr, 4 * dpr, 4 * dpr);

                // 2-Axis Gimbaled Tan/Gold High-Gain Dish
                const dishTilt = -0.35 + Math.sin(timeSec * 1.6) * 0.16;
                ctx2d.rotate(dishTilt);
                ctx2d.fillStyle = '#cbd5e1';
                ctx2d.fillRect(-2 * dpr, -10 * dpr, 4 * dpr, 10 * dpr);
                ctx2d.fillStyle = '#b45309';
                ctx2d.strokeStyle = '#fde68a';
                ctx2d.lineWidth = 1.4 * dpr;
                ctx2d.beginPath();
                ctx2d.ellipse(2 * dpr, -15 * dpr, 12 * dpr, 7 * dpr, -0.4, 0, Math.PI * 2);
                ctx2d.fill();
                ctx2d.stroke();

                if (act.id === 5 || state.antennaBeamTimer > 0) {
                    for (let b = 0; b < 3; b++) {
                        const beamOffset = ((timeSec * 85 + b * 28) % 85) * dpr;
                        const beamAlpha = Math.max(0, 1 - beamOffset / (85 * dpr));
                        ctx2d.strokeStyle = `rgba(56, 189, 248, ${beamAlpha * 0.85})`;
                        ctx2d.lineWidth = 2 * dpr;
                        ctx2d.beginPath();
                        ctx2d.arc(0, -18 * dpr - beamOffset, (8 + b * 5) * dpr, -Math.PI * 0.85, -Math.PI * 0.15);
                        ctx2d.stroke();
                    }
                }
                ctx2d.restore();

                // 5. High-Detail Pancam & Mini-TES Mast Assembly (Matches image_1e7cd9.jpg!)
                ctx2d.save();
                ctx2d.translate(22 * dpr, -15 * dpr);
                // Gold Kapton thermal collar at base of mast
                ctx2d.fillStyle = '#b45309';
                ctx2d.strokeStyle = '#fbbf24';
                ctx2d.lineWidth = 1 * dpr;
                ctx2d.fillRect(-5.5 * dpr, -16 * dpr, 11 * dpr, 9 * dpr);
                ctx2d.strokeRect(-5.5 * dpr, -16 * dpr, 11 * dpr, 9 * dpr);

                // Cream/White Cylindrical Mast Post with shaded 3D gradient
                const mastGrad = ctx2d.createLinearGradient(-4.5 * dpr, 0, 4.5 * dpr, 0);
                mastGrad.addColorStop(0, '#e2e8f0');
                mastGrad.addColorStop(0.5, '#ffffff');
                mastGrad.addColorStop(1, '#94a3b8');
                ctx2d.fillStyle = mastGrad;
                ctx2d.fillRect(-4.5 * dpr, -48 * dpr, 9 * dpr, 32 * dpr);
                ctx2d.fillRect(-4 * dpr, -7 * dpr, 8 * dpr, 7 * dpr);

                // External umbilical cable running down mast
                ctx2d.strokeStyle = '#78350f';
                ctx2d.lineWidth = 1.5 * dpr;
                ctx2d.beginPath();
                ctx2d.moveTo(-2 * dpr, -46 * dpr);
                ctx2d.bezierCurveTo(-6 * dpr, -32 * dpr, 4 * dpr, -22 * dpr, 0, -6 * dpr);
                ctx2d.stroke();

                // Articulated Pancam Head (Horizontal Cylinder + Top Rectangular Stereo Camera Bar)
                const isFinalSkyLook = act.id === 6 && km >= 44.85;
                const headPitch = isFinalSkyLook
                    ? -Math.PI * 0.48
                    : (state.scanActiveTimer > 0 ? 0.22 + Math.sin(timeSec * 3.0) * 0.16 : Math.sin(timeSec * 1.2) * 0.06);
                ctx2d.translate(0, -49 * dpr);
                ctx2d.rotate(headPitch);

                // Lower White Cylindrical Elevation Housing
                ctx2d.fillStyle = '#f1f5f9';
                ctx2d.strokeStyle = '#64748b';
                ctx2d.lineWidth = 1 * dpr;
                ctx2d.beginPath();
                ctx2d.roundRect(-9 * dpr, -4 * dpr, 20 * dpr, 7 * dpr, 3 * dpr);
                ctx2d.fill();
                ctx2d.stroke();

                // Upper Dark Gray Stereo Camera Bar (Navcams + Pancams)
                ctx2d.fillStyle = '#1e293b';
                ctx2d.strokeStyle = '#cbd5e1';
                ctx2d.fillRect(-10 * dpr, -11 * dpr, 22 * dpr, 7 * dpr);
                ctx2d.strokeRect(-10 * dpr, -11 * dpr, 22 * dpr, 7 * dpr);

                // Stereo Pancam & Navcam Baffle Lenses
                ctx2d.fillStyle = '#38bdf8';
                ctx2d.beginPath();
                ctx2d.arc(9 * dpr, -7.5 * dpr, 2.3 * dpr, 0, Math.PI * 2);
                ctx2d.arc(3 * dpr, -7.5 * dpr, 2.0 * dpr, 0, Math.PI * 2);
                ctx2d.fill();

                // Scan Frustum Cone
                if (state.scanActiveTimer > 0 || act.id === 4 || isFinalSkyLook) {
                    const coneGrad = ctx2d.createLinearGradient(10 * dpr, -7 * dpr, 135 * dpr, 28 * dpr);
                    coneGrad.addColorStop(0, isFinalSkyLook ? 'rgba(239, 68, 68, 0.42)' : 'rgba(56, 189, 248, 0.36)');
                    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
                    ctx2d.fillStyle = coneGrad;
                    ctx2d.beginPath();
                    ctx2d.moveTo(10 * dpr, -7 * dpr);
                    ctx2d.lineTo(135 * dpr, -28 * dpr);
                    ctx2d.lineTo(135 * dpr, 40 * dpr);
                    ctx2d.closePath();
                    ctx2d.fill();
                }
                ctx2d.restore();

                // 6. 5-DOF Robotic Arm (IDD) & Detailed 4-Instrument Turret
                ctx2d.save();
                ctx2d.translate(38 * dpr, 6 * dpr);

                if (km >= 2.5) {
                    const sparkPulse = 0.4 + 0.6 * Math.abs(Math.sin(timeSec * 8.0));
                    ctx2d.fillStyle = `rgba(239, 68, 68, ${sparkPulse})`;
                    ctx2d.beginPath();
                    ctx2d.arc(0, 0, 4.5 * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                }

                const deploy = state.armDeployProgress;
                const shoulderAngle = -0.35 + deploy * 0.82;
                const elbowAngle = 1.75 - deploy * 1.22;

                const elbowX = Math.cos(shoulderAngle) * 26 * dpr;
                const elbowY = Math.sin(shoulderAngle) * 26 * dpr;
                const wristX = elbowX + Math.cos(shoulderAngle + elbowAngle) * 24 * dpr;
                const wristY = elbowY + Math.sin(shoulderAngle + elbowAngle) * 24 * dpr;

                drawPerforatedStrut(ctx2d, 0, 0, elbowX, elbowY, 4.2 * dpr, dpr, false);
                drawPerforatedStrut(ctx2d, elbowX, elbowY, wristX, wristY, 3.8 * dpr, dpr, false);

                // Detailed 4-Instrument Turret (RAT, MI, Mössbauer, APXS)
                ctx2d.save();
                ctx2d.translate(wristX, wristY);
                ctx2d.rotate(deploy > 0.5 ? timeSec * 9.0 : 0.2);
                ctx2d.fillStyle = '#475569';
                ctx2d.strokeStyle = '#e2e8f0';
                ctx2d.lineWidth = 1.2 * dpr;
                ctx2d.beginPath();
                ctx2d.arc(0, 0, 7 * dpr, 0, Math.PI * 2);
                ctx2d.fill();
                ctx2d.stroke();
                // RAT grinding head + gold WTC aluminum cuff
                ctx2d.fillStyle = '#f59e0b';
                ctx2d.fillRect(-2.5 * dpr, -10 * dpr, 5 * dpr, 20 * dpr);
                ctx2d.fillStyle = '#38bdf8';
                ctx2d.beginPath();
                ctx2d.arc(0, 9 * dpr, 2.5 * dpr, 0, Math.PI * 2);
                ctx2d.fill();
                ctx2d.restore();

                if (deploy > 0.65) {
                    const beamAlpha = 0.45 + 0.35 * Math.sin(timeSec * 14);
                    ctx2d.strokeStyle = `rgba(56, 189, 248, ${beamAlpha})`;
                    ctx2d.lineWidth = 3 * dpr;
                    ctx2d.beginPath();
                    ctx2d.moveTo(wristX, wristY);
                    ctx2d.lineTo(wristX + 14 * dpr, wristY + 15 * dpr);
                    ctx2d.stroke();

                    if (Math.random() < 0.55) {
                        const worldSparkX = chassisPivotX + dir * (38 * dpr + wristX);
                        const worldSparkY = chassisPivotY + (6 * dpr + wristY);
                        spawnSparks(worldSparkX, worldSparkY, 2);
                    }
                }
                ctx2d.restore();
                ctx2d.restore(); // End Rover Chassis Body

                // 7D. NEAR-SIDE (FOREGROUND) PERFORATED ROCKER-BOGIE LINKAGES & STEERING CYLINDERS
                drawPerforatedStrut(ctx2d, wRearX, wRearY - 6 * dpr, bogiePivotX, bogiePivotY, 5.2 * dpr, dpr, false);
                drawPerforatedStrut(ctx2d, bogiePivotX, bogiePivotY, wMidX, wMidY - 6 * dpr, 5.2 * dpr, dpr, false);
                drawPerforatedStrut(ctx2d, bogiePivotX, bogiePivotY, chassisPivotX, chassisPivotY + 5 * dpr, 6.2 * dpr, dpr, false);
                drawPerforatedStrut(ctx2d, chassisPivotX, chassisPivotY + 5 * dpr, wFrontX, wFrontY - 6 * dpr, 6.2 * dpr, dpr, false);

                // Vertical Corner Steering Actuator Cylinders above Front & Rear Wheels
                [
                    [wRearX, wRearY],
                    [wFrontX, wFrontY]
                ].forEach(([sx, sy]) => {
                    ctx2d.fillStyle = '#cbd5e1';
                    ctx2d.strokeStyle = '#334155';
                    ctx2d.lineWidth = 1 * dpr;
                    ctx2d.fillRect(sx - 3 * dpr, sy - wheelRadius - 7 * dpr, 6 * dpr, 9 * dpr);
                    ctx2d.strokeRect(sx - 3 * dpr, sy - wheelRadius - 7 * dpr, 6 * dpr, 9 * dpr);
                });

                // Joint Pivot Caps
                [
                    [bogiePivotX, bogiePivotY],
                    [chassisPivotX, chassisPivotY + 5 * dpr]
                ].forEach(([px, py]) => {
                    ctx2d.fillStyle = '#e2e8f0';
                    ctx2d.strokeStyle = '#0f172a';
                    ctx2d.lineWidth = 1.5 * dpr;
                    ctx2d.beginPath();
                    ctx2d.arc(px, py, 4.2 * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                    ctx2d.stroke();
                });

                // 7E. NEAR-SIDE 3 FOREGROUND 2.5D CLEATED WHEELS
                drawHybrid25DWheel(ctx2d, wRearX, wRearY, wheelRadius, state.wheelSpinPhase, dpr, false, false);
                drawHybrid25DWheel(ctx2d, wMidX, wMidY, wheelRadius, state.wheelSpinPhase, dpr, false, false);
                drawHybrid25DWheel(ctx2d, wFrontX, wFrontY, wheelRadius, state.wheelSpinPhase, dpr, false, km >= 3.8);

                // 7F. Foreground Rocks (zLayer === 2) passing in front of the rover wheels for 2.5D depth
                rocks3D.forEach((rk) => {
                    if (rk.zLayer !== 2) return;
                    const rx = kmToScreenX(rk.km);
                    if (rx < -60 * dpr || rx > W + 60 * dpr) return;
                    const ry = getScreenGroundY(rx) + 18 * dpr;
                    const rw = rk.w * 1.15 * dpr;
                    const rh = rk.h * 1.15 * dpr;

                    ctx2d.save();
                    ctx2d.translate(rx, ry);
                    ctx2d.fillStyle = '#2d1006';
                    ctx2d.beginPath();
                    ctx2d.moveTo(-rw * 0.55, 0);
                    ctx2d.lineTo(-rw * 0.35, -rh * 0.88);
                    ctx2d.lineTo(rw * 0.18, -rh);
                    ctx2d.lineTo(rw * 0.5, -rh * 0.4);
                    ctx2d.lineTo(rw * 0.45, 2 * dpr);
                    ctx2d.closePath();
                    ctx2d.fill();
                    ctx2d.restore();
                });

                // 8. Particle Systems (Sand Spray, RAT Sparks, Wind Cleaning Gust, Atmospheric Dust)
                for (let i = sandSprayParticles.length - 1; i >= 0; i--) {
                    const p = sandSprayParticles[i];
                    p.x += p.vx * dt * dpr;
                    p.y += p.vy * dt * dpr;
                    p.vy += 140 * dt * dpr;
                    p.life -= dt;
                    if (p.life <= 0) {
                        sandSprayParticles.splice(i, 1);
                        continue;
                    }
                    ctx2d.fillStyle = `rgba(212, 113, 59, ${Math.min(1, p.life * 2.5)})`;
                    ctx2d.beginPath();
                    ctx2d.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                }

                for (let i = sparkParticles.length - 1; i >= 0; i--) {
                    const sp = sparkParticles[i];
                    sp.x += sp.vx * dt * dpr;
                    sp.y += sp.vy * dt * dpr;
                    sp.vy += 180 * dt * dpr;
                    sp.life -= dt;
                    if (sp.life <= 0) {
                        sparkParticles.splice(i, 1);
                        continue;
                    }
                    ctx2d.fillStyle = sp.color;
                    ctx2d.beginPath();
                    ctx2d.arc(sp.x, sp.y, 2.2 * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                }

                const stormSpeedMult = 1 + (state.tau / 3.5) + (state.windGustTimer > 0 ? 4.5 : 0);
                dustParticles.forEach((dp) => {
                    dp.x += dp.vx * dt * stormSpeedMult;
                    dp.y += dp.vy * dt * stormSpeedMult;
                    if (dp.x < 0) dp.x += 1;
                    if (dp.x > 1) dp.x -= 1;
                    if (dp.y < 0) dp.y += 1;
                    if (dp.y > 1) dp.y -= 1;

                    const dustAlpha = Math.min(0.85, dp.alpha * (0.32 + state.tau * 0.12 + (state.windGustTimer > 0 ? 0.45 : 0)));
                    ctx2d.fillStyle = state.windGustTimer > 0
                        ? `rgba(253, 224, 71, ${dustAlpha})`
                        : `rgba(225, 145, 92, ${dustAlpha})`;
                    ctx2d.beginPath();
                    ctx2d.arc(dp.x * W, dp.y * H, dp.r * dpr, 0, Math.PI * 2);
                    ctx2d.fill();
                });

                if (state.windGustTimer > 0) {
                    ctx2d.strokeStyle = `rgba(56, 189, 248, ${Math.min(0.65, state.windGustTimer * 0.4)})`;
                    ctx2d.lineWidth = 2 * dpr;
                    for (let wLine = 0; wLine < 6; wLine++) {
                        const wy = chassisPivotY - 35 * dpr + wLine * 10 * dpr;
                        const wx = ((timeSec * 700 + wLine * 110) % W);
                        ctx2d.beginPath();
                        ctx2d.moveTo(W - wx, wy);
                        ctx2d.lineTo(W - wx + 95 * dpr, wy - 6 * dpr);
                        ctx2d.stroke();
                    }
                }

                if (state.glitchIntensity > 0.05 && Math.random() < state.glitchIntensity * 0.35) {
                    const sliceY = Math.random() * H;
                    const sliceH = (6 + Math.random() * 24) * dpr;
                    ctx2d.fillStyle = 'rgba(56, 189, 248, 0.14)';
                    ctx2d.fillRect(0, sliceY, W, sliceH);
                    ctx2d.fillStyle = 'rgba(239, 68, 68, 0.12)';
                    ctx2d.fillRect(0, sliceY + 4 * dpr, W, sliceH * 0.5);
                }

                if (act.id === 6) {
                    const darkProgress = Math.max(0, Math.min(1, (km - 44.0) / 1.16));
                    const radGrad = ctx2d.createRadialGradient(roverScreenX, chassisPivotY, 45 * dpr, roverScreenX, chassisPivotY, W * 0.65);
                    radGrad.addColorStop(0, `rgba(10, 4, 2, ${darkProgress * 0.35})`);
                    radGrad.addColorStop(1, `rgba(2, 2, 4, ${darkProgress * 0.92})`);
                    ctx2d.fillStyle = radGrad;
                    ctx2d.fillRect(0, 0, W, H);
                }

                ctx2d.restore();

                if (act.id === 6 && km >= 44.6) {
                    const sw = staticCanvas.width;
                    const sh = staticCanvas.height;
                    const imgData = staticCtx.createImageData(sw, sh);
                    const buf = imgData.data;
                    for (let i = 0; i < buf.length; i += 4) {
                        const v = Math.random() < 0.88 ? Math.floor(Math.random() * 38) : Math.floor(140 + Math.random() * 115);
                        buf[i] = v;
                        buf[i + 1] = v;
                        buf[i + 2] = v;
                        buf[i + 3] = 255;
                    }
                    staticCtx.putImageData(imgData, 0, 0);
                }
            }

            // =========================================================================
            // 8. ULTRA-ACCURATE NASA MER-B 3D ROVER RECONSTRUCTION (THREE.JS r128)

  // 7. INTERACTIVE ACTION TRIGGERS
  function triggerScienceAction() {
    audioEngine.init();
    state.scanActiveTimer = 3.2;
    state.armTargetDeploy = 1.0;
    state.antennaBeamTimer = 2.5;
    audioEngine.playSpectrometerClick();
  }

  function triggerWindCleaningGust() {
    audioEngine.init();
    state.windGustTimer = 2.8;
    audioEngine.playWindWhoosh();
  }

  // 8. KEYBOARD & CONTROLS BINDING
  let listenersBound = false;

  function bindHoldButton(btnId, keyProp) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const startHold = (e) => {
      e.preventDefault();
      audioEngine.init();
      state.keys[keyProp] = true;
      state.autoCruise = false;
      const cBtn = document.getElementById('btnAutoCruise');
      if (cBtn) cBtn.textContent = 'AUTO-DRIVE: OFF';
    };
    const endHold = () => {
      state.keys[keyProp] = false;
    };
    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('touchstart', startHold, { passive: false });
    window.addEventListener('mouseup', endHold);
    window.addEventListener('touchend', endHold);
  }

  function setupControls() {
    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener('keydown', (e) => {
      if (!window.__experienceActive) return;
      audioEngine.init();
      const key = e.key.toLowerCase();
      if (key === 'd' || e.key === 'ArrowRight') {
        state.keys.right = true;
        state.autoCruise = false;
        const btn = document.getElementById('btnAutoCruise');
        if (btn) btn.textContent = 'AUTO-DRIVE: OFF';
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        state.keys.left = true;
        state.autoCruise = false;
        const btn = document.getElementById('btnAutoCruise');
        if (btn) btn.textContent = 'AUTO-DRIVE: OFF';
      } else if (key === 'e' || e.key === ' ') {
        triggerScienceAction();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!window.__experienceActive) return;
      const key = e.key.toLowerCase();
      if (key === 'd' || e.key === 'ArrowRight') {
        state.keys.right = false;
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        state.keys.left = false;
      }
    });

    bindHoldButton('btnDriveFwd', 'right');
    bindHoldButton('btnDriveBack', 'left');

    const btnAuto = document.getElementById('btnAutoCruise');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        audioEngine.init();
        state.autoCruise = !state.autoCruise;
        btnAuto.textContent = state.autoCruise ? 'AUTO-DRIVE: ON ▶' : 'AUTO-DRIVE: OFF';
        btnAuto.className = state.autoCruise
          ? 'px-2 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-[9px] font-mono text-emerald-200 font-semibold transition'
          : 'px-2 py-1 rounded-full bg-black/60 hover:bg-slate-800 text-[9px] font-mono text-slate-300 transition';
      });
    }

    const btnDeploy = document.getElementById('btnDeployInstrument');
    if (btnDeploy) btnDeploy.addEventListener('click', triggerScienceAction);

    const btnGust = document.getElementById('btnTriggerWindGust');
    if (btnGust) btnGust.addEventListener('click', triggerWindCleaningGust);

    const scrubber = document.getElementById('missionScrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        audioEngine.init();
        state.odometerKm = parseFloat(e.target.value);
        state.finaleDismissed = false;
        computeTelemetryFromKm(state.odometerKm);
        updateHUD();
      });
    }

    const btnReplay = document.getElementById('btnReplayMission');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        state.odometerKm = 0.0;
        state.finaleShown = false;
        state.finaleDismissed = false;
        if (dom.finaleOverlay) dom.finaleOverlay.classList.add('hidden');
        computeTelemetryFromKm(0);
        updateHUD();
      });
    }

    const btnFinalSong = document.getElementById('btnPlayFinalSong');
    if (btnFinalSong) {
      btnFinalSong.addEventListener('click', () => {
        audioEngine.init();
        state.audioEnabled = true;
        audioEngine.playFinaleChord();
      });
    }

    const btnDismiss = document.getElementById('btnDismissFinale');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => {
        state.finaleDismissed = true;
        if (dom.finaleOverlay) dom.finaleOverlay.classList.add('hidden');
      });
    }

    const btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        audioEngine.init();
        state.audioEnabled = !state.audioEnabled;
        btnAudio.textContent = state.audioEnabled ? '🔊 SFX: ON' : '🔇 SFX: MUTED';
      });
    }
  }

  // 9. REAL-TIME SIMULATION & ANIMATION LOOP
  let lastTime = performance.now();
  let animId = null;

  function animate(now) {
    if (!window.__experienceActive) return;
    animId = requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const timeSec = now / 1000;

    const driveInput = (state.keys.right || state.autoCruise ? 1 : 0) - (state.keys.left ? 1 : 0);
    const act = getActForKm(state.odometerKm);

    let baseSpeedKmPerSec = 1.65;
    if (act.id === 1) baseSpeedKmPerSec = 0.28;
    else if (act.id === 2) baseSpeedKmPerSec = 1.35;
    else if (act.id === 3) baseSpeedKmPerSec = 1.95;
    else if (act.id === 4) baseSpeedKmPerSec = 3.20;
    else if (act.id === 5) baseSpeedKmPerSec = 1.60;
    else if (act.id === 6) baseSpeedKmPerSec = 0.32;

    const inPurgatoryTrap = state.odometerKm >= 4.85 && state.odometerKm <= 5.55;
    const crawlMultiplier = inPurgatoryTrap ? 0.22 : 1.0;

    const targetVel = driveInput * baseSpeedKmPerSec * crawlMultiplier;
    state.velocityKmPerSec += (targetVel - state.velocityKmPerSec) * Math.min(1, dt * 10);

    if (Math.abs(state.velocityKmPerSec) > 0.002) {
      state.odometerKm = Math.max(0.0, Math.min(45.16, state.odometerKm + state.velocityKmPerSec * dt));
      const spinBoost = inPurgatoryTrap ? 5.5 : 1.4;
      state.wheelSpinPhase += driveInput * dt * 6.5 * spinBoost;
      computeTelemetryFromKm(state.odometerKm);
      updateHUD();
    } else if (act.id === 5 || act.id === 6) {
      computeTelemetryFromKm(state.odometerKm);
      updateHUD();
    }

    const distToLandmark = Math.abs(state.odometerKm - act.landmarkKm);
    const nearLandmark = distToLandmark < (act.id === 1 ? 0.12 : 0.45);
    if (nearLandmark && Math.abs(state.velocityKmPerSec) < 0.08) {
      state.armTargetDeploy = 1.0;
      state.scanActiveTimer = Math.max(state.scanActiveTimer, 0.25);
    } else if (state.scanActiveTimer <= 0) {
      state.armTargetDeploy = 0.0;
    }

    if (state.scanActiveTimer > 0) state.scanActiveTimer = Math.max(0, state.scanActiveTimer - dt);
    if (state.windGustTimer > 0) state.windGustTimer = Math.max(0, state.windGustTimer - dt);
    if (state.antennaBeamTimer > 0) state.antennaBeamTimer = Math.max(0, state.antennaBeamTimer - dt);
    state.armDeployProgress += (state.armTargetDeploy - state.armDeployProgress) * Math.min(1, dt * 6.0);

    audioEngine.update(dt);
    try { if (typeof render2DStory === 'function') render2DStory(dt, timeSec); } catch (e) { console.error('render2DStory error:', e); }
  }

  // 10. PUBLIC MODULE INTERFACE
  window.startMissionExperience = function () {
    window.__experienceActive = true;
    storyCanvas = document.getElementById('storyCanvas');
    if (!storyCanvas) return;
    ctx2d = storyCanvas.getContext('2d');
    staticCanvas = document.getElementById('staticNoiseCanvas');
    if (staticCanvas) staticCtx = staticCanvas.getContext('2d');

    cacheDom();
    initParticles();
    resize2DCanvas();
    setupControls();
    computeTelemetryFromKm(state.odometerKm);
    updateHUD();

    lastTime = performance.now();
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(animate);

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
    state.autoCruise = false;
    audioEngine.setDriving(false);
  };

  window.resizeMissionExperience = function () {
    if (storyCanvas) resize2DCanvas();
  };

  window.addEventListener('resize', () => {
    if (window.__experienceActive) resize2DCanvas();
  });

})();
