import type { AgentDecision } from "../../lib/types";

export default function DecisionLog({
	decisions,
}: {
	decisions: AgentDecision[];
}) {
	return (
		<div className="bg-white shadow rounded-xl p-3">
			<h2 className="font-semibold text-lg mb-2">Agent Decisions</h2>
			<ul className="max-h-40 overflow-y-auto space-y-2">
				{decisions.map((d) => (
					<li key={d.id} className="text-sm border-b pb-1">
						<p className="font-medium">{d.agent}</p>
						<p className="text-gray-600 text-xs">
							{new Date(d.created_at).toLocaleTimeString()}
						</p>
						<pre className="bg-gray-100 p-1 rounded text-xs whitespace-pre-wrap">
							{d.decision}
						</pre>
					</li>
				))}
			</ul>
		</div>
	);
}
