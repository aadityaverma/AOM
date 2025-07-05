import { useCanvasStore } from '../store';

export default function Toolbar() {
  const createNode = useCanvasStore((s) => s.createNode);
  const startDrawEdge = useCanvasStore((s) => s.startDrawEdge);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);

  return (
    <div className="toolbar">
      <button onClick={() => createNode([0, 0, 0])}>Add Node</button>
      <button onClick={startDrawEdge}>Draw Edge</button>
      <button onClick={deleteSelected}>Delete</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
}