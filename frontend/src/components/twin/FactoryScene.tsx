import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Grid, OrbitControls, ContactShadows } from "@react-three/drei";
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
	// arrange machines in a tidy grid (2 columns by n/2 rows) for a more realistic floor layout
	const cols = 2;
	const rows = Math.ceil(machines.length / cols);

	return (
		<Canvas shadows camera={{ position: [8, 8, 14], fov: 50 }}>
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
				<planeGeometry args={[40, 40]} />
				<meshStandardMaterial color="#e6e7e9" metalness={0.1} roughness={0.85} />
			</mesh>

			{/* Soft contact shadows under objects */}
			<ContactShadows position={[0, -1.02, 0]} opacity={0.6} width={30} height={30} blur={2} far={4} />

			{/* Grid lines for layout guidance */}
			<Grid args={[40, 40]} position={[0, -0.99, 0]} cellColor="#e0e6ea" sectionColor="#cbd5de" />

			{/* Simple factory walls to give depth */}
			<mesh position={[0, 4, -20]}>
				<boxGeometry args={[40, 8, 0.5]} />
				<meshStandardMaterial color="#f8fafc" metalness={0.05} roughness={0.9} />
			</mesh>
			<mesh position={[-20, 4, 0]}>
				<boxGeometry args={[0.5, 8, 40]} />
				<meshStandardMaterial color="#f8fafc" metalness={0.05} roughness={0.9} />
			</mesh>
			<mesh position={[20, 4, 0]}>
				<boxGeometry args={[0.5, 8, 40]} />
				<meshStandardMaterial color="#f8fafc" metalness={0.05} roughness={0.9} />
			</mesh>

			{/* Machines arranged in a neat grid with spacing and aisles */}
			{machines.map((m, idx) => {
				const col = idx % cols;
				const row = Math.floor(idx / cols);
				const x = col * 6 - (cols - 1) * 3; // spacing columns
				const z = row * 6 - (rows - 1) * 3; // spacing rows
				return (
					<Machine3D
						key={m.id}
						machine={m}
						position={[x, 0, z]}
						onClick={() => onSelectMachine && onSelectMachine(m.id)}
						selected={selectedMachineId === m.id}
					/>
				);
			})}

			<OrbitControls />
		</Canvas>
	);
}
