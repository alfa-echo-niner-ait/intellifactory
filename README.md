# IntelliFactory Digital Twin — Full Documentation

## 1. Project Overview

The **IntelliFactory Digital Twin** is a demo application that simulates a factory environment with interactive 3D visualization, real-time data synchronization, and AI-powered multi-agent decision support.
It consists of:

* **Backend (Flask + PostgreSQL + OpenAI-compatible API via Scnet.cn)**

  * Stores machine, order, and energy data.
  * Hosts agent services (Production, Energy, Quality, Maintenance, SupplyChain).
  * Provides REST APIs, real-time updates via SSE, and agent decision management.

* **Frontend (React + Vite + Tailwind + Three.js)**

  * Provides a **dashboard** with machine/energy/order views.
  * Integrates a **3D digital twin scene** where machines are visualized as shapes.
  * Offers **control panels** to request agent suggestions and apply actions.
  * Subscribes to real-time SSE events for synchronization across clients.


## 2. Tech Stack

* **Backend**

  * Python 3.10+
  * Flask
  * Flask-Migrate + SQLAlchemy (Postgres)
  * OpenAI SDK (configured for Scnet.cn API)
  * Redis (optional, not required in demo)
  * Server-Sent Events (SSE) for live updates

* **Frontend**

  * React 19 + TypeScript
  * Vite build system
  * TailwindCSS + shadcn/ui
  * Three.js + @react-three/fiber (3D digital twin)
  * Axios (API client)
  * SSE for real-time updates


## 3. Backend Architecture

### Key Modules

* **`src/__init__.py`**
  Creates Flask app, configures DB, migrations, and CORS.

* **Models (`src/models/`)**

  * `Machine`: id, name, status (`running|idle|maintenance`), utilization %, energy usage.
  * `Order`: customer, quantity, deadline, status (`pending|in_progress|completed`).
  * `EnergyPrice`: timestamp + price per kWh.
  * `AgentDecision`: stores agent decisions (name, JSON, created_at).

* **Services (`src/services/`)**

  * `agent_core.py`: Core agent runner.

    * Builds prompts per agent.
    * Validates outputs.
    * Saves decisions.
  * `simulation.py`: Applies actions (update machines/orders in DB) and broadcasts via SSE.

* **Utils (`src/utils/`)**

  * `api_client.py`: Connects to Scnet.cn’s OpenAI-compatible API.
  * `build_state.py`: Builds factory state JSON snapshot for agents.
  * `mock_data.py`: Provides seed data for demo DB.

* **Blueprints (`src/blueprints/`)**

  * `agents.py`:

    * `/api/agents/<agent>` → run agent suggestions.
    * `/api/agents/run_all` → run all agents, apply actions.
  * `data.py`:

    * `/api/data/machines`, `/api/data/orders`, `/api/data/energy` CRUD.
    * `PUT /api/data/machines/<id>` for updating machines.
  * `events.py`:

    * `/api/events/stream` SSE stream → `decision`, `state_update`, `machine_update`.


### Agent System

* **Agents implemented:**

  * ProductionAgent
  * EnergyAgent
  * QualityAgent
  * MaintenanceAgent
  * SupplyChainAgent

* **Allowed actions:**

  * `increase_speed`, `reduce_speed`, `schedule_maintenance`, `reassign_job`

* **Agent workflow:**

  1. `run_agent()` builds factory state + system prompt.
  2. Query Scnet.cn model → enforces strict JSON-only response.
  3. Validate output against schema.
  4. Save decision to DB.
  5. Optionally apply actions → update DB + push SSE updates.


### Backend Data Flow

1. **Agent request:** `POST /api/agents/production`

   * Query model.
   * Return structured JSON.
   * Save to DB.
   * Push `decision` SSE event.

2. **Agent apply actions:** `POST /api/agents/run_all`

   * Collect all agents’ outputs.
   * Apply to machines/orders.
   * Broadcast `state_update` SSE events.

3. **Manual updates:** `PUT /api/data/machines/<id>`

   * Persist change.
   * Broadcast `machine_update` SSE event.

## 4. Frontend Architecture

### Layout

* **Dashboard Page (`pages/Dashboard.tsx`)**

  * Sidebar: navigation + agent panel.
  * Header: summary of system status.
  * Main panel:

    * **3D scene** (`FactoryScene.tsx` + `Machine3D.tsx`)
    * **Dashboard widgets** (`MachineList`, `OrdersTable`, `EnergyChart`, `DecisionLog`).

* **Digital Twin Page (`pages/DigitalTwin.tsx`)**

  * Fullscreen 3D scene visualization.

### State Management

* **`useFactoryData.ts` hook**

  * Loads initial data (`/data/machines`, `/data/orders`, `/data/energy`, `/data/decisions`).
  * Subscribes to SSE stream → updates state live.
  * Maintains:

    * `machines`
    * `orders`
    * `energy`
    * `decisions`

### Real-Time Synchronization

* **SSE events handled:**

  * `decision` → append to decisions list instantly.
  * `state_update` → merge updates into machines list.
  * `machine_update` → idempotently update specific machine.


## 5. Agent Integration (Frontend)

* **AgentPanel.tsx**

  * Buttons for each agent.
  * Calls `/api/agents/suggest/<agent>` → shows proposed actions.
  * Option to “Apply” → sends `/api/agents/apply_actions` → updates state.

* **DecisionLog.tsx**

  * Shows history of decisions (live updates via SSE).
  * Displays actions, impacts, and notes in readable format.


## 6. Digital Twin Visualization

* **FactoryScene.tsx**

  * Uses `@react-three/fiber` + `three` to render factory layout.
  * Machines represented with distinct shapes/colors.
  * Machines highlight when selected.
  * Reflects status (`running`, `idle`, `maintenance`) via color coding.

* **Machine3D.tsx**

  * Represents an individual machine with props: utilization, status.
  * Animates or colors accordingly.


## 7. Real-Time Interaction Examples

### Run a Production Agent

```bash
curl -X POST http://127.0.0.1:5000/api/agents/production
```

Response:

```json
{
  "actions": [
    { "action": "increase_speed", "machine_id": 1, "value": 10 }
  ],
  "impact": {
    "throughput_change_percent": 15,
    "energy_change_percent": 5,
    "notes": "Increased Lathe speed to boost throughput"
  }
}
```

→ Immediately saved in DB and pushed to frontend via SSE.


### Apply All Agents

```bash
curl -X POST http://127.0.0.1:5000/api/agents/run_all
```

Response:

```json
{
  "agents": { ... },
  "updates": [
    { "machine_id": 1, "new_status": "running", "new_utilization": 95 }
  ]
}
```

→ Machines updated and reflected in frontend 3D + dashboard.


## 8. Achievements So Far

* ✅ Structured backend with modular services and blueprints.
* ✅ Seed database with realistic dummy data.
* ✅ Integrated AI agents with strict JSON schema enforcement.
* ✅ Implemented decision persistence and SSE-based real-time sync.
* ✅ Built responsive dashboard with control panel, charts, and decision log.
* ✅ Added interactive 3D factory visualization.
* ✅ Achieved end-to-end workflow: **suggest → apply → visualize → sync**.

## Project Structure

```bash
├── README.md
├── backend
|     ├── .gitignore
|     ├── app.py
|     ├── requirements.txt
|     ├── seed_db.py
|     ├── src
|     |     ├── __init__.py
|     |     ├── blueprints
|     |     |     ├── __init__.py
|     |     |     ├── agents.py
|     |     |     ├── data.py
|     |     |     ├── events.py
|     |     ├── config.py
|     |     ├── models
|     |     |     ├── __init__.py
|     |     ├── services
|     |     |     ├── __init__.py
|     |     |     ├── agent_core.py
|     |     |     ├── simulation.py
|     |     ├── utils
|     |     |     ├── __init__.py
|     |     |     ├── api_client.py
|     |     |     ├── build_state.py
|     |     |     ├── mock_data.py
|     ├── test.py
├── docs
|     ├── digital_twin_dashboard_changes.md
|     ├── digital_twin_project_plan.md
├── frontend
|     ├── .gitignore
|     ├── README.md
|     ├── components.json
|     ├── eslint.config.js
|     ├── index.html
|     ├── package-lock.json
|     ├── package.json
|     ├── public
|     |     ├── apple-touch-icon.png
|     |     ├── favicon-16x16.png
|     |     ├── favicon-32x32.png
|     ├── src
|     |     ├── App.css
|     |     ├── App.tsx
|     |     ├── components
|     |     |     ├── AgentPanel.tsx
|     |     |     ├── Factory3D.tsx
|     |     |     ├── Metrics.tsx
|     |     |     ├── dashboard
|     |     |     |     ├── ControlPanel.tsx
|     |     |     |     ├── DecisionLog.tsx
|     |     |     |     ├── EnergyChart.tsx
|     |     |     |     ├── MachineList.tsx
|     |     |     |     ├── MachineStatusCard.tsx
|     |     |     |     ├── OrdersTable.tsx
|     |     |     ├── layout
|     |     |     |     ├── Header.tsx
|     |     |     |     ├── MainLayout.tsx
|     |     |     |     ├── Sidebar.tsx
|     |     |     ├── twin
|     |     |     |     ├── FactoryScene.tsx
|     |     |     |     ├── Machine3D.tsx
|     |     |     ├── ui
|     |     |     |     ├── button.tsx
|     |     |     |     ├── table.tsx
|     |     ├── hooks
|     |     |     ├── useFactoryData.ts
|     |     ├── lib
|     |     |     ├── api.ts
|     |     |     ├── config.ts
|     |     |     ├── sse.ts
|     |     |     ├── types.ts
|     |     |     ├── utils.ts
|     |     ├── main.tsx
|     |     ├── pages
|     |     |     ├── Dashboard.tsx
|     |     |     ├── DigitalTwin.tsx
|     ├── tsconfig.app.json
|     ├── tsconfig.json
|     ├── tsconfig.node.json
|     ├── vite.config.ts
├── response.log

```