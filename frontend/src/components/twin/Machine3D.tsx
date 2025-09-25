import { Html } from "@react-three/drei";
import type { Machine } from "../../lib/types";

export default function Machine3D({
	machine,
	position,
}: {
	machine: Machine;
	position: [number, number, number];
}) {
	const color =
		machine.status === "running"
			? "green"
			: machine.status === "idle"
			? "yellow"
			: "red";

	const scaleY = Math.max(0.2, machine.utilization / 50); // utilization scaling

	// Pick shape by machine id (just to vary visuals)
	const shapes = ["box", "sphere", "cylinder", "cone", "torus"];
	const shape = shapes[machine.id % shapes.length];

	return (
		<group position={position}>
			{shape === "box" && (
				<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
					<boxGeometry args={[1, 1, 1]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)}
			{shape === "sphere" && (
				<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
					<sphereGeometry args={[0.7, 32, 32]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)}
			{shape === "cylinder" && (
				<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
					<cylinderGeometry args={[0.5, 0.5, 1, 32]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)}
			{shape === "cone" && (
				<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
					<coneGeometry args={[0.5, 1, 32]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)}
			{shape === "torus" && (
				<mesh castShadow receiveShadow scale={[1, scaleY, 1]}>
					<torusGeometry args={[0.5, 0.2, 16, 100]} />
					<meshStandardMaterial color={color} />
				</mesh>
			)}

			{/* Machine Label */}
			<Html center position={[0, scaleY + 0.8, 0]}>
				<div className="bg-white px-2 py-1 rounded text-xs shadow">
					{machine.name} ({machine.utilization}%)
				</div>
			</Html>
		</group>
	);
}
