import type { Order } from "../../lib/types";

export default function OrdersTable({ orders }: { orders: Order[] }) {
	return (
		<div className="bg-white shadow rounded-xl p-3">
			<h2 className="font-semibold text-lg mb-2">Orders</h2>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left border-b">
						<th>ID</th>
						<th>Customer</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((o) => (
						<tr key={o.id} className="border-b last:border-0">
							<td>{o.id}</td>
							<td>{o.customer}</td>
							<td className="capitalize">{o.status}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
