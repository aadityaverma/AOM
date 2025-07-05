import { useCanvasStore } from '../store';
import { useRef } from 'react';

export default function Toolbar() {
  const createNode = useCanvasStore((s) => s.createNode);
  const startDrawEdge = useCanvasStore((s) => s.startDrawEdge);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const setLoading = useCanvasStore((s)=>s.setLoading);
  const setError = useCanvasStore((s)=>s.setError);
  const setFiles = useCanvasStore((s)=>s.setData);

  const fileRef = useRef<HTMLInputElement>(null);

  const importJson = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const txt = await file.text();
      const json = JSON.parse(txt);
      setFiles(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    const data = useCanvasStore.getState().history.present;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar">
      <button onClick={() => createNode([0, 0, 0])}>Add Node</button>
      <button onClick={startDrawEdge}>Draw Edge</button>
      <button onClick={deleteSelected}>Delete</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={importJson}>Import</button>
      <button onClick={exportJson}>Export</button>
      <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onFile} />
    </div>
  );
}