import React from "react";
import type { Machine, Order, EnergyPrice } from "../../lib/types";
import { Cpu, Package, ShoppingCart, Zap, RefreshCw } from "lucide-react";

function StatCard({
	title,
	value,
	icon,
	accent = "bg-indigo-50 text-indigo-600",
}: {
	title: string;
	value: React.ReactNode;
	icon: React.ReactElement;
	accent?: string;
}) {
	return (
		<div className="flex items-center gap-4 p-3 bg-white/70 dark:bg-slate-800/60 rounded-lg shadow-sm ring-1 ring-slate-100">
			<div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
				{icon}
			</div>
			<div className="flex flex-col">
				<span className="text-xs text-slate-500">{title}</span>
				<span className="font-semibold text-sm">{value}</span>
			</div>
		</div>
	);
}

export default function Header({
	machines,
	orders,
	energy,
}: {
	machines: Machine[];
	orders: Order[];
	energy: EnergyPrice[];
}) {
	const running = machines.filter((m) => m.status === "running").length;
	const idle = machines.filter((m) => m.status === "idle").length;
	const maintenance = machines.filter((m) => m.status === "maintenance").length;

	const activeOrders = orders.filter((o) => o.status !== "completed").length;

	const avgEnergy =
		energy.length > 0
			? (
					energy.reduce((sum, e) => sum + e.price_per_kwh, 0) / energy.length
			  ).toFixed(2)
			: "N/A";

	const avgUtilization =
		machines.length > 0
			? Math.round(
					machines.reduce((sum, m) => sum + m.utilization, 0) / machines.length
			  )
			: 0;

	return (
		<header className="mb-4 mt-3">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
				<div className="flex items-start gap-3">
					<div className="rounded-md bg-gradient-to-tr from-indigo-500 to-sky-400 p-2 shadow-md">
						<Cpu className="text-white" size={22} />
					</div>
					<div>
						<h1 className="text-lg font-bold">IntelliFactory Twin</h1>
						<p className="text-sm text-slate-500">Real-time digital twin monitoring & optimization</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button
						className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ring-1 ring-slate-100"
						title="Refresh metrics"
						aria-label="Refresh metrics"
					>
						<RefreshCw size={16} />
						Refresh
					</button>
				</div>
			</div>

			<div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-4 px-4">
				<StatCard
					title="Machines (R / I / M)"
					value={
						<span className="flex items-center gap-2">
							<span className="text-green-600 font-medium">{running}</span>
							<span className="text-amber-500">{idle}</span>
							<span className="text-rose-500">{maintenance}</span>
						</span>
					}
					icon={<Package size={18} className="text-indigo-700" />}
					accent="bg-indigo-50 text-indigo-600"
				/>

				<StatCard
					title="Active Orders"
					value={<span className="text-slate-900">{activeOrders}</span>}
					icon={<ShoppingCart size={18} className="text-amber-600" />}
					accent="bg-amber-50 text-amber-600"
				/>

				<StatCard
					title="Avg Energy"
					value={<span>{avgEnergy} ¥/kWh</span>}
					icon={<Zap size={18} className="text-emerald-600" />}
					accent="bg-emerald-50 text-emerald-600"
				/>

				<StatCard
					title="Throughput"
					value={<span>{avgUtilization}%</span>}
					icon={<ActivityIconPlaceholder />}
					accent="bg-sky-50 text-sky-600"
				/>
			</div>
		</header>
	);
}

function ActivityIconPlaceholder() {
	// using a simple SVG inline so we don't add extra imports; keeps bundle small
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-600">
			<path d="M3 12h3l2-6 4 12 3-8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
