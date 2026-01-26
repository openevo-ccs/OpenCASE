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
  // React Flow wraps nodeTypes in its own container; keep that container visually neutral
  // so the CASE item "card" renders as the single surface.
  'bg-transparent border-0 p-0 shadow-none'

const DEFAULT_NODE_WIDTH = 360
const DEFAULT_NODE_HEIGHT = 220
const NODE_GAP_X = 36
const NODE_GAP_Y = 28

const getNodeSize = (n: Node<CaseItemNodeData>) => {
  const anyNode = n as unknown as {
    measured?: { width?: number; height?: number }
    width?: number
    height?: number
    style?: { width?: number | string; height?: number | string }
  }

  const measuredW = anyNode.measured?.width
  const measuredH = anyNode.measured?.height
  if (typeof measuredW === 'number' && typeof measuredH === 'number') return { w: measuredW, h: measuredH }

  const styleW = anyNode.style?.width
  const styleH = anyNode.style?.height
  const w =
    typeof anyNode.width === 'number'
      ? anyNode.width
      : typeof styleW === 'number'
        ? styleW
        : DEFAULT_NODE_WIDTH
  const h =
    typeof anyNode.height === 'number'
      ? anyNode.height
      : typeof styleH === 'number'
        ? styleH
        : DEFAULT_NODE_HEIGHT

  return { w, h }
}

const rectsOverlap = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

const findNonOverlappingPosition = (
  desired: { x: number; y: number },
  size: { w: number; h: number },
  nodes: Node<CaseItemNodeData>[],
) => {
  const occupied = nodes.map((n) => {
    const s = getNodeSize(n)
    return { x: n.position.x, y: n.position.y, w: s.w, h: s.h }
  })

  const maxCols = 6
  for (let attempt = 0; attempt < 200; attempt++) {
    const col = attempt % maxCols
    const row = Math.floor(attempt / maxCols)
    const candidate = {
      x: desired.x + col * (size.w + NODE_GAP_X),
      y: desired.y + row * (size.h + NODE_GAP_Y),
    }

    const candRect = { x: candidate.x, y: candidate.y, w: size.w, h: size.h }
    const collides = occupied.some((r) => rectsOverlap(candRect, r))
    if (!collides) return candidate
  }

  return desired
}

const nowIso = () => new Date().toISOString()

const makeCfItem = (id: string, fullStatement: string, extras?: Partial<CFItem>): CFItem => ({
  identifier: id,
  uri: `urn:case:item:${id}`,
  fullStatement,
  lastChangeDateTime: nowIso(),
  ...extras,
})

const initialNodes: Node<CaseItemNodeData>[] = [
  {
    id: 'n1',
    type: 'caseItemNode',
    position: { x: 0, y: 0 },
    style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
    data: {
      cfItem: makeCfItem('n1', 'Understand and use place value to round whole numbers to any place.', {
        humanCodingScheme: '3.NBT.A.1',
        CFItemType: 'Standard',
        subject: ['Mathematics'],
        educationLevel: ['Grade 3'],
        conceptKeywords: ['place value', 'rounding'],
        alternativeLabel: 'Rounding whole numbers (place value)',
      }),
    },
    className: caseItemNodeClassName,
  },
  {
    id: 'n2',
    type: 'caseItemNode',
    position: { x: 0, y: 140 },
    style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
    data: {
      cfItem: makeCfItem('n2', 'Explain patterns in the number of zeros of the product when multiplying by powers of 10.', {
        humanCodingScheme: '3.NBT.A.2',
        CFItemType: 'Standard',
        subject: ['Mathematics'],
        educationLevel: ['Grade 3'],
        conceptKeywords: ['powers of ten', 'patterns', 'multiplication'],
      }),
    },
    className: caseItemNodeClassName,
  },
  {
    id: 'n3',
    type: 'caseItemNode',
    position: { x: 0, y: 280 },
    style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
    data: {
      cfItem: makeCfItem('n3', 'Use place value understanding to round decimals to a specified place.', {
        humanCodingScheme: '5.NBT.A.4',
        CFItemType: 'Standard',
        subject: ['Mathematics'],
        educationLevel: ['Grade 5'],
        conceptKeywords: ['decimals', 'rounding', 'place value'],
      }),
    },
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

      const parentSize = getNodeSize(parent)
      const childRowY = parent.position.y + parentSize.h + 40
      const childGapX = DEFAULT_NODE_WIDTH + 60

      const rightMostChildX = children.length
        ? Math.max(...children.map((c) => c.position.x))
        : parent.position.x - childGapX

      const desiredPosition = {
        x: rightMostChildX + childGapX,
        y: childRowY,
      }

      const childSize = { w: DEFAULT_NODE_WIDTH, h: DEFAULT_NODE_HEIGHT }
      const nextPosition = findNonOverlappingPosition(desiredPosition, childSize, nodesSnapshot)

      const childNode: Node<CaseItemNodeData> = {
        id: childId,
        type: 'caseItemNode',
        position: nextPosition,
        style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
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

