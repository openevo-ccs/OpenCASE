import { useMemo, useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, BackgroundVariant, Background, MiniMap, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode';
import NodePropertiesPanel from './NodePropertiesPanel';

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: 'n3', type: 'textUpdater', position: { x: 0, y: 200 }, data: { label: 'Node 3' } },
];
const initialEdges = [
  { id: 'n1-n2', source: 'n1', target: 'n2' }, 
  { id: 'n2-n3', source: 'n2', target: 'n3' }
];
 
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
 
  const addChildTextUpdaterNode = useCallback((parentId) => {
    const uuid = crypto.randomUUID?.();
    const fallbackId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const childId = `tu_${uuid ?? fallbackId}`;

    setNodes((nodesSnapshot) => {
      const parent = nodesSnapshot.find((n) => n.id === parentId);
      if (!parent) return nodesSnapshot;

      const children = nodesSnapshot.filter((n) => n.data?.parentId === parentId);

      const childRowY = parent.position.y + 120;
      const childGapX = 280;

      const rightMostChildX = children.length
        ? Math.max(...children.map((c) => c.position.x))
        : parent.position.x - childGapX;

      const nextPosition = {
        x: rightMostChildX + childGapX,
        y: childRowY,
      };

      const childNode = {
        id: childId,
        type: 'textUpdater',
        position: nextPosition,
        data: { label: 'Text Node', parentId },
      };

      return [...nodesSnapshot, childNode];
    });

    setEdges((edgesSnapshot) => [
      ...edgesSnapshot,
      {
        id: `e_${parentId}_${childId}`,
        source: parentId,
        target: childId,
      },
    ]);
  }, []);

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((n) =>
        n.type === 'textUpdater'
          ? { ...n, data: { ...n.data, onAddChild: addChildTextUpdaterNode } }
          : n,
      ),
    [nodes, addChildTextUpdaterNode],
  );

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  );

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeId(selectedNodes?.[0]?.id ?? null);
  }, []);

  const onChangeSelectedNode = useCallback((nodeId, patch) => {
    setNodes((nodesSnapshot) =>
      nodesSnapshot.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setNodes((nodesSnapshot) => nodesSnapshot.map((n) => ({ ...n, selected: false })));
    setEdges((edgesSnapshot) => edgesSnapshot.map((e) => ({ ...e, selected: false })));
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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

      <NodePropertiesPanel
        node={selectedNode}
        onClose={clearSelection}
        onChangeNode={onChangeSelectedNode}
      />
    </div>
  );
}