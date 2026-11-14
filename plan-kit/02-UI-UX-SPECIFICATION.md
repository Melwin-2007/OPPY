# OPPY'S LAST DANCE — UI/UX Design Specification
**Document ID:** `PLANKIT-UIUX-02`  
**Version:** `1.0.0`  
**Typography:** Poppins (Google Fonts)  
**Theme:** Minimalist Cinematic Grayscale  

---

## 1. Grayscale Design Tokens & Color Palette

The interface is strictly predominantly grayscale, allowing the natural Martian terrain colors of the 3D models to stand out as the primary visual focus without interface noise.

```css
:root {
  /* Surface & Background Hierarchy */
  --oppy-bg-root:       #101113;  /* 60% dominant viewport background */
  --oppy-bg-elevated:   #181a1d;  /* Card containers & modals */
  --oppy-bg-surface:    #22252a;  /* Elevated buttons, toolbars, chips */
  --oppy-border-subtle: #34383e;  /* 1px divider lines and panel borders */
  --oppy-border-strong: #4b5058;  /* Active state outlines and focus rings */

  /* Text & Telemetry Contrast (WCAG AA Compliant) */
  --oppy-text-primary:   #f1f1f1; /* Headers, active labels (Contrast > 12:1) */
  --oppy-text-secondary: #a1a5aa; /* Subtitles, body descriptions (> 6:1) */
  --oppy-text-muted:     #737980; /* Metadata, timestamps, units (> 4.5:1) */
  --oppy-text-highlight: #d4d5d6; /* CAD callouts and technical values */

  /* Technical Accent (Restricted to telemetry indicators & reticles) */
  --oppy-accent-cyan:    #38bdf8; /* Laser reticle, CAD rails, DSN carrier */
  --oppy-accent-emerald: #34d399; /* System Nominal status beacons */
  --oppy-accent-orange:  #fb923c; /* RAT rock sparks & Martian regolith indicators */
}
```

---

## 2. Typography Hierarchy (Poppins)

All headings, body text, and technical labels use **Poppins** with tabular monospace figures for engineering readouts:

| Role | Font Size / Line Height | Weight | Letter Spacing | CSS Equivalent |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | $56\text{ px} / 64\text{ px}$ | `700 Bold` | `-0.03em` | `text-5xl sm:text-6xl font-bold tracking-tight` |
| **Section Header** | $28\text{ px} / 36\text{ px}$ | `600 SemiBold` | `-0.02em` | `text-2xl sm:text-3xl font-semibold` |
| **Subsystem Title**| $18\text{ px} / 26\text{ px}$ | `600 SemiBold` | `-0.01em` | `text-lg font-semibold` |
| **Body Narrative** | $14\text{ px} / 22\text{ px}$ | `400 Regular` | `0.00em` | `text-sm font-normal text-oppy-textSecondary` |
| **Technical Label**| $11\text{ px} / 16\text{ px}$ | `500 Medium` | `+0.08em` | `text-[11px] font-mono uppercase tracking-wider` |
| **Telemetry Value**| $12\text{ px} / 16\text{ px}$ | `600 SemiBold` | `+0.04em` | `text-xs font-mono font-semibold text-white` |

---

## 3. Screen Wireframes & Layout Architecture

### 3.1 Route `/` — Home / Landing Page

```text
+------------------------------------------------------------------------------------+
|  [LOGO] OPPY'S LAST DANCE                         [AUDIO TOGGLE: OFF/ON] [TRIBUTES]|
|                                                                                    |
|                                                                                    |
|         NASA MARS EXPLORATION ROVER · MER-B                                        |
|         OPPY'S LAST DANCE                                                          |
|                                                                                    |
|         Designed to last 90 days. It explored Mars for nearly 15 years.            |
|         This is the story of the little rover that changed how humanity            |
|         sees the Red Planet.                                                       |
|                                                                                    |
|         +---------------------------+   +-------------------------------+          |
|         | ▶  WATCH THE EXPERIENCE   |   | ⚙  UNDERSTAND THE HARDWARE     |          |
|         +---------------------------+   +-------------------------------+          |
|                                                                                    |
|                                                                                    |
|  [FOOTER HUD: MERIDIANI PLANUM | LAUNCH: JUL 7, 2003 | DISTANCE: 45.16 KM]        |
+------------------------------------------------------------------------------------+
```

**Constraints**:
- Full viewport background with low-contrast Opportunity rover imagery and cinematic vignette.
- **Zero peripheral clutter**: No blogs, no feature cards, no news feeds. Exactly two prominent action buttons directing the visitor to either `/experience` or `/hardware`.

---

### 3.2 Route `/experience` — The Complete Journey (6 Story Phases)

