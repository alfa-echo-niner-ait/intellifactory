import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { EnergyPrice } from "../../lib/types";

export default function EnergyChart({ energy }: { energy: EnergyPrice[] }) {
	const data = energy.map((e) => ({
		time: new Date(e.timestamp).toLocaleTimeString(),
		price: e.price_per_kwh,
	}));

	return (
		<div className="bg-white shadow rounded-xl p-3">
			<h2 className="font-semibold text-lg mb-2">Energy Prices</h2>
			<ResponsiveContainer width="100%" height={150}>
				<LineChart data={data}>
					<XAxis dataKey="time" hide />
					<YAxis />
					<Tooltip />
					<Line
						type="monotone"
						dataKey="price"
						stroke="#3b82f6"
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
