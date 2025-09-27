import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import Machine3D from "./Machine3D";
import type { Machine } from "../../lib/types";
import { useEffect } from "react";

type Props = {
	machines: Machine[];
	onSelectMachine?: (id: number) => void;
	selectedMachineId?: number | null;
};

const CameraController: React.FC = () => {
	const { camera } = useThree();

	useEffect(() => {
		camera.position.set(10, 8, 10);
		camera.lookAt(0, 0, 0);
	}, [camera]);

	return null;
};

export default function FactoryScene({ machines, onSelectMachine, selectedMachineId }: Props) {
	return (
		<Canvas shadows camera={{ position: [5, 5, 10], fov: 50 }}>
			<CameraController />
			{/* Lighting */}
			<ambientLight intensity={0.6} />
			<directionalLight
				position={[10, 10, 5]}
				intensity={1}
				castShadow
				shadow-mapSize={[1024, 1024]}
			/>
			<pointLight position={[-10, -10, -10]} intensity={0.3} />

			{/* Environment */}
			<Environment preset="warehouse" />

			{/* Factory floor */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
				<planeGeometry args={[20, 20]} />
				<meshStandardMaterial color="#f3f4f6" />
			</mesh>

			{/* Grid lines */}
			<Grid
				args={[20, 20]}
				position={[0, -0.99, 0]}
				cellColor="#d1d5db"
				sectionColor="#9ca3af"
			/>

			{/* Machines */}
			{machines.map((m, idx) => (
				<Machine3D
					key={m.id}
					machine={m}
					position={[idx * 3 - (machines.length - 1) * 1.5, 0, 0]}
					onClick={() => onSelectMachine && onSelectMachine(m.id)}
					selected={selectedMachineId === m.id}
				/>
			))}

			<OrbitControls />
		</Canvas>
	);
}