```text
+------------------------------------------------------------------------------------+
|  [<- OPPY]  PHASE 03 // THE FIRST DISCOVERIES (2004)        [PHASE 03/06] [PAUSE/1X]|
+------------------------------------------------------------------------------------+
|                                                                                    |
|                                                                                    |
|                         [ FULLSCREEN 3D VIEWPORT ]                                 |
|               (Opportunity Rover in Eagle Crater 3D Environment)                   |
|                   Interactive Camera Orbit / Zoom / Pan Enabled                     |
|                                                                                    |
|                                                                                    |
|   +---------------------------------------------------------+                      |
|   | STORY HUD (NON-INTRUSIVE FLOATING GLASS PANEL)          |                      |
|   | ─────────────────────────────────────────────────────── |                      |
|   | "Inside Eagle Crater, Opportunity examines bedrock out- |                      |
|   | crops. The APXS spectrometer and Microscopic Imager     |                      |
|   | reveal hematite 'blueberries'—direct geological proof   |                      |
|   | that liquid water once altered the Martian surface."    |                      |
|   |                                                         |                      |
|   | [SCIENCE CALLOUT: JAROSITE DETECTED · MIMOS II ACTIVE]  |                      |
|   +---------------------------------------------------------+                      |
|                                                                                    |
+------------------------------------------------------------------------------------+
| [◀ PREV PHASE]  ●───●───[●]───○───○───○ (TIMELINE)  [NEXT PHASE: BEYOND EXP. ▶]   |
+------------------------------------------------------------------------------------+
```

**Phase Sequence**:
1. `PHASE 01: The Beginning (2003)` — Earth/Mars space trajectory, pre-launch hardware testing.
2. `PHASE 02: Arrival on Mars (Jan 25, 2004)` — Atmospheric EDL, airbag bouncing in Meridiani Planum.
3. `PHASE 03: The First Discoveries (2004)` — Eagle Crater bedrock, hematite spherules, ancient water.
4. `PHASE 04: Beyond Expectations (2004–2017)` — Endurance, Victoria, and Endeavour craters ($45.16\text{ km}$).
5. `PHASE 05: The Final Storm (2018)` — Global dust storm, darkening solar insolation, power drop.
6. `PHASE 06: The Last Dance (Feb 13, 2019)` — Final radio contact, scientific legacy, tribute wall.

---

### 3.3 Route `/hardware` — Interactive 3D Hardware Explorer

```text
+------------------------------------------------------------------------------------+
|  [<- HOME]  MER-B ENGINEERING EXPLORER               [EXPLODE: 0% [====] 100%] [RESET]|
+---------------------------------------------------+--------------------------------+
|                                                   | SUBSYSTEM SELECTION (COL 4)    |
|                                                   | [01. PANCAM MAST ASSEMBLY]     |
|              [ 3D ROVER VIEWPORT ]                | [02. GAAS SOLAR ARRAY WINGS]   |
|   - Interactive Subsystem Highlighting            | [03. ROCKER-BOGIE MOBILITY]    |
|   - Cyan Dashed CAD Alignment Guide Rails         | [04. IDD ROBOTIC ARM]          |
|   - Real-time 6-Wheel Rotation & Rocker Crawl     | [05. HIGH-GAIN DISH (HGA)]     |
|   - Bounding Box Camera Focus Interpolation       | [06. RAD6000 WARM ELECTRONICS] |
|                                                   | ────────────────────────────── |
|                                                   | TECHNICAL SPECIFICATIONS       |
|                                                   | • Mass: 10.5 kg (IDD Arm)      |
|                                                   | • Actuators: 5-DOF Steppers    |
|                                                   | • Voltage: 28V Regulated       |
|                                                   | ────────────────────────────── |
|                                                   | ENGINEERING TO DISCOVERY LINK  |
|                                                   | The Rock Abrasion Tool (RAT)   |
|                                                   | removed outer weathered rinds  |
|                                                   | enabling APXS to verify water- |
|                                                   | deposited jarosite minerals.   |
+---------------------------------------------------+--------------------------------+
| [DRAG: ORBIT | WHEEL: ZOOM | CLICK PART: FOCUS]   [SCALE: 1:1 REAL MARS DIMENSIONS]|
+------------------------------------------------------------------------------------+
```

---

## 4. Interaction & Accessibility Standards (WCAG AA)

1. **Keyboard Accessibility**:
   - `Left Arrow` / `Right Arrow`: Navigate previous and next story phases in `/experience`.
   - `Spacebar`: Toggle simulation Play/Pause.
   - `1` / `2` / `3` / `4` / `5` / `6`: Quick jump to respective hardware subsystem.
   - `Tab` / `Shift+Tab`: Visible high-contrast focus rings (`outline: 2px solid #38bdf8`) on all interactive buttons.
2. **Reduced Motion**:
   - Respects `prefers-reduced-motion: reduce`. Disables automatic turntable orbit and eases camera glides instantly without inertial overshoot.
3. **Contrast Compliance**:
   - All body text against `#101113` background has minimum contrast ratio of $6.8:1$ (exceeding WCAG AA $4.5:1$ threshold).
