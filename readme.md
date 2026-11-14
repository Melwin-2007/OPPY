# OPPY'S LAST DANCE — NASA Opportunity Mars Rover Experience

Interactive documentary and 3D engineering telemetry visualization of NASA's Mars Exploration Rover B (Opportunity, MER-B).

## Features

- **3D Flight Hardware Engine**: Three.js WebGL viewport rendering the Opportunity flight model `24883_MER_static.glb` (11.9 MB) at 1:1 scale ($2.28\text{ m} \times 1.58\text{ m} \times 1.65\text{ m}$) with PBR materials, procedural Martian atmosphere reflections, PCF soft shadows, ground contact occlusion, wireframe mode, and auto-orbit turntable.
- **Exploded CAD Subsystems View**: Interactive `[EXPLODE: 0% - 100%]` displacement slider and one-click toggle separating 6 major subsystems along logical operational axes, connected by dynamic cyan dashed CAD alignment guide rails (`#38bdf8`).
- **Real-Time Operational Animations**:
  - `DRIVE / TRAVERSE`: 6-wheel forward rotation via GPU GLSL vertex shader ($5\text{ cm/s}$, $5.2\text{ rpm}$), rocker-bogie undulating terrain crawl, dual red-soil wheel tracks, ferric dust plume particle system, and live odometer accumulation.
  - `PANCAM SCAN`: Mast $360^\circ$ azimuth pan ($\pm 83^\circ$) and elevation tilt, semi-transparent stereoscopic camera vision cone, and sweeping ground targeting reticle.
  - `IDD SAMPLING`: 5-DOF robotic arm articulation down to a 3D Martian basalt rock outcrop, Rock Abrasion Tool (RAT) grinding spark emitter ($3.72\text{ m/s}^2$ Mars gravity), and APXS laser spectrometer analysis.
  - `EARTH COMM`: High-Gain Antenna Earth-tracking gimbal with expanding concentric X-band RF wavefront rings ($8.41\text{ GHz}$) radiating to the Deep Space Network (DSN).
  - `AUTO MISSION DEMO`: Autonomous 28-second Martian Sol workflow cycling sequentially through Drive $\to$ Scan $\to$ Sample $\to$ Comm with dynamic telemetry updates.
- **Playback & Speed Multipliers**: Play/Pause controls and $1\times$ (real $0.05\text{ m/s}$), $2\times$, and $4\times$ simulation speed modes.
- **Subsystem Focus**: Cinematic camera glide and luminous emissive material pulsing for the Pancam Mast, GaAs Solar Arrays, Rocker-Bogie Mobility, IDD Robotic Arm, High-Gain Antenna, and RAD6000 Warm Electronics Box.
- **Zero-CORS Offline Viewing**: Embedded base64 offline telemetry payload in `model-data.js` ensures seamless rendering when opened directly via `file:///` without local server CORS blocks.
- **Synthesized Martian Soundscape**: Procedural Web Audio API synthesizer generating thin Martian wind ambience, low-frequency drive rumble, stepper motor servo chirps, RAT rock grinding abrasion, and DSN telemetry packets.
- **Mission Odyssey Chronology**: 8 milestone traverse selector from Eagle Crater touchdown to Sol 5111 at Perseverance Valley.

## Running Locally

Open `index.html` directly in any modern web browser via `file:///`, or serve via any local static web server:

```powershell
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```
