export type NodeLayout = {
  x: number
  y: number
  w?: number
  h?: number
}

export type LayoutState = {
  /**
   * Per-node layout (position + optional size).
   * Keys are React Flow node IDs (framework id, item ids).
   */
  byNodeId: Record<string, NodeLayout>
}

