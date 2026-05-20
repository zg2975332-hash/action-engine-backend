# 🚀 AetherFlow — Autonomous Content-to-Action Agent

> **Hackathon Challenge #1: Insight → Action System**  
> An Agentic AI system that transforms unstructured content into actionable outcomes — powered by **Google Antigravity** and **Google ADK**.

[![Google ADK](https://img.shields.io/badge/Google-ADK%201.5.0-4285F4?logo=google)](https://github.com/google/adk)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)

**🎯 What It Does:** Ingests unstructured content (text, PDF, URL) → Extracts insights → Analyzes impact → Generates actions → **Simulates execution** → Shows before/after outcomes

**⚡ Key Innovation:** Not just analysis — **real action simulation** with mock API calls, notifications, and dashboard updates

---

## 🎥 Demo Video

**📹 [Watch 4-Minute Demo](DEMO_VIDEO_LINK_HERE)**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT NATIVE MOBILE APP                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ Input Hub │→ │  Process  │→ │  Results  │→ │ Simulation  │ │
│  │ (text/    │  │ (6-phase  │  │ (insights │  │ (before/    │ │
│  │  pdf/url) │  │  pipeline)│  │  +actions) │  │  after)     │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                                                                 │
│  POST /api/analyze    → Full 6-agent pipeline                   │
│  POST /api/simulate   → Action simulation                       │
│  POST /api/upload-pdf → Direct PDF upload                       │
│  GET  /api/health     → Health check                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│              GOOGLE ADK — SequentialAgent Pipeline               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Agent 1    │    │   Agent 2    │    │   Agent 3    │      │
│  │   Content    │ →  │   Insight    │ →  │   Impact     │      │
│  │   Parser     │    │   Extractor  │    │   Analyzer   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                                       │               │
│         ▼                                       ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Agent 4    │    │   Agent 5    │    │   Agent 6    │      │
│  │   Action     │ →  │  Simulation  │ →  │   Outcome    │      │
│  │   Generator  │    │   Engine     │    │  Visualizer  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                            │                                    │
│                     ┌──────▼──────┐                             │
│                     │    Tools    │                              │
│                     │ • mock_api  │                              │
│                     │ • notify    │                              │
│                     │ • dashboard │                              │
│                     └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │ Gemini LLM  │
                     │ (via ADK)   │
                     └─────────────┘
```

---

## How It Works — End-to-End Flow

### 1. Content Understanding
**Agent 1: Content Parser** — Processes unstructured input (text, PDF, URL), identifies domain, extracts key facts, entities, metrics, and anomalies.

### 2. Insight Extraction
**Agent 2: Insight Extractor** — Surfaces 2-4 meaningful, non-generic insights with severity ratings (High/Medium/Low) and supporting evidence.

### 3. Impact Analysis
**Agent 3: Impact Analyzer** — Quantifies real-world consequences: revenue impact, operational risk, customer trust, time sensitivity, cascade effects.

### 4. Action Generation
**Agent 4: Action Generator** — Creates 2-4 clear, executable recommendations with projected lift, cost, timeline, and full reasoning chains.

### 5. Action Simulation ⭐ (CRITICAL REQUIREMENT)
**Agent 5: Simulation Engine** — Executes top action using **three ADK FunctionTools**:

**Tool 1: `mock_api_call`** — Simulates API request (e.g., POST /api/campaigns/create)  
**Tool 2: `generate_notification`** — Creates email, SMS, push notifications  
**Tool 3: `update_dashboard`** — Updates metrics with before/after values

**Simulation Output:**
- Before state: `{sales: 1000, revenue: 50000}`
- After state: `{sales: 1250, revenue: 62500}`
- Execution logs: 6 detailed steps
- Notifications sent: Email, SMS, push with delivery status
- Net lift: `+25%` with ROI `2.4x`

### 6. Outcome Visualization
**Agent 6: Outcome Visualizer** — Composes final report with before/after comparison, execution logs, notifications, net lift, confidence score, and ROI estimate.

---

## How Google Antigravity Is Used

**AetherFlow is built entirely on Google ADK (Antigravity Development Kit).**

| Area | Implementation |
|------|----------------|
| **Core Orchestration** | `SequentialAgent` orchestrates all 6 agents |
| **Agent Framework** | 6 `LlmAgent` instances with structured instructions |
| **Reasoning & Planning** | Chain-of-thought instructions; outputs passed via `output_key` |
| **Tool Integration** | 5 `FunctionTool` wrappers for simulation and content extraction |
| **Execution** | `InMemoryRunner` + `InMemorySessionService` manage pipeline |
| **Model** | Gemini 2.5 Flash via Vertex AI |
| **Session State** | ADK session state passes data between agents |
| **Trace Capture** | All agent events captured via ADK event stream |

**Code Example:**
```python
from google.adk.agents import SequentialAgent, LlmAgent
from google.adk.runners import InMemoryRunner

# Define 6 agents
content_parser = LlmAgent(name="content_parser", instructions="...", output_key="parsed_content")
insight_extractor = LlmAgent(name="insight_extractor", instructions="...", output_key="insights")
# ... 4 more agents

# Orchestrate with SequentialAgent
analysis_pipeline = SequentialAgent(
    name="AetherFlow_Pipeline",
    sub_agents=[content_parser, insight_extractor, impact_analyzer, 
                action_generator, simulation_engine, outcome_visualizer]
)

# Execute with InMemoryRunner
runner = InMemoryRunner(agent=analysis_pipeline, app_name="aetherflow")
async for event in runner.run_async(user_id="user", session_id=session_id, new_message=message):
    traces.append({"agent": event.author, "content": event.content})
```

---

## Tools & APIs Used

| Tool / API | Purpose |
|-----------|---------|
| **Google ADK 1.5.0** | Agent orchestration (SequentialAgent, LlmAgent, InMemoryRunner) |
| **Gemini 2.5 Flash** | Large Language Model via Vertex AI |
| **FastAPI** | Python REST API backend |
| **React Native (Expo)** | Cross-platform mobile app (iOS, Android, Web) |
| **PyPDF2** | PDF text extraction |
| **BeautifulSoup4** | Web scraping for URL inputs |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Antigravity IDE (recommended) OR Google Cloud Project with Vertex AI

### Setup

**If using Google Antigravity IDE:**
```bash
# Configuration is automatic! Just run:
python start.py
```

**If using manual setup:**
```bash
# 1. Clone repository
git clone <repo-url>
cd action-engine-main

# 2. Configure Vertex AI
cd backend
# Edit .env file:
# GOOGLE_GENAI_USE_VERTEXAI=TRUE
# GOOGLE_CLOUD_PROJECT=your-project-id
# GOOGLE_CLOUD_LOCATION=us-central1
# MODEL_NAME=gemini-2.5-flash

# 3. Authenticate
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

# 4. Run
cd ..
python start.py
```

### Open the App
- **Web:** http://localhost:8081
- **Mobile:** Scan QR code with Expo Go app
- **API Docs:** http://localhost:8000/docs

---

## Demo Flow Example

```
INPUT: "Sales declined 25% in Lahore region. Q3 revenue dropped from $500K 
        to $375K due to supply chain delays..."

  ↓ Agent 1: Content Parser
  
PARSED: Domain=business, Facts=4, Entities=3, Anomalies=2

  ↓ Agent 2: Insight Extractor
  
INSIGHT: "Revenue collapse in Lahore region" (HIGH severity)
         Evidence: 25% decline, $312K shortfall, supply chain delays

  ↓ Agent 3: Impact Analyzer
  
IMPACT: Revenue=$312K loss, Ops=12 SKUs at risk, Trust=8pt drop, 
        Time=Critical (48hrs), Cascade=[morale, competition]

  ↓ Agent 4: Action Generator
  
ACTION: "Launch 15% targeted promo in Lahore"
        Lift=+25%, Cost=$15K, Timeline=7-14 days
        Reasoning: Historical promos recover 60-80% of lost orders

  ↓ Agent 5: Simulation Engine (3 tools)
  
SIMULATION:
  • mock_api_call → POST /api/campaigns/create (200 OK, 312ms)
  • generate_notification → Email sent to regional-managers@company.com
  • update_dashboard → monthly_sales: 1000 → 1250 units (+25%)

  ↓ Agent 6: Outcome Visualizer
  
RESULT: Before={sales:1000, revenue:$50K}
        After={sales:1250, revenue:$62.5K}
        Net Lift=+25%, ROI=2.4x, Confidence=94%
        Notifications: 3 sent (email, SMS, push)
```

**Processing Time:** 4.3 seconds

---

## Agentic Workflow & Traceability

**Every pipeline run generates:**
- Unique Run ID (e.g., `af_7c3b2e`)
- Timestamped agent traces showing reasoning
- Tool call logs for every API call, notification, dashboard update
- Session state with all intermediate outputs
- Downloadable full report

**Traces stored in:**
- `backend/logs/analysis_af_XXXXXX_YYYYMMDD_HHMMSS.json`
- Mobile app "Agent Logs" drawer (real-time)
- Downloadable text report

**Example trace:**
```json
{
  "agent": "insight_extractor",
  "timestamp": 1.2,
  "type": "reasoning",
  "content": "Identified revenue collapse pattern in Lahore region..."
}
```

---

## Assumptions

1. **Model:** Gemini 2.5 Flash via Vertex AI (configurable in `.env`)
2. **Simulation:** Sandboxed — no real external API calls
3. **Metrics:** AI-generated projections based on input patterns
4. **Languages:** English, Urdu, Roman Urdu (auto-translated)
5. **PDFs:** Text-based only (no OCR for scanned images)
6. **URLs:** 15-second timeout, respects robots.txt
7. **Demo Mode:** Offline fallback with pre-generated data
8. **Deployment:** Designed for Google Antigravity IDE

---

## Project Structure

```
action-engine-main/
├── start.py                          # Single-command launcher for both servers
├── README.md                         # This documentation file
├── backend/                          # Python FastAPI backend
│   ├── .env                          # Vertex AI configuration (GOOGLE_GENAI_USE_VERTEXAI, PROJECT_ID, etc.)
│   ├── .env.example                  # Example configuration file
│   ├── config.py                     # Environment variable loader and configuration
│   ├── main.py                       # FastAPI server with 4 REST endpoints
│   ├── requirements.txt              # Python dependencies (google-adk, fastapi, etc.)
│   │
│   ├── agents/                       # 6 ADK LlmAgent implementations
│   │   ├── __init__.py
│   │   ├── pipeline.py               # SequentialAgent orchestrator + InMemoryRunner
│   │   ├── content_parser.py         # Agent 1: Parse unstructured input (text/PDF/URL)
│   │   ├── insight_extractor.py      # Agent 2: Extract meaningful insights with severity
│   │   ├── impact_analyzer.py        # Agent 3: Quantify consequences (revenue, ops, trust)
│   │   ├── action_generator.py       # Agent 4: Generate recommendations with reasoning
│   │   ├── simulation_engine.py      # Agent 5: Simulate action execution (3 tools)
│   │   └── outcome_visualizer.py     # Agent 6: Compose final report with metrics
│   │
│   ├── tools/                        # ADK FunctionTool implementations
│   │   ├── __init__.py
│   │   ├── content_tools.py          # PDF extraction (PyPDF2) + URL scraping (BeautifulSoup4)
│   │   ├── roman_urdu_translator.py  # Roman Urdu to English translation
│   │   └── simulation_tools.py       # Mock API calls, notifications, dashboard updates
│   │
│   └── logs/                         # Agent trace logs (JSON files)
│       └── analysis_af_*.json        # Timestamped execution traces
│
└── frontend/                         # React Native (Expo) mobile app
    ├── package.json                  # Node.js dependencies
    ├── app.json                      # Expo configuration
    ├── babel.config.js               # Babel transpiler config
    ├── tsconfig.json                 # TypeScript configuration
    │
    ├── app/                          # Expo Router screens (file-based routing)
    │   ├── _layout.tsx               # Root layout with AnalysisProvider context
    │   ├── index.tsx                 # Input Hub: Text/PDF/URL input with samples
    │   ├── process.tsx               # Pipeline visualization: 6-phase progress + traces
    │   ├── results.tsx               # Results dashboard: Insights + impact + actions
    │   └── simulation.tsx            # Simulation screen: Before/after + logs + notifications
    │
    ├── components/                   # Reusable UI components
    │   ├── AnimatedBackground.tsx    # Gradient animated background
    │   ├── AppHeader.tsx             # App header with title and subtitle
    │   ├── BottomNav.tsx             # Bottom navigation bar
    │   ├── GlassView.tsx             # Glassmorphism card component
    │   ├── GradientText.tsx          # Gradient text component
    │   ├── NeonBorderView.tsx        # Neon border effect component
    │   └── SkeletonLoader.tsx        # Loading skeleton animation
    │
    ├── constants/                    # Design system and theme
    │   ├── theme.ts                  # Colors, fonts, shadows, gradients
    │   └── icons.ts                  # Icon mappings
    │
    ├── context/                      # React Context for state management
    │   └── AnalysisContext.tsx       # Global state: content, insights, actions, simulation
    │
    ├── services/                     # API client
    │   └── api.ts                    # Backend REST API client (analyzeContent, runSimulation)
    │
    └── assets/                       # Static assets
        └── fonts/                    # Custom fonts (Inter, Space Grotesk, JetBrains Mono)
```

### Key Files Explained

**Backend:**
- `pipeline.py` — Core orchestration using ADK SequentialAgent
- `simulation_engine.py` — Executes actions using 3 FunctionTools (mock_api_call, generate_notification, update_dashboard)
- `main.py` — REST API with `/api/analyze` (full pipeline) and `/api/simulate` (action simulation)

**Frontend:**
- `index.tsx` — Input screen with text/PDF/URL support + demo/real mode toggle
- `process.tsx` — Real-time 6-phase pipeline visualization with agent traces
- `simulation.tsx` — Before/after metrics with animated count-up + execution logs
- `AnalysisContext.tsx` — Shared state across all screens (insights, actions, simulation results)

---

## Built With

**Google Antigravity IDE** — Autonomous AI-powered development environment

**Team:** [Your Team Name]  
**Demo Video:** [Link]  
**Repository:** [GitHub Link]

---

**Powered by Google Antigravity + Google ADK + Gemini 2.5 Flash**
