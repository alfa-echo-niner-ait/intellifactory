import { Html } from "@react-three/drei";
import type { Machine } from "../../lib/types";
import { useState } from "react";

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

	const color =
		machine.status === "running"
			? "#10B981" // green-500
			: machine.status === "idle"
			? "#F59E0B" // amber-500
			: "#EF4444"; // red-500

	const scaleY = Math.max(0.2, machine.utilization / 50); // utilization scaling

	// Pick shape by machine id (just to vary visuals)
	const shapes = ["box", "sphere", "cylinder", "cone", "torus"];
	const shape = shapes[machine.id % shapes.length];

	const outline = hovered || selected;

	return (
		<group position={position}>
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
				scale={outline ? [1.05, 1.05, 1.05] : [1, 1, 1]}
			>
				{shape === "box" && (
					<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
						<boxGeometry args={[1, 1, 1]} />
						<meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
					</mesh>
				)}
				{shape === "sphere" && (
					<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
						<sphereGeometry args={[0.7, 32, 32]} />
						<meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
					</mesh>
				)}
				{shape === "cylinder" && (
					<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
						<cylinderGeometry args={[0.5, 0.5, 1, 32]} />
						<meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
					</mesh>
				)}
				{shape === "cone" && (
					<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
						<coneGeometry args={[0.5, 1, 32]} />
						<meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
					</mesh>
				)}
				{shape === "torus" && (
					<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
						<torusGeometry args={[0.5, 0.2, 16, 100]} />
						<meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
					</mesh>
				)}

				{/* subtle selection ring */}
				{outline && (
					<mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
						<ringGeometry args={[0.9, 1.15, 32]} />
						<meshBasicMaterial color={selected ? "#2563EB" : "#60A5FA"} transparent opacity={0.35} side={2} />
					</mesh>
				)}
			</group>

			{/* Machine Label */}
			<Html center position={[0, scaleY + 0.8, 0]}>
				<div className="bg-white px-2 py-1 rounded text-xs shadow cursor-pointer">
					{machine.name} ({machine.utilization}%)
				</div>
			</Html>
		</group>
	);
}
