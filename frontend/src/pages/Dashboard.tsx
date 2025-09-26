import Header from "../components/layout/Header";
import FactoryScene from "../components/twin/FactoryScene";
import MachineList from "../components/dashboard/MachineList";
import OrdersTable from "../components/dashboard/OrdersTable";
import EnergyChart from "../components/dashboard/EnergyChart";
import DecisionLog from "../components/dashboard/DecisionLog";
import ControlPanel from "../components/dashboard/ControlPanel";
import { useFactoryData } from "../hooks/useFactoryData";

export default function Dashboard() {
	const { machines, orders, energy, decisions, loading } = useFactoryData();

	if (loading) return <div className="p-4">Loading factory data...</div>;

	return (
		<div className="flex h-screen">
			{/* Left: Factory */}
			<div className="flex-1 bg-gray-100 flex flex-col">
				<Header machines={machines} orders={orders} energy={energy} />
				<div className="flex-1">
					<FactoryScene machines={machines} />
				</div>
			</div>

			{/* Right: Dashboard */}
			<div className="w-[500px] bg-gray-50 border-l p-4 space-y-4 overflow-y-auto">
				<ControlPanel />
				<MachineList machines={machines} />
				<OrdersTable orders={orders} />
				<EnergyChart energy={energy} />
				<DecisionLog decisions={decisions} />
			</div>
		</div>
	);
}
