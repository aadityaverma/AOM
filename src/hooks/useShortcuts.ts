import { useEffect } from 'react';
import { useCanvasStore } from '../store';

export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const store = useCanvasStore.getState();
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        store.togglePalette();
        return;
      }
      if (mod && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) store.ungroupSelected();
        else store.groupSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        // TODO open search overlay
        return;
      }
      if (e.key === 'Escape') {
        store.clearSelection();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}