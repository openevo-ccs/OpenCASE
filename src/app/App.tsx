import { useMemo, useState, useCallback } from 'react'
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnSelectionChangeFunc,
} from '@xyflow/react'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
  Background,
  MiniMap,
  Controls,
} from '@xyflow/react'

import { nodeTypes } from '@/ui/editor/reactflow/nodeTypes'
import type { CaseItemNodeData, CaseItemNodeDataPatch } from '@/ui/editor/reactflow/types'
import type { CFItem } from '@/domain/case/types'
import NodePropertiesPanel from '@/ui/editor/components/NodePropertiesPanel'

const caseItemNodeClassName =
  'w-[240px] rounded-[var(--xy-node-border-radius,var(--xy-node-border-radius-default))] border-[var(--xy-node-border,var(--xy-node-border-default))] bg-[var(--xy-node-background-color,var(--xy-node-background-color-default))] p-2 text-left text-xs text-[var(--xy-node-color,var(--xy-node-color-default))] hover:shadow-[var(--xy-node-boxshadow-hover,var(--xy-node-boxshadow-hover-default))] [&.selected]:shadow-[var(--xy-node-boxshadow-selected,var(--xy-node-boxshadow-selected-default))]'

const nowIso = () => new Date().toISOString()

const makeCfItem = (id: string, fullStatement: string): CFItem => ({
  identifier: id,
  uri: `urn:case:item:${id}`,
  fullStatement,
  lastChangeDateTime: nowIso(),
})

const initialNodes: Node<CaseItemNodeData>[] = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { cfItem: makeCfItem('n1', 'Node 1') } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { cfItem: makeCfItem('n2', 'Node 2') } },
  {
    id: 'n3',
    type: 'caseItemNode',
    position: { x: 0, y: 200 },
    data: { cfItem: makeCfItem('n3', 'Node 3') },
    className: caseItemNodeClassName,
  },
]

const initialEdges: Edge[] = [
  { id: 'n1-n2', source: 'n1', target: 'n2' },
  { id: 'n2-n3', source: 'n2', target: 'n3' },
]

export default function App() {
  const [nodes, setNodes] = useState<Node<CaseItemNodeData>[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const updateNodeData = useCallback((nodeId: string, patch: CaseItemNodeDataPatch) => {
    setNodes((nodesSnapshot) =>
      nodesSnapshot.map((n) => {
        if (n.id !== nodeId) return n

        const nextData: CaseItemNodeData = {
          ...n.data,
          ...patch,
          cfItem: patch.cfItem ? { ...n.data.cfItem, ...patch.cfItem } : n.data.cfItem,
        }

        return { ...n, data: nextData }
      }),
    )
  }, [])

  const addChildCaseItemNode = useCallback((parentId: string) => {
    const uuid = globalThis.crypto?.randomUUID?.()
    const fallbackId = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const childId = `tu_${uuid ?? fallbackId}`

    setNodes((nodesSnapshot) => {
      const parent = nodesSnapshot.find((n) => n.id === parentId)
      if (!parent) return nodesSnapshot

      const children = nodesSnapshot.filter((n) => n.data?.parentId === parentId)

      const childRowY = parent.position.y + 120
      const childGapX = 280

      const rightMostChildX = children.length
        ? Math.max(...children.map((c) => c.position.x))
        : parent.position.x - childGapX

      const nextPosition = {
        x: rightMostChildX + childGapX,
        y: childRowY,
      }

      const childNode: Node<CaseItemNodeData> = {
        id: childId,
        type: 'caseItemNode',
        position: nextPosition,
        data: { cfItem: makeCfItem(childId, 'Text Node'), parentId },
        className: caseItemNodeClassName,
      }

      return [...nodesSnapshot, childNode]
    })

    setEdges((edgesSnapshot) => [
      ...edgesSnapshot,
      {
        id: `e_${parentId}_${childId}`,
        source: parentId,
        target: childId,
      },
    ])
  }, [])

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((n) =>
        n.type === 'caseItemNode'
          ? {
              ...n,
              className: caseItemNodeClassName,
              data: { ...n.data, onAddChild: addChildCaseItemNode, onUpdateItem: (id, patch) => updateNodeData(id, { cfItem: patch }) },
            }
          : n,
      ),
    [nodes, addChildCaseItemNode, updateNodeData],
  )

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  )

  const onSelectionChange: OnSelectionChangeFunc = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeId(selectedNodes?.[0]?.id ?? null)
  }, [])

  const onChangeSelectedNode = useCallback(
    (nodeId: string, patch: CaseItemNodeDataPatch) => {
      updateNodeData(nodeId, patch)
    },
    [updateNodeData],
  )

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
    setNodes((nodesSnapshot) => nodesSnapshot.map((n) => ({ ...n, selected: false })))
    setEdges((edgesSnapshot) => edgesSnapshot.map((e) => ({ ...e, selected: false })))
  }, [])

  const onNodesChange = useCallback((changes: NodeChange<Node<CaseItemNodeData>>[]) => {
    setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
  }, [])

  const onConnect = useCallback((params: Connection) => {
    setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot))
  }, [])

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>

      <NodePropertiesPanel node={selectedNode} onClose={clearSelection} onChangeNode={onChangeSelectedNode} />
    </div>
  )
}

