export interface CanvasNode {
  id: string;
  type?: string;
  label?: string;
  file?: string;
  position: [number, number, number];
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface CanvasEdge {
  id?: string;
  from: string;
  to: string;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}