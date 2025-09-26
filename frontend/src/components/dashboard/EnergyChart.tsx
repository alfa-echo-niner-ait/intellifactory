import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Area,
	CartesianGrid,
} from "recharts";
import type { EnergyPrice } from "../../lib/types";
import { Zap } from "lucide-react";

type TooltipProps = {
	active?: boolean;
	payload?: Array<{ payload: { time: string; price: number } }>;
};

function CustomTooltip({ active, payload }: TooltipProps) {
	if (!active || !payload || payload.length === 0) return null;
	const p = payload[0].payload;
	return (
		<div className="bg-white/95 ring-1 ring-slate-200 rounded-md shadow-sm p-2 text-xs">
			<div className="font-medium">{p.time}</div>
			<div className="text-slate-600">{p.price} ¥/kWh</div>
		</div>
	);
}

export default function EnergyChart({ energy }: { energy: EnergyPrice[] }) {
	const data = energy.map((e) => ({
		time: new Date(e.timestamp).toLocaleTimeString(),
		price: e.price_per_kwh,
	}));

	const latest = data.length > 0 ? data[data.length - 1].price : null;

	return (
		<div className="bg-white shadow-md rounded-xl p-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-semibold text-lg flex items-center gap-2">
						<span className="rounded-md bg-amber-100 p-1">
							<Zap className="text-amber-600" size={16} />
						</span>
						Energy Prices
					</h2>
					<p className="text-sm text-slate-500">Recent price per kWh (¥)</p>
				</div>

				<div className="flex items-baseline gap-2">
					<div className="text-xs text-slate-500">Latest</div>
					<div className="text-xl font-semibold text-slate-900">
						{latest !== null ? `${latest} ¥/kWh` : "—"}
					</div>
				</div>
			</div>

			<div className="mt-3 h-40">
				{data.length === 0 ? (
					<div className="h-full flex items-center justify-center text-sm text-slate-400">
						No recent energy readings
					</div>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
							<defs>
								<linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#fde68a" stopOpacity={0.9} />
									<stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.2} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
							<XAxis dataKey="time" tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={false} />
							<YAxis tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={false} />
							<Tooltip content={<CustomTooltip />} />
							<Area type="monotone" dataKey="price" stroke="none" fill="url(#gradPrice)" />
							<Line
								type="monotone"
								dataKey="price"
								stroke="#0ea5e9"
								strokeWidth={2.5}
								dot={false}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}
