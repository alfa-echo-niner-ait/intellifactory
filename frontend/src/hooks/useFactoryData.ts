// frontend\src\hooks\useFactoryData.ts

import { useEffect, useState } from "react";
import { getMachines, getOrders, getEnergy, getDecisions } from "../lib/api";
import type {
	Machine,
	Order,
	EnergyPrice,
	AgentDecision,
	DecisionEvent,
	StateUpdateEvent,
} from "../lib/types";
import { subscribeToEvents } from "../lib/sse";

export function useFactoryData() {
	const [machines, setMachines] = useState<Machine[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [energy, setEnergy] = useState<EnergyPrice[]>([]);
	const [decisions, setDecisions] = useState<AgentDecision[]>([]);
	const [loading, setLoading] = useState(true);

	// ---- Initial fetch ----
	useEffect(() => {
		async function fetchInitial() {
			setLoading(true);
			try {
				const [m, o, e, d] = await Promise.all([
					getMachines(),
					getOrders(),
					getEnergy(),
					getDecisions(),
				]);
				setMachines(m);
				setOrders(o);
				setEnergy(e);
				setDecisions(d);
			} catch (err) {
				console.error("Failed to fetch initial data", err);
			} finally {
				setLoading(false);
			}
		}
		fetchInitial();
	}, []);

	// ---- Live updates via SSE ----
	useEffect(() => {
		const evtSource = subscribeToEvents((event: MessageEvent) => {
			if (event.type === "decision") {
				const data: DecisionEvent = JSON.parse(event.data);
				// normalize decision to a JSON string so components that expect a string
				// (from initial fetch) don't receive a raw object from SSE
				const decisionString =
					typeof data.decision === "string"
						? data.decision
						: JSON.stringify(data.decision);

				setDecisions((prev) => [
					{
						id: Date.now(),
						agent: data.agent,
						decision: decisionString,
						created_at: data.created_at,
					},
					...prev,
				]);
			}


			if (event.type === "state_update") {
				const data: StateUpdateEvent[] = JSON.parse(event.data);
				setMachines((prev) =>
					prev.map((m) => {
						const upd = data.find((u) => u.machine_id === m.id);
						return upd
							? {
									...m,
									status: upd.new_status as Machine["status"],
									utilization: upd.new_utilization,
							  }
							: m;
					})
				);
			}
		});

		return () => {
			evtSource.close();
		};
	}, []);

	return {
		machines,
		orders,
		energy,
		decisions,
		loading,
	};
}
