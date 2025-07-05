import { create } from 'zustand';
import { CanvasData, CanvasNode, CanvasEdge } from './types';
import { nanoid } from 'nanoid';
import { produce } from 'immer';

interface HistoryState {
  past: CanvasData[];
  present: CanvasData;
  future: CanvasData[];
}

interface CanvasStore {
  history: HistoryState;
  selectedNodeIds: Set<string>;
  mode: 'select' | 'draw-edge';
  tempEdgeSource?: string;
  contextMenu?: { type: 'node' | 'canvas'; id?: string; x: number; y: number };
  clipboardNode: CanvasNode | undefined;
  paletteOpen: boolean;
  searchOpen: boolean;
  loading: boolean;
  error?: string;
  // actions
  createNode: (pos: [number, number, number]) => void;
  deleteSelected: () => void;
  startDrawEdge: () => void;
  nodeClicked: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setData: (data: CanvasData) => void;
  toggleSelect: (id: string, additive: boolean) => void;
  clearSelection: () => void;
  showContextMenu: (payload: { type: 'node' | 'canvas'; id?: string; x: number; y: number }) => void;
  hideContextMenu: () => void;
  copyNode: (id: string) => void;
  pasteNode: (pos: [number, number, number]) => void;
  updateNode: (id: string, patch: Partial<CanvasNode>) => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  setLoading: (b: boolean) => void;
  setError: (msg?: string) => void;
  togglePalette: () => void;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const emptyData: CanvasData = { nodes: [], edges: [] };

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  history: { past: [], present: emptyData, future: [] },
  mode: 'select',
  selectedNodeIds: new Set(),
  contextMenu: undefined,
  clipboardNode: undefined,
  paletteOpen: false,
  searchOpen: false,
  loading: false,

  createNode: (pos) => {
    set(produce((state: CanvasStore) => {
      state.history.past.push(deepClone(state.history.present));
      const node: CanvasNode = { id: nanoid(6), position: pos };
      state.history.present.nodes.push(node);
      state.history.future = [];
    }));
  },

  deleteSelected: () => {
    const selSet = get().selectedNodeIds;
    if (selSet.size===0) return;
    set(produce((state: CanvasStore) => {
      state.history.past.push(deepClone(state.history.present));
      state.history.present.nodes = state.history.present.nodes.filter((n) => !selSet.has(n.id));
      state.history.present.edges = state.history.present.edges.filter((e) => !selSet.has(e.from) && !selSet.has(e.to));
      state.selectedNodeIds.clear();
      state.history.future = [];
    }));
  },

  startDrawEdge: () => set({ mode: 'draw-edge', tempEdgeSource: undefined }),

  nodeClicked: (id) => {
    const current = get();
    if (current.mode === 'draw-edge') {
      if (!current.tempEdgeSource) {
        set({ tempEdgeSource: id });
      } else if (current.tempEdgeSource !== id) {
        set(produce((state: CanvasStore) => {
          state.history.past.push(deepClone(state.history.present));
          const edge: CanvasEdge = { from: current.tempEdgeSource as string, to: id };
          state.history.present.edges.push(edge);
          state.mode = 'select';
          state.tempEdgeSource = undefined;
          state.history.future = [];
        }));
      }
    } else {
      set({ selectedNodeIds: new Set([id]) });
    }
  },

  undo: () => {
    set(produce((state: CanvasStore) => {
      const { past, present, future } = state.history;
      if (past.length === 0) return;
      const previous = past.pop() as CanvasData;
      future.unshift(deepClone(present));
      state.history.present = previous;
    }));
  },

  redo: () => {
    set(produce((state: CanvasStore) => {
      const { past, present, future } = state.history;
      if (future.length === 0) return;
      const next = future.shift() as CanvasData;
      past.push(deepClone(present));
      state.history.present = next;
    }));
  },

  setData: (data) => set({ history: { past: [], present: data, future: [] } }),

  toggleSelect: (id, additive) => {
    set(produce((state: CanvasStore)=>{
      if(!additive){ state.selectedNodeIds.clear(); }
      if(state.selectedNodeIds.has(id)){
        state.selectedNodeIds.delete(id);
      } else {
        state.selectedNodeIds.add(id);
      }
    }));
  },

  clearSelection: () => set(produce((s:CanvasStore)=>{s.selectedNodeIds.clear();})),

  showContextMenu: (payload) => set({ contextMenu: payload }),
  hideContextMenu: () => set({ contextMenu: undefined }),

  copyNode: (id) => {
    const node = get().history.present.nodes.find((n)=>n.id===id);
    if(node){
      set({ clipboardNode: deepClone(node) });
    }
  },

  pasteNode: (pos) => {
    const clip = (get() as any).clipboardNode as CanvasNode | undefined;
    if(!clip) return;
    const newNode = { ...deepClone(clip), id: nanoid(6), position: pos };
    set(produce((state: CanvasStore)=>{
      state.history.present.nodes.push(newNode);
    }));
  },

  updateNode: (id, patch) => {
    set(produce((state: CanvasStore) => {
      const node = state.history.present.nodes.find((n) => n.id === id);
      if (node) {
        Object.assign(node, patch);
      }
    }));
  },

  groupSelected: () => {
    const sel = Array.from(get().selectedNodeIds);
    if (sel.length < 2) return;
    const gid = nanoid(6);
    set(produce((state: CanvasStore) => {
      state.history.present.nodes.forEach((n) => {
        if (state.selectedNodeIds.has(n.id)) {
          (n as any).group = gid;
        }
      });
    }));
  },

  ungroupSelected: () => {
    set(produce((state: CanvasStore) => {
      state.history.present.nodes.forEach((n) => {
        if (state.selectedNodeIds.has(n.id)) {
          delete (n as any).group;
        }
      });
    }));
  },

  setLoading: (b) => {
    set({ loading: b });
  },

  setError: (msg) => {
    set({ error: msg });
  },

  togglePalette: () => {
    set({ paletteOpen: !get().paletteOpen });
  },
}));