import type { AgentDecision } from "../../lib/types";
import { Clock, Zap, Activity, List, MessageSquare } from "lucide-react";

type ParsedDecision = {
	actions?: Array<{ action: string; machine_id?: string | number; value?: string | number }>;
	impact?: { energy_change_percent?: number; throughput_change_percent?: number; notes?: string };
};

function ImpactPill({ icon, children, color }: { icon: React.ReactElement; children: React.ReactNode; color?: string }) {
	return (
		<span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${color ?? "bg-slate-50 text-slate-700"}`}>
			{icon}
			<span>{children}</span>
		</span>
	);
}

export default function DecisionLog({ decisions }: { decisions: AgentDecision[] }) {
	return (
		<div className="bg-white shadow-md rounded-xl p-4">
			<div className="flex items-center justify-between mb-3">
				<h2 className="font-semibold text-lg flex items-center gap-2">
					<List size={18} className="text-slate-700" /> Agent Decisions
				</h2>
				<p className="text-sm text-slate-500">{decisions.length} entries</p>
			</div>

			<ul className="max-h-56 overflow-y-auto space-y-3">
				{decisions.map((d) => {
					let parsed: ParsedDecision | null = null;
					try {
						parsed = JSON.parse(d.decision) as ParsedDecision;
					} catch {
						parsed = null;
					}

					return (
						<li
							key={d.id}
							className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:shadow-sm bg-white"
						>
							<div className="flex items-start gap-3 min-w-0">
								<div className="h-10 w-10 rounded-md bg-slate-50 flex items-center justify-center">
									<MessageSquare size={18} className="text-slate-700" />
								</div>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-medium truncate">{d.agent}</p>
										<span className="text-xs text-slate-400">•</span>
										<time className="text-xs text-slate-400">
											<Clock size={12} className="inline-block mr-1 text-slate-400" />
											{new Date(d.created_at).toLocaleTimeString()}
										</time>
									</div>

									<div className="mt-2">
										{parsed ? (
											<div className="space-y-2">
												{parsed.actions && parsed.actions.length > 0 ? (
													<ul className="space-y-1">
														{parsed.actions.map((a, idx) => (
															<li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
																<span className="inline-flex items-center justify-center h-5 w-5 rounded bg-slate-100 text-slate-600">
																	<List size={12} />
																</span>
																<span className="truncate">{a.action} → Machine {a.machine_id} {a.value ? `(${a.value})` : null}</span>
															</li>
														))}
													</ul>
												) : (
													<div className="text-sm text-slate-500">No actions taken</div>
												)}

												<div className="mt-1 flex flex-wrap items-center gap-2">
													<ImpactPill icon={<Zap size={12} />} color="bg-amber-50 text-amber-700">
														{parsed.impact?.energy_change_percent ?? 0}%
													</ImpactPill>
													<ImpactPill icon={<Activity size={12} />} color="bg-sky-50 text-sky-700">
														{parsed.impact?.throughput_change_percent ?? 0}%
													</ImpactPill>
													{parsed.impact?.notes ? (
														<ImpactPill icon={<MessageSquare size={12} />} color="bg-slate-50 text-slate-700">
															{parsed.impact.notes}
														</ImpactPill>
													) : null}
												</div>
											</div>
										) : (
											<pre className="bg-slate-100 text-xs p-2 rounded-md overflow-x-auto">{d.decision}</pre>
										)}
									</div>
								</div>
							</div>

							{/* placeholder for potential actions */}
							<div className="shrink-0 text-xs text-slate-400">ID {d.id}</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
