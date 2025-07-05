import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import GraphCanvas from './components/GraphCanvas';
import { GraphData } from './types';

// Demo initial JSON
const defaultContent = `{
  "nodes": [
    { "id": "1", "label": "Node 1", "position": [0, 0, 0] },
    { "id": "2", "label": "Node 2", "position": [1, 1, 0] },
    { "id": "3", "label": "Node 3", "position": [-1, 1, 0] }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "1", "to": "3" }
  ]
}`;

function parseGraph(jsonStr: string): GraphData {
  try {
    const parsed = JSON.parse(jsonStr) as GraphData;
    return parsed;
  } catch {
    return { nodes: [], edges: [] };
  }
}

export default function App() {
  const [files, setFiles] = useState<{ [name: string]: string }>({ 'example.json': defaultContent });
  const [currentFile, setCurrentFile] = useState<string>('example.json');

  const content = files[currentFile] ?? '';
  const graphData = parseGraph(content);

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const stored = localStorage.getItem('files');
    if (stored) setFiles(JSON.parse(stored));
  }, []);

  const updateContent = (newContent: string) => {
    setFiles((prev) => ({ ...prev, [currentFile]: newContent }));
  };

  return (
    <div className="app-container">
      <Sidebar fileNames={Object.keys(files)} current={currentFile} onSelect={setCurrentFile} />
      <Editor content={content} onChange={updateContent} />
      <GraphCanvas data={graphData} />
    </div>
  );
}