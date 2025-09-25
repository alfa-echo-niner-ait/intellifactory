// Machine entity
export interface Machine {
	id: number;
	name: string;
	status: "running" | "idle" | "maintenance";
	utilization: number;
	energy_usage: number;
}

// Order entity
export interface Order {
	id: number;
	customer: string;
	quantity: number;
	deadline: string; // ISO string
	status: "pending" | "in_progress" | "completed";
}

// Energy price entry
export interface EnergyPrice {
	timestamp: string; // ISO string
	price_per_kwh: number;
}

// Agent decision record
export interface AgentDecision {
	id: number;
	agent: string;
	decision: string; // JSON string from backend
	created_at: string;
}

// SSE event payloads
export interface DecisionEvent {
	agent: string;
	decision: string; // JSON string from backend, same as AgentDecision.decision
	created_at: string;
}

export interface StateUpdateEvent {
	machine_id: number;
	new_status: string;
	new_utilization: number;
}
