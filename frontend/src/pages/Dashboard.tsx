import FactoryScene from "../components/twin/FactoryScene";
import MachineList from "@/components/dashboard/MachineList";
import OrdersTable from "../components/dashboard/OrdersTable";
import EnergyChart from "../components/dashboard/EnergyChart";
import DecisionLog from "../components/dashboard/DecisionLog";
import { useFactoryData } from "../hooks/useFactoryData";

export default function Dashboard() {
	const { machines, orders, energy, decisions, loading } = useFactoryData();

	if (loading) return <div className="p-4">Loading factory data...</div>;

	return (
		<div className="flex h-screen">
			{/* Left: 3D Twin */}
			<div className="flex-1 bg-gray-100">
				<FactoryScene machines={machines} />
			</div>

			{/* Right: Dashboard panels */}
			<div className="w-[400px] bg-white border-l p-4 space-y-4 overflow-y-auto">
				<MachineList machines={machines} />
				<OrdersTable orders={orders} />
				<EnergyChart energy={energy} />
				<DecisionLog decisions={decisions} />
			</div>
		</div>
	);
}
