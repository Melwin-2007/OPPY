# OPPY'S LAST DANCE — NASA Opportunity Mars Rover Experience

Interactive documentary and 3D telemetry visualization of NASA's Mars Exploration Rover B (Opportunity, MER-B).

## Features

- **3D Rover Inspection**: Interactive Three.js WebGL viewport rendering the flight model `24883_MER_static.glb` (11.9 MB) at 1:1 scale with PBR materials, procedural Martian atmosphere reflections, soft contact shadows, wireframe mode, and auto-orbit turntable.
- **Subsystem Focus**: Cinematic camera glide and luminous emissive material pulsing for the Pancam Mast, GaAs Solar Arrays, Rocker-Bogie Mobility, IDD Robotic Arm, High-Gain Antenna, and RAD6000 Warm Electronics Box.
- **Zero-CORS Offline Viewing**: Embedded offline telemetry payload in `model-data.js` ensures seamless rendering when opened directly via `file:///` without local server CORS blocks.
- **Mission Odyssey Chronology**: 8 milestone traverse selector from Eagle Crater touchdown to Sol 5111 at Perseverance Valley.
- **Atmospheric Audio**: Procedural Web Audio API synthesizer generating Martian wind noise modulated at 140 Hz with 0.18 Hz LFO wind gusts.

## Running Locally

Open `index.html` directly in any modern web browser, or serve via any static web server:

```powershell
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```
