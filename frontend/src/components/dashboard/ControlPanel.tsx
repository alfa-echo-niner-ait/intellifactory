import React, { useState } from "react";
import { runAllAgents, runAgent } from "../../lib/api";
import { Play, Package, Zap, Wrench, Truck, RefreshCw } from "lucide-react";

type AgentKey = "production" | "energy" | "quality" | "maintenance" | "supply";

function ActionButton({
	label,
	icon,
	onClick,
	loading,
	variant = "secondary",
}: {
	label: string;
	icon: React.ReactElement;
	onClick: () => Promise<void> | void;
	loading?: boolean;
	variant?: "primary" | "secondary";
}) {
	const primary =
		"inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
	const primaryStyle =
		"bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500";
	const secondaryStyle =
		"bg-slate-50 text-slate-800 hover:bg-slate-100 ring-1 ring-slate-100";

	return (
		<button
			onClick={onClick}
			disabled={!!loading}
			className={`${primary} ${variant === "primary" ? primaryStyle : secondaryStyle}`}
			aria-busy={loading ? "true" : "false"}
		>
			<span className={`${loading ? "opacity-0" : "opacity-100"}`}>{icon}</span>
			{loading ? (
				<RefreshCw className="animate-spin" size={16} />
			) : null}
			<span>{label}</span>
		</button>
	);
}

export default function ControlPanel() {
	const [loadingAgent, setLoadingAgent] = useState<string | null>(null);

	async function handleRunAll() {
		try {
			setLoadingAgent("all");
			await runAllAgents();
		} finally {
			setLoadingAgent(null);
		}
	}

	async function handleRun(agent: AgentKey) {
		try {
			setLoadingAgent(agent);
			await runAgent(agent);
		} finally {
			setLoadingAgent(null);
		}
	}

	return (
		<div className="bg-white shadow-md rounded-xl p-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-semibold text-lg">Controls</h2>
					<p className="text-sm text-slate-500">Trigger agents and operations across the digital twin.</p>
				</div>
				<div className="hidden sm:flex items-center gap-2">
					<ActionButton
						label="All"
						icon={<Play size={16} className="text-white" />}
						onClick={handleRunAll}
						loading={loadingAgent === "all"}
						variant="primary"
					/>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
				<ActionButton
					label="Production"
					icon={<Package size={16} className="text-slate-700" />}
					onClick={() => handleRun("production")}
					loading={loadingAgent === "production"}
					variant="secondary"
				/>

				<ActionButton
					label="Energy"
					icon={<Zap size={16} className="text-amber-600" />}
					onClick={() => handleRun("energy")}
					loading={loadingAgent === "energy"}
				/>

				<ActionButton
					label="Quality"
					icon={<Wrench size={16} className="text-sky-600" />}
					onClick={() => handleRun("quality")}
					loading={loadingAgent === "quality"}
				/>

				<ActionButton
					label="Maintenance"
					icon={<Truck size={16} className="text-emerald-600" />}
					onClick={() => handleRun("maintenance")}
					loading={loadingAgent === "maintenance"}
				/>

				<ActionButton
					label="Supply"
					icon={<Package size={16} className="text-violet-600" />}
					onClick={() => handleRun("supply")}
					loading={loadingAgent === "supply"}
				/>

				{/* Small visible Run All for mobile */}
				<div className="sm:hidden">
					<ActionButton
						label="Run All"
						icon={<Play size={16} className="text-white" />}
						onClick={handleRunAll}
						loading={loadingAgent === "all"}
						variant="primary"
					/>
				</div>
			</div>
		</div>
	);
}
