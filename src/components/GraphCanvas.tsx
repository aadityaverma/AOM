import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { GraphData } from '../types';

interface GraphCanvasProps {
  data: GraphData;
}

function Node({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#61dafb" />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function Edge({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from, to]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color="white" />
    </line>
  );
}

export default function GraphCanvas({ data }: GraphCanvasProps) {
  return (
    <Canvas camera={{ position: [3, 3, 3] }} className="canvas-wrapper">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {data.edges.map((edge, idx) => {
        const fromNode = data.nodes.find((n) => n.id === edge.from);
        const toNode = data.nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        return <Edge key={idx} from={fromNode.position} to={toNode.position} />;
      })}

      {data.nodes.map((node) => (
        <Node key={node.id} position={node.position} label={node.label} />
      ))}

      <OrbitControls />
    </Canvas>
  );
}