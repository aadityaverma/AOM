import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import GraphCanvas from './components/GraphCanvas';
import ErrorBoundary from './components/ErrorBoundary';
import { CanvasData } from './types';
import { CanvasSchema } from './schema';
import Toolbar from './components/Toolbar';
import { useCanvasStore } from './store';
import ContextMenu from './components/ContextMenu';

// Demo initial JSON
const defaultContent = `{
  "nodes": [
    { "id": "1", "type": "text", "label": "Start", "x": 0, "y": 0 },
    { "id": "2", "type": "text", "label": "Next", "x": 300, "y": 150 },
    { "id": "3", "type": "text", "label": "Alt", "x": -300, "y": 150 }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "1", "to": "3" }
  ]
}`;

function parseGraph(jsonStr: string): { data: CanvasData; errors: string[] } {
  try {
    const obj = JSON.parse(jsonStr);
    const parsed = CanvasSchema.safeParse(obj);
    if (parsed.success) {
      // Normalize positions into [x,y,z]
      const normalized: CanvasData = {
        nodes: parsed.data.nodes.map((n: CanvasData['nodes'][number]) => {
          const position: [number, number, number] = n.position ?? [n.x ?? 0, 0, n.y ? -n.y : 0];
          return { ...n, position };
        }),
        edges: parsed.data.edges,
      };
      return { data: normalized, errors: [] };
    }
    return { data: { nodes: [], edges: [] }, errors: parsed.error.errors.map((e) => e.message) };
  } catch (e: unknown) {
    return { data: { nodes: [], edges: [] }, errors: [(e as Error).message] };
  }
}

export default function App() {
  const [files, setFiles] = useState<{ [name: string]: string }>({ 'example.json': defaultContent });
  const [currentFile, setCurrentFile] = useState<string>('example.json');

  const content = files[currentFile] ?? '';
  const { data: graphData, errors } = useMemo(() => parseGraph(content), [content]);

  const setStoreData = useCanvasStore((s) => s.setData);

  // Sync parsed data into canvas store
  useEffect(() => {
    setStoreData(graphData);
  }, [graphData, setStoreData]);

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const stored = localStorage.getItem('files');
    if (stored) setFiles(JSON.parse(stored));
  }, []);

  const updateContent = (newContent: string) => {
    setFiles((prev: Record<string, string>) => ({ ...prev, [currentFile]: newContent }));
  };

  return (
    <div className="app-container">
      <Sidebar fileNames={Object.keys(files)} current={currentFile} onSelect={setCurrentFile} />
      <Editor content={content} onChange={updateContent} errors={errors} />
      <ErrorBoundary fallback={<div style={{ color: 'red' }}>Failed to render 3-D view</div>}>
        <GraphCanvas data={graphData} />
      </ErrorBoundary>
      <Toolbar />
      <ContextMenu />
    </div>
  );
}