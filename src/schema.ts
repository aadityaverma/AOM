import { z } from 'zod';

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  label: z.string().optional(),
  file: z.string().optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  z: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  color: z.string().optional(),
});

export const EdgeSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  to: z.string(),
  arrow: z.enum(['none','arrow','both']).optional(),
  color: z.string().optional(),
  label: z.string().optional(),
});

export const CanvasSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export type CanvasNode = z.infer<typeof NodeSchema>;
export type CanvasEdge = z.infer<typeof EdgeSchema>;
export type CanvasData = z.infer<typeof CanvasSchema>;