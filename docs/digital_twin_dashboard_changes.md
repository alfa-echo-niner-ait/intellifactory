# Digital Twin Dashboard & Agent Integration — Change Log and Documentation

This document summarizes the changes made to implement a responsive digital-twin dashboard, interactive machine controls, backend persistence, agent suggestion/apply flows, and real-time synchronization via Server-Sent Events (SSE).

## Goals implemented
- Responsive dashboard layout with the 3D digital twin scene contained in a stable panel.
- Interactive machine information (selection, status buttons, utilization slider) that persists to the backend.
- Machine list highlighting to reflect the currently-selected machine.
- Agent suggestion flow: request suggestions, show recommended actions, apply actions from frontend.
- Backend persistence endpoint to update machines and broadcast updates to connected clients using SSE.
- Frontend SSE client to subscribe to `/api/events/stream` and merge `machine_update` / `state_update` events into local UI state.

## Files changed / added (high level)
- Frontend
  - `frontend/src/pages/Dashboard.tsx` — Main dashboard UI. Now:
    - Keeps an optimistic `localMachines` state.
    - Handles selection and machine detail editing UI (status, utilization).
    - Persists edits via `PUT /api/data/machines/<id>`.
    - Subscribes to SSE and merges `machine_update` / `state_update` events into `localMachines`.
    - UI: responsive left-right layout with canvas container for the 3D scene and collapsible dashboard panel.
  - `frontend/src/components/dashboard/MachineList.tsx` — Replaced corrupted content with a clean component that:
    - Accepts `machines`, `selectedId`, `onSelect`.
    - Renders a compact list with selection highlight and basic status/utilization display.
  - `frontend/src/components/twin/FactoryScene.tsx` and `Machine3D.tsx` — 3D scene components wired to:
    - Forward click/hover events to the Dashboard to allow selection from the scene.
    - Visual selection/hover cues for machines inside the 3D canvas.
  - `frontend/src/lib/sse.ts` — SSE helper to connect to `/api/events/stream` and forward events to handlers.
  - `frontend/src/lib/api.ts` — API wrapper functions used by the Dashboard: `updateMachine`, `suggestAgent`, `applyActions`.
  - `frontend/src/hooks/useFactoryData.ts` — Initial data loading hook (machines, orders, energy, decisions). May now share SSE responsibilities; Dashboard currently also subscribes directly so it can merge into optimistic state.

- Backend
  - `backend/src/blueprints/data.py` — Added `PUT /api/data/machines/<int:machine_id>`:
    - Validates JSON payload and updates allowed machine fields (status, utilization, name, energy_usage, etc.).
    - Commits changes and broadcasts an SSE `machine_update` event with a normalized payload such as `{ "machine_id": <id>, "new_status": "...", "new_utilization": 0.72 }`.
    - Returns the updated machine JSON to the client.
  - `backend/src/blueprints/agents.py` — Added endpoints for agent flows (already present in current code):
    - `POST /api/agents/suggest/<agent_name>` — returns suggestions (decision) from the named agent without applying actions.
    - `POST /api/agents/apply_actions` — accepts `{ actions: [...] }`, applies them via `apply_actions()`, broadcasts `machine_update` events per update, and returns the applied updates.
  - `backend/src/blueprints/events.py` — SSE streaming endpoint used by the frontend to subscribe to real-time server events.

## API summary (contract)
- PUT /api/data/machines/<id>
  - Request body: JSON containing fields to update. Common fields used by the UI:
    - `status` (string)
    - `utilization` (number 0..1)
    - `name` (string)
    - `energy_usage` (optional)
  - Response: updated machine JSON (full resource representation).
  - Side effect: broadcasts SSE `machine_update` event with payload example:
    ```json
    { "machine_id": 3, "new_status": "idle", "new_utilization": 0.12 }
    ```

- POST /api/agents/suggest/<agent_name>
  - Request: no body required (or optional constraints in JSON).
  - Response: `{ agent: <name>, decision: { actions: [ ... ], ... } }` (agent returns recommended actions but nothing is applied).

- POST /api/agents/apply_actions
  - Request body: `{ "actions": [ ... ] }` where each action is the agent's suggested operation.
  - Response: `{ "updates": [ <applied-update-object>, ... ] }`.
  - Side effect: broadcasts SSE `machine_update` events for each applied update.

- SSE stream: `/api/events/stream`
  - Event types observed by the frontend: `machine_update`, `state_update`, `decision`.
  - Each event `data` is JSON. Example `machine_update` payload:
    - `{ "machine_id": 3, "new_status": "running", "new_utilization": 0.85 }`

## Frontend behavior & merging strategy
- Optimistic UI: edits made in the Dashboard update `localMachines` immediately to keep the UI responsive.
- Persistence: the Dashboard calls `updateMachine` to persist changes. On success the backend broadcasts a `machine_update` which the frontend merges again (idempotently) into `localMachines`.
- SSE merging: when a `machine_update` arrives, Dashboard maps through `localMachines`, finds the matching machine by `machine_id` and merges changed fields (status, utilization). This keeps multiple clients in sync.
- Selection: selecting a machine in the 3D canvas or in the MachineList sets `selectedId` in Dashboard and shows machine detail controls.
- Agent workflow:
  - Request suggestions via `POST /api/agents/suggest/<agent_name>`.
  - Show the recommended actions in a small panel (`Decision / Actions`) for the user to review.
  - When the user accepts, send `POST /api/agents/apply_actions` with the selected actions.
  - Backend will apply actions and broadcast `machine_update` events; frontend SSE handler will merge those updates into `localMachines`.


## Quality gates & status
- TypeScript/compile: the workspace reported no TypeScript errors after fixing the corrupted `MachineList.tsx` and updating `Dashboard.tsx`'s SSE handling.
- Backend: `PUT /api/data/machines/<id>` commits to DB and broadcasts events; `POST /api/agents/apply_actions` applies actions and broadcasts updates.

## Edge cases & assumptions
- Assumption: SSE events use the payload shape `{ machine_id, new_status?, new_utilization? }`. If your agent/service uses a different shape, adapt the frontend merge logic accordingly.
- Race conditions: simultaneous edits from multiple clients may briefly overwrite optimistic state; the SSE merge is last-writer-wins from the server broadcasts. Consider stronger conflict resolution if needed.
- Validation: backend currently permits specific fields to be updated; ensure any new field is whitelisted in the `PUT` handler.
