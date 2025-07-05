import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, TransformControls } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
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

function Edge({ from, to, color = 'white', label, curve = 'straight' }: { from: [number, number, number]; to: [number, number, number]; color?: string; label?: string; curve?: 'straight'|'bezier' }) {
  const start = useMemo(() => new THREE.Vector3(...from), [from]);
  const end = useMemo(() => new THREE.Vector3(...to), [to]);
  const points = useMemo(() => {
    if(curve==='bezier'){
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const c1 = start.clone().lerp(mid,0.5).add(new THREE.Vector3(0,0.5,0));
      const c2 = end.clone().lerp(mid,0.5).add(new THREE.Vector3(0,-0.5,0));
      const curve3 = new THREE.CubicBezierCurve3(start,c1,c2,end);
      return curve3.getPoints(20);
    }
    return [start,end];
  },[start,end,curve]);
  const geometry = useMemo(()=>{
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  },[points]);
  const midPoint = useMemo(()=>points[Math.floor(points.length/2)],[points]);
  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial attach="material" color={color} />
      </line>
      {label && (
        <Text position={midPoint.toArray() as [number,number,number]} fontSize={0.25} color={color} anchorX="center" anchorY="middle">{label}</Text>
      )}
    </group>
  );
}

export default function GraphCanvas({ data }: GraphCanvasProps) {
  const [dragRect, setDragRect] = useState<{x:number,y:number,w:number,h:number}|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleSelect = useCanvasStore((s)=>s.toggleSelect);
  const clearSel = useCanvasStore((s)=>s.clearSelection);
  const showMenu = useCanvasStore((s)=>s.showContextMenu);

  const onMouseDown=(e: React.MouseEvent)=>{
    if(e.button!==0) return;
    if((e.target as HTMLElement).closest('canvas')===null) return;
    const startX=e.clientX, startY=e.clientY;
    setDragRect({x:startX,y:startY,w:0,h:0});
    clearSel();
    const move=(ev:MouseEvent)=>{
      const w=ev.clientX-startX, h=ev.clientY-startY;
      setDragRect({x:startX,y:startY,w,h});
    };
    const up=(ev:MouseEvent)=>{
      window.removeEventListener('mousemove',move);
      window.removeEventListener('mouseup',up);
      if(dragRect){
        // perform selection
        const rect = {left: Math.min(startX,startX+dragRect.w), right: Math.max(startX,startX+dragRect.w), top: Math.min(startY,startY+dragRect.h), bottom: Math.max(startY,startY+dragRect.h)};
        // convert nodes to screen coords
        const { camera, size } = (containerRef.current?.firstChild as any)?._root?.store.state.gl ?? {};
      }
      setDragRect(null);
    };
    window.addEventListener('mousemove',move);
    window.addEventListener('mouseup',up);
  };

  const onContext=(e:React.MouseEvent)=>{
    e.preventDefault();
    showMenu({type:'canvas', x:e.clientX, y:e.clientY});
  };

  return (
    <div ref={containerRef} className="canvas-wrapper" onMouseDown={onMouseDown} onContextMenu={onContext}>
    <Canvas camera={{ position: [3, 3, 3] }}>
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
    {dragRect && (
      <div style={{position:'fixed', pointerEvents:'none', border:'1px dashed #fff', background:'rgba(255,255,255,0.1)', left:dragRect.x, top:dragRect.y, width:dragRect.w, height:dragRect.h, zIndex:999 }} />
    )}
    </div>
  );
}