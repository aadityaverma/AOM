import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, TransformControls } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { CanvasData } from '../types';
import { useCanvasStore } from '../store';

interface GraphCanvasProps {
  data: CanvasData;
}

function Node({ id, position, label }: { id: string; position: [number, number, number]; label?: string }) {
  const selected = useCanvasStore((s) => s.selectedNodeIds.has(id));
  const toggleSelect = useCanvasStore((s)=>s.toggleSelect);
  const nodeClick = useCanvasStore((s)=>s.nodeClicked);
  return (
    <TransformControls>
      <group position={position}>
        <mesh
          onClick={(e)=>{
            e.stopPropagation();
            const additive = e.shiftKey || e.ctrlKey || e.metaKey;
            toggleSelect(id, additive);
            nodeClick(id);
          }}
          onContextMenu={(e)=>{
            e.preventDefault();
            const showMenu = useCanvasStore.getState().showContextMenu;
            showMenu({type:'node', id, x:e.clientX, y:e.clientY});
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={selected ? '#ff6b6b' : '#61dafb'} />
        </mesh>
        {label && (
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )}
      </group>
    </TransformControls>
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

      {/* helpers */}
      <gridHelper args={[50, 50, '#444', '#222']} />
      <axesHelper args={[5]} />

      {data.edges.map((edge, idx) => {
        const fromNode = data.nodes.find((n) => n.id === edge.from);
        const toNode = data.nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        return <Edge key={idx} from={fromNode.position} to={toNode.position} />;
      })}

      {data.nodes.map((node) => (
        <Node key={node.id} id={node.id} position={node.position} label={node.label} />
      ))}

      <OrbitControls />
    </Canvas>
  );
}