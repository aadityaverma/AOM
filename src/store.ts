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
  selectedNodeId?: string;
  mode: 'select' | 'draw-edge';
  tempEdgeSource?: string;
  // actions
  createNode: (pos: [number, number, number]) => void;
  deleteSelected: () => void;
  startDrawEdge: () => void;
  nodeClicked: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setData: (data: CanvasData) => void;
}

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const emptyData: CanvasData = { nodes: [], edges: [] };

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  history: { past: [], present: emptyData, future: [] },
  mode: 'select',

  createNode: (pos) => {
    set(produce((state: CanvasStore) => {
      state.history.past.push(deepClone(state.history.present));
      const node: CanvasNode = { id: nanoid(6), position: pos };
      state.history.present.nodes.push(node);
      state.history.future = [];
    }));
  },

  deleteSelected: () => {
    const sel = get().selectedNodeId;
    if (!sel) return;
    set(produce((state: CanvasStore) => {
      state.history.past.push(deepClone(state.history.present));
      state.history.present.nodes = state.history.present.nodes.filter((n) => n.id !== sel);
      state.history.present.edges = state.history.present.edges.filter((e) => e.from !== sel && e.to !== sel);
      state.selectedNodeId = undefined;
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
      set({ selectedNodeId: id });
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
}));