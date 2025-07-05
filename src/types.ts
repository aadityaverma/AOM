export interface NodeData {
  id: string;
  label: string;
  position: [number, number, number];
}

export interface EdgeData {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}