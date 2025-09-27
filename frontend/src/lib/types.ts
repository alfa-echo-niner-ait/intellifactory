// frontend\src\lib\types.ts

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
	decision: string; // JSON string stored in DB
	created_at: string;
}


// SSE event payloads
export interface DecisionEvent {
	agent: string;
	decision: Record<string, unknown>; // actual JSON object from SSE
	created_at: string;
}


export interface StateUpdateEvent {
	machine_id: number;
	new_status: string;
	new_utilization: number;
}
