import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../store';

interface Command {
  title: string;
  action: () => void;
}

function fuzzyMatch(needle: string, haystack: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default function CommandPalette() {
  const open = useCanvasStore((s) => s.paletteOpen);
  const toggle = useCanvasStore((s) => s.togglePalette);
  const createNode = useCanvasStore((s) => s.createNode);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const groupSelected = useCanvasStore((s) => s.groupSelected);
  const ungroupSelected = useCanvasStore((s) => s.ungroupSelected);
  const pasteNode = useCanvasStore((s) => s.pasteNode);
  const clipboard = useCanvasStore((s) => s.clipboardNode);
  const data = useCanvasStore((s) => s.history.present);

  const commands: Command[] = [
    { title: 'Create Node', action: () => createNode([0, 0, 0]) },
    { title: 'Delete Selected', action: deleteSelected },
    { title: 'Group Selected', action: groupSelected },
    { title: 'Ungroup Selected', action: ungroupSelected },
  ];
  if (clipboard) {
    commands.push({ title: 'Paste Node', action: () => pasteNode([0, 0, 0]) });
  }
  Object.keys(((data as any).templates) ?? {}).forEach((name) => {
    commands.push({ title: `Insert Template: ${name}`, action: () => useCanvasStore.getState().createNode([0, 0, 0]) /* TODO template */ });
  });

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const filtered = commands.filter((c) => fuzzyMatch(query, c.title));

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={toggle}
    >
      <div
        style={{ background: '#1e1e1e', width: 400, borderRadius: 6, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          style={{ width: '100%', padding: '0.5rem', border: 'none', outline: 'none', background: '#2e2e2e', color: '#fff' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing..."
        />
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {filtered.map((c, idx) => (
            <div
              key={idx}
              style={{ padding: '0.5rem 0.75rem', cursor: 'pointer' }}
              onClick={() => {
                c.action();
                toggle();
              }}
            >
              {c.title}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '0.5rem', opacity: 0.6 }}>No commands</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}