import { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header";
import FactoryScene from "../components/twin/FactoryScene";
import MachineList from "../components/dashboard/MachineList";
import OrdersTable from "../components/dashboard/OrdersTable";
import EnergyChart from "../components/dashboard/EnergyChart";
import DecisionLog from "../components/dashboard/DecisionLog";
import ControlPanel from "../components/dashboard/ControlPanel";
import { useFactoryData } from "../hooks/useFactoryData";
import type { Machine, StateUpdateEvent } from "../lib/types";
import { updateMachine, suggestAgent, applyActions } from "../lib/api";
import { subscribeToEvents } from "../lib/sse";

export default function Dashboard() {
	const { machines, orders, energy, decisions, loading } = useFactoryData();

	// Local editable copy so UI interactions feel immediate (optimistic / local only)
	const [localMachines, setLocalMachines] = useState<Machine[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [showSidebar, setShowSidebar] = useState(true);

	// Sync incoming machines into local state (preserve user edits while new data arrives)
	useEffect(() => {
		setLocalMachines(machines.map((m) => ({ ...m })));
	}, [machines]);

	const selectedMachine = useMemo(
		() => localMachines.find((m) => m.id === selectedId) ?? null,
		[localMachines, selectedId]
	);

	function handleSelectMachine(id: number) {
		setSelectedId((s) => (s === id ? null : id));
	}

	// Listen for server-sent events and merge machine updates into localMachines
	useEffect(() => {
		const es = subscribeToEvents((event: MessageEvent) => {
			try {
				if (event.type === "machine_update") {
					// backend may send a single update object or an array; parse as unknown and narrow
					const parsedRaw = JSON.parse(event.data) as unknown;
					const rawArr = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];
					const updates = rawArr as Record<string, unknown>[];
					setLocalMachines((prev) =>
						prev.map((m) => {
							const u = updates.find((x) => {
								const mid = typeof x.machine_id === "number" ? (x.machine_id as number) : typeof x.id === "number" ? (x.id as number) : undefined;
								return mid === m.id;
							});
							if (!u) return m;
							const newStatus = typeof u.new_status === "string" ? (u.new_status as string) : typeof u.status === "string" ? (u.status as string) : m.status;
							const newUtil = typeof u.new_utilization === "number" ? (u.new_utilization as number) : typeof u.utilization === "number" ? (u.utilization as number) : m.utilization;
							return {
								...m,
								status: newStatus as Machine["status"],
								utilization: newUtil,
							};
						})
					);
				}

				if (event.type === "state_update") {
					const data = JSON.parse(event.data) as StateUpdateEvent[];
					setLocalMachines((prev) =>
						prev.map((m) => {
							const u = data.find((x) => x.machine_id === m.id);
							if (!u) return m;
							return {
								...m,
								status: (u.new_status ?? m.status) as Machine["status"],
								utilization: u.new_utilization ?? m.utilization,
							};
						})
					);
				}
			} catch (err) {
				console.error("Failed to process SSE event", err);
			}
		});

		return () => es.close();
	}, []);

	// Apply a local update and persist to backend
	function applyLocalUpdate(updates: Partial<Machine> & { id: number }) {
		setLocalMachines((prev) => prev.map((m) => (m.id === updates.id ? { ...m, ...updates } : m)));
		// persist to backend
		(async () => {
			try {
				await updateMachine(updates.id, updates);
			} catch (err) {
				// optionally handle errors: could show toast / revert local changes
				console.error("Failed to persist machine update", err);
			}
		})();
	}

	// Agent suggestions state
	const [suggestions, setSuggestions] = useState<unknown[] | null>(null);
	const [suggestLoading, setSuggestLoading] = useState(false);

	async function requestSuggestions(agentName: string) {
		setSuggestLoading(true);
		try {
			const res = await suggestAgent(agentName);
			// agents return decisions with .actions (array)
			setSuggestions(res.decision?.actions ?? []);
		} catch (err) {
			console.error("suggestion failed", err);
			setSuggestions([]);
		} finally {
			setSuggestLoading(false);
		}
	}

	type UpdateItem = { machine_id?: number; id?: number; new_status?: string; new_utilization?: number };

	async function applySuggestedActions() {
		if (!suggestions || suggestions.length === 0) return;
		try {
			const res = await applyActions(suggestions);
			// optimistic: apply returned updates to local state
			const updates: UpdateItem[] = res.updates ?? [];
			setLocalMachines((prev) => {
				const byId = new Map(prev.map((m) => [m.id, { ...m }]));
				for (const u of updates) {
					const id = u.machine_id ?? u.id;
					if (!id) continue;
					if (byId.has(id)) {
						const m = { ...byId.get(id)! };
						if (u.new_status) m.status = u.new_status as Machine["status"];
						if (u.new_utilization !== undefined) m.utilization = Number(u.new_utilization);
						byId.set(id, m);
					}
				}
				return Array.from(byId.values());
			});
			// clear suggestions after apply
			setSuggestions(null);
		} catch (err) {
			console.error("apply failed", err);
		}
	}

	if (loading) return <div className="p-4">Loading factory data...</div>;

	return (
		<div className="flex flex-col md:flex-row h-screen">
			{/* Left: Factory area */}
			<div className="flex-1 bg-gray-100 flex flex-col">
				<Header machines={machines} orders={orders} energy={energy} />

				<div className="px-4 md:px-6 py-3 flex items-center justify-between md:hidden">
					<div className="text-sm font-medium">Factory View</div>
					<button
						className="text-sm bg-slate-50 px-3 py-1 rounded-md ring-1 ring-slate-100"
						onClick={() => setShowSidebar((s) => !s)}
					>
						{showSidebar ? "Hide Dashboard" : "Show Dashboard"}
					</button>
				</div>

				{/* Canvas container - responsive: full height on desktop, fixed height on mobile */}
				<div className="flex-1 p-4">
					<div
						className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden"
						style={{ minHeight: 320 }}
					>
						<FactoryScene
							machines={localMachines}
							onSelectMachine={handleSelectMachine}
							selectedMachineId={selectedId}
						/>
					</div>
				</div>
			</div>

			{/* Right: Dashboard controls - collapsible on small screens */}
			<aside
				className={`bg-gray-50 border-t md:border-t-0 md:border-l p-4 space-y-4 overflow-y-auto ${
					showSidebar ? "block" : "hidden"
				} md:block w-full md:w-[480px]`}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold">Control & Dashboard</h2>
					<div className="text-xs text-slate-500">Interactive digital twin</div>
				</div>

				<ControlPanel />

				{/* Selected Machine Details */}
				<div className="bg-white p-3 rounded-lg shadow-sm">
					<h2 className="font-semibold text-lg">
						Machine Details
					</h2>
					{selectedMachine ? (
						<div className="mt-2 space-y-3">
							<div className="text-sm font-semibold">
								{selectedMachine.name}
							</div>
							<div className="flex items-center gap-2 text-sm text-slate-600">
								ID: {selectedMachine.id}
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-slate-500">Status:</span>
								<span className="text-sm font-medium">
									{selectedMachine.status}
								</span>
							</div>

							<div>
								<label className="text-xs text-slate-500">
									Utilization: {selectedMachine.utilization}%
								</label>
								<input
									type="range"
									min={0}
									max={100}
									value={selectedMachine.utilization}
										onChange={(e) =>
										applyLocalUpdate({
											id: selectedMachine.id,
											utilization: Number(e.target.value),
										})
									}
									className="w-full"
								/>
							</div>

							<div className="flex gap-2">
								<button
									className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-sm"
									onClick={() =>
										applyLocalUpdate({ id: selectedMachine.id, status: "running" })
									}
								>
									Start
								</button>
								<button
									className="px-3 py-1 rounded-md bg-amber-50 text-amber-700 text-sm"
									onClick={() =>
										applyLocalUpdate({ id: selectedMachine.id, status: "idle" })
									}
								>
									Idle
								</button>
								<button
									className="px-3 py-1 rounded-md bg-rose-50 text-rose-700 text-sm"
									onClick={() =>
										applyLocalUpdate({
											id: selectedMachine.id,
											status: "maintenance",
										})
									}
								>
									Maintenance
								</button>
							</div>
						</div>
					) : (
						<div className="mt-2 text-sm text-slate-500">
							Select a machine in the scene to view or control it.
						</div>
					)}
				</div>

				<MachineList machines={localMachines} selectedId={selectedId} onSelect={handleSelectMachine} />
				<OrdersTable orders={orders} />
				<EnergyChart energy={energy} />
				<DecisionLog decisions={decisions} />

				{/* Agent suggestions / actions */}
				<div className="bg-white p-3 rounded-lg shadow-sm">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium">Agent Suggestions</h3>
						<div className="flex gap-2">
							<button
								className="px-2 py-1 rounded bg-slate-50 text-sm"
								onClick={() => requestSuggestions("EnergyAgent")}
								disabled={suggestLoading}
							>
								Suggest Energy
							</button>
							<button
								className="px-2 py-1 rounded bg-slate-50 text-sm"
								onClick={() => requestSuggestions("MaintenanceAgent")}
								disabled={suggestLoading}
							>
								Suggest Maintenance
							</button>
						</div>
					</div>

					<div className="mt-3">
						{suggestLoading && <div className="text-sm text-slate-500">Requesting suggestions…</div>}

						{!suggestLoading && suggestions && suggestions.length === 0 && (
							<div className="text-sm text-slate-500">No suggestions</div>
						)}

						{!suggestLoading && suggestions && suggestions.length > 0 && (
							<div className="space-y-2">
								<ul className="text-sm text-slate-700 space-y-1">
									{suggestions.map((s, i) => (
										<li key={i} className="p-2 bg-slate-50 rounded">
											<pre className="text-xs truncate">{JSON.stringify(s)}</pre>
										</li>
									))}
								</ul>

								<div className="mt-2 flex gap-2">
									<button
										className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
										onClick={applySuggestedActions}
									>
										Apply Suggestions
									</button>
									<button
										className="px-3 py-1 rounded bg-slate-100 text-sm"
										onClick={() => setSuggestions(null)}
									>
										Dismiss
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</aside>
		</div>
	);
}
