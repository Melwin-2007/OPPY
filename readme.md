# OPPY'S LAST DANCE — NASA Opportunity Mars Rover Experience

An interactive 3D educational documentary and engineering exploration platform dedicated to NASA's Mars Exploration Rover B (Opportunity, MER-B).

---

## Workspace Architecture

```text
e:\OPPY/
├── client/                       # Frontend SPA (React 18 + TS + Vite + R3F)
│   ├── public/
│   │   └── models/
│   │       ├── 24883_MER_static.glb  # 11.9 MB 1:1 Flight Model
│   │       └── model-data.js         # Base64 offline fallback carrier
│   ├── src/
│   │   ├── components/           # 3d/, ui/, story/, hardware/, shared/
│   │   ├── data/                 # missionPhases.json, subsystems.json
│   │   ├── hooks/                # useWebAudio.ts (Martian wind & rover sound FX)
│   │   ├── pages/                # HomePage.tsx, ExperiencePage.tsx, HardwarePage.tsx
│   │   ├── shaders/              # wheelShader.ts (GLSL 6-wheel rotation)
│   │   └── stores/               # missionStore.ts, hardwareStore.ts (Zustand)
│   └── package.json
│
├── server/                       # Backend API Service (Node.js + Express + TS)
│   ├── data/                     # schema.sql & SQLite guestbook database
│   ├── src/
│   │   ├── routes/               # /api/phases, /api/hardware, /api/nasa, /api/tributes
│   │   ├── services/             # nasaService.ts, tributeService.ts
│   │   └── server.ts
│   ├── requirements.txt          # Python dependencies (FastAPI, Uvicorn, Requests)
│   └── package.json
│
├── plan-kit/                     # Modular Technical Specification & Prompts
│   ├── 01-SYSTEM-ARCHITECTURE.md
│   ├── 02-UI-UX-SPECIFICATION.md
│   ├── 03-3D-ENGINE-SPECIFICATION.md
│   ├── 04-BACKEND-API-SPECIFICATION.md
│   ├── 05-PHASED-EXECUTION-PROMPTS.md
│   └── reference-landing.txt
│
├── legacy/                       # Standalone zero-dependency HTML prototype
│   ├── index.html                # Standalone HTML viewer
│   ├── hybrid-lab.html           # MER-B Hybrid 2.5D Story & 3D Exploded-View Lab
│   ├── model-data.js             # Offline base64 data
│   ├── landing.txt               # Text prototype backup
│   └── workspace-scripts.json    # Legacy scripts
│
├── .venv/                        # Python 3.11 virtual environment
├── .env.example                  # Environment variable template
├── .gitattributes                # LFS / binary asset flags
└── .gitignore                    # Git exclusion rules
```

---

## Getting Started

### 1. Frontend Development (`client/`)
```powershell
cd client
npm install
npm run dev
```
Serves at `http://localhost:5173`.

### 2. Backend API Service (`server/`)
```powershell
cd server
npm install
npm run dev
```
Serves at `http://localhost:3001` (`/api/health`, `/api/phases`, `/api/hardware`, `/api/tributes`).

### 3. Python Virtual Environment (`.venv`)
```powershell
# Activate the virtual environment
.\.venv\Scripts\activate

# Install requirements
pip install -r server\requirements.txt
```

### 4. Standalone Offline Prototype
To run the pre-bundled zero-dependency HTML prototype directly without build tools:
```powershell
python -m http.server 8000
# Open http://localhost:8000/legacy/index.html
```
