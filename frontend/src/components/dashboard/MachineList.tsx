import type { Machine } from "../../lib/types";

export default function MachineList({ machines }: { machines: Machine[] }) {
	return (
		<div className="bg-white shadow rounded-xl p-3">
			<h2 className="font-semibold text-lg mb-2">Machines</h2>
			<ul className="space-y-2">
				{machines.map((m) => (
					<li
						key={m.id}
						className="flex items-center justify-between p-2 border rounded-lg"
					>
						<div>
							<p className="font-medium">{m.name}</p>
							<p className="text-sm text-gray-500">
								Status:{" "}
								<span
									className={
										m.status === "running"
											? "text-green-600"
											: m.status === "idle"
											? "text-yellow-600"
											: "text-red-600"
									}
								>
									{m.status}
								</span>
							</p>
						</div>
						<div className="w-24 bg-gray-200 rounded-full h-2">
							<div
								className="bg-blue-500 h-2 rounded-full"
								style={{ width: `${m.utilization}%` }}
							/>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
