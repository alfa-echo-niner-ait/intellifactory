import type { Machine } from "../../lib/types";
import { Cpu, Activity } from "lucide-react";

function StatusPill({ status }: { status: Machine["status"] }) {
	const map = {
		running: { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
		idle: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
		maintenance: { color: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
	} as const;

	const meta = map[status] ?? map.idle;

	return (
		<span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${meta.color}`}>
			<span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
			<span className="capitalize">{status}</span>
		</span>
	);
}

export default function MachineList({
	machines,
	selectedId,
	onSelect,
}: {
	machines: Machine[];
	selectedId?: number | null;
	onSelect?: (id: number) => void;
}) {
	return (
		<div className="bg-white shadow-md rounded-xl p-4">
			<div className="flex items-center justify-between mb-3">
				<h2 className="font-semibold text-lg flex items-center gap-2">
					<Cpu size={18} className="text-slate-700" /> Machines
				</h2>
				<p className="text-sm text-slate-500">{machines.length} total</p>
			</div>

			<ul className="space-y-3">
				{machines.map((m) => {
					const isSelected = selectedId === m.id;
					return (
						<li
							key={m.id}
							onClick={() => onSelect && onSelect(m.id)}
							className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-shadow cursor-pointer ${
								isSelected ? "border-sky-300 bg-sky-50 shadow" : "border-slate-100 hover:shadow-sm bg-white"
							}`}
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50">
									<Activity size={20} className="text-slate-700" />
								</div>
								<div className="min-w-0">
									<p className="font-medium truncate">{m.name}</p>
									<div className="mt-1 flex items-center gap-2">
										<StatusPill status={m.status} />
										<span className="text-xs text-slate-400">ID: {m.id}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col items-end w-36">
								<div className="text-sm font-medium text-slate-700">{m.utilization}%</div>
								<div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
									<div
										className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
										style={{ width: `${m.utilization}%` }}
									/>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
