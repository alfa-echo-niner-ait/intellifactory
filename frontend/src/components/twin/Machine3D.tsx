import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Machine } from "../../lib/types";
import { useRef, useState } from "react";
import type { Mesh, Group } from "three";

export default function Machine3D({
	machine,
	position,
	onClick,
	selected = false,
}: {
	machine: Machine;
	position: [number, number, number];
	onClick?: () => void;
	selected?: boolean;
}) {
	const [hovered, setHovered] = useState(false);
	const fanRef = useRef<Mesh | null>(null);
	const rollersRef = useRef<Group | null>(null);

	const statusColor =
		machine.status === "running"
			? "#10B981"
			: machine.status === "idle"
			? "#F59E0B"
			: "#EF4444";

	// normalized 0..1
	const util = Math.max(0, Math.min(1, (machine.utilization ?? 0) / 100));

	// animate an activity fan and conveyor rollers based on utilization
	useFrame((_state, delta: number) => {
		if (fanRef.current) fanRef.current.rotation.y += 2 * util * delta + (machine.status === "running" ? 0.6 * delta : 0);
		if (rollersRef.current) rollersRef.current.rotation.x += 4 * util * delta;
	});

	const outline = hovered || selected;

	return (
		<group position={position}>
			{/* Base platform */}
			<group
				onPointerOver={(e) => {
					e.stopPropagation();
					setHovered(true);
				}}
				onPointerOut={(e) => {
					e.stopPropagation();
					setHovered(false);
				}}
				onClick={(e) => {
					e.stopPropagation();
					if (onClick) onClick();
				}}
				scale={outline ? [1.04, 1.04, 1.04] : [1, 1, 1]}
			>
				{/* platform */}
				<mesh castShadow receiveShadow position={[0, 0.15, 0]}>
					<boxGeometry args={[2.4, 0.3, 1.6]} />
					<meshStandardMaterial color="#d1d5db" metalness={0.2} roughness={0.7} />
				</mesh>

				{/* main body */}
				<mesh castShadow position={[0, 0.9, 0]}>
					<boxGeometry args={[1.4, 1.2, 1]} />
					<meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.25} />
				</mesh>

				{/* control panel */}
				<mesh position={[0.95, 0.95, 0.4]} rotation={[0, -0.4, 0]}>
					<boxGeometry args={[0.6, 0.3, 0.2]} />
					<meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} />
				</mesh>

				{/* status lamp */}
				<mesh position={[0.95, 1.25, -0.25]}>
					<sphereGeometry args={[0.08, 12, 12]} />
					<meshStandardMaterial emissive={statusColor} emissiveIntensity={0.8} color="#374151" />
				</mesh>

				{/* activity fan (rotating) */}
				<group position={[-0.5, 1.05, 0]}>
					<mesh ref={fanRef}>
						<cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
						<meshStandardMaterial color="#94a3b8" />
					</mesh>
					<mesh rotation={[0, 0, Math.PI / 4]} position={[-0.0, 0, 0]}> 
						<boxGeometry args={[0.6, 0.02, 0.02]} />
						<meshStandardMaterial color="#64748b" />
					</mesh>
				</group>

				{/* small conveyor (rollers) */}
				<group position={[0, 0.5, 0.95]}>
					<mesh position={[0, -0.02, 0]}> 
						<boxGeometry args={[1.8, 0.06, 0.2]} />
						<meshStandardMaterial color="#0b1220" metalness={0.5} roughness={0.3} />
					</mesh>
					<group ref={rollersRef} position={[0, -0.02, 0]}> 
						{[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
							<mesh key={i} position={[x, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}> 
								<cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
								<meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} />
							</mesh>
						))}
					</group>
				</group>

				{/* subtle selection ring */}
				{outline && (
					<mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
						<ringGeometry args={[1.2, 1.5, 48]} />
						<meshBasicMaterial color={selected ? "#2563EB" : "#60A5FA"} transparent opacity={0.25} side={2} />
					</mesh>
				)}
			</group>

			{/* Machine Label */}
			<Html center position={[0, 1.7, 0]}>
				<div className={`bg-white px-3 py-1 rounded text-xs shadow cursor-pointer`}>{machine.name} — {Math.round((machine.utilization ?? 0))}%</div>
			</Html>
		</group>
	);
}
