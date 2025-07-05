import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../store';

export default function ContextMenu() {
  const menu = useCanvasStore((s) => s.contextMenu);
  const hide = useCanvasStore((s) => s.hideContextMenu);
  const deleteSel = useCanvasStore((s) => s.deleteSelected);
  const createNode = useCanvasStore((s) => s.createNode);
  const copyNode = useCanvasStore((s) => s.copyNode);
  const pasteNode = useCanvasStore((s) => s.pasteNode);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current || !ref.current.contains(e.target as Node)) {
        hide();
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [hide]);

  if (!menu) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: menu.y,
    left: menu.x,
    background: '#2e2e2e',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: 4,
    padding: '0.25rem 0',
    zIndex: 1000,
    minWidth: 120,
  };

  const Item = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <div
      style={{ padding: '0.25rem 0.75rem', cursor: 'pointer' }}
      onClick={() => {
        onClick();
        hide();
      }}
    >
      {label}
    </div>
  );

  const items: React.ReactNode[] = [];

  if (menu.type === 'node' && menu.id) {
    items.push(
      <Item key="delete" label="Delete" onClick={() => { useCanvasStore.getState().toggleSelect(menu.id!, false); deleteSel(); }} />,
      <Item key="copy" label="Copy" onClick={() => copyNode(menu.id!)} />,
      <Item key="edit" label="Edit (todo)" onClick={() => {}} />,
    );
  }

  if (menu.type === 'canvas') {
    items.push(
      <Item key="add" label="Create Node" onClick={() => createNode([0, 0, 0])} />,
      <Item key="paste" label="Paste" onClick={() => pasteNode([0, 0, 0])} />,
    );
  }

  return createPortal(
    <div ref={ref} style={style} className="context-menu">
      {items}
    </div>,
    document.body,
  );
}