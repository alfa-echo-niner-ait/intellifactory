import axios from "axios";
import { API_BASE_URL } from "./config";
import type { Machine, Order, EnergyPrice, AgentDecision } from "./types";

const api = axios.create({
	baseURL: API_BASE_URL,
});

// ---- Data fetchers ----
export async function getMachines(): Promise<Machine[]> {
	const res = await api.get("/data/machines");
	return res.data;
}

export async function getOrders(): Promise<Order[]> {
	const res = await api.get("/data/orders");
	return res.data;
}

export async function getEnergy(): Promise<EnergyPrice[]> {
	const res = await api.get("/data/energy");
	return res.data;
}

export async function getDecisions(): Promise<AgentDecision[]> {
	const res = await api.get("/data/decisions");
	return res.data;
}

// update a machine record (PUT)
export async function updateMachine(machineId: number, payload: Partial<Machine>) {
    const res = await api.put(`/data/machines/${machineId}`, payload);
    return res.data as Machine;
}

// ---- Agents ----
export async function runAllAgents() {
	const res = await api.post("/agents/run_all");
	return res.data;
}

export async function runAgent(agent: string) {
	const res = await api.post(`/agents/${agent}`);
	return res.data;
}

// request suggested actions from an agent without applying them
export async function suggestAgent(agentName: string) {
	const res = await api.post(`/agents/suggest/${agentName}`);
	return res.data;
}

// apply a list of actions (usually approved by user)
export async function applyActions(actions: unknown[]) {
	const res = await api.post(`/agents/apply_actions`, { actions });
	return res.data;
}
