import type { Order } from "../../lib/types";
import { Clock, Activity, CheckCircle, XCircle, User } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

function StatusPill({ status }: { status: string }) {
	const meta =
		status === "pending"
			? {
					label: "Pending",
					icon: <Clock size={14} />,
					className: "bg-amber-50 text-amber-700",
			  }
			: status === "processing"
			? {
					label: "Processing",
					icon: <Activity size={14} />,
					className: "bg-sky-50 text-sky-700",
			  }
			: status === "completed"
			? {
					label: "Completed",
					icon: <CheckCircle size={14} />,
					className: "bg-emerald-50 text-emerald-700",
			  }
			: status === "cancelled"
			? {
					label: "Cancelled",
					icon: <XCircle size={14} />,
					className: "bg-rose-50 text-rose-700",
			  }
			: {
					label: status,
					icon: <Activity size={14} />,
					className: "bg-slate-50 text-slate-700",
			  };

	return (
		<span
			className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${meta.className}`}
		>
			{meta.icon}
			<span className="capitalize">{meta.label}</span>
		</span>
	);
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
	return (
		<div className="bg-white shadow-md rounded-xl p-4">
			<div className="flex items-center justify-between mb-3">
				<h2 className="font-semibold text-lg flex items-center gap-2">
					<User size={18} className="text-slate-700" /> Orders
				</h2>
				<p className="text-sm text-slate-500">{orders.length} orders</p>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Qty</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map((o) => (
							<TableRow key={o.id}>
								<TableCell>{o.id}</TableCell>
								<TableCell>{o.customer}</TableCell>
								<TableCell>
									<StatusPill status={o.status} />
								</TableCell>
								<TableCell className="text-right">{o.quantity}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
