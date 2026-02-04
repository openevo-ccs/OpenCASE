import { MarkerType } from '@xyflow/react'
import type { CFDocument, CFItem } from '@/domain/case/types'
import type { CaseEditorEdge, CaseEditorNodeType, CaseFrameworkNodeType, CaseItemNodeType } from '@/ui/editor/reactflow/types'

export type EditorGraph = {
  nodes: CaseEditorNodeType[]
  edges: CaseEditorEdge[]
}

/** Default arrow marker for edges */
export const DEFAULT_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: '#94a3b8', // slate-400
}

/** Get edge markers based on association type */
export function getEdgeMarkers(associationType: string) {
  // isRelatedTo is bidirectional - arrows on both ends
  if (associationType === 'isRelatedTo') {
    return {
      markerStart: DEFAULT_EDGE_MARKER,
      markerEnd: DEFAULT_EDGE_MARKER,
    }
  }

  // All other types: single arrow at the end (pointing to destination/child)
  return {
    markerEnd: DEFAULT_EDGE_MARKER,
  }
}

const DEFAULT_NODE_WIDTH = 360
const DEFAULT_NODE_HEIGHT = 220
const HEADER_SAFE_Y = 96

const nowIso = () => new Date().toISOString()

export const makeCfItem = (id: string, fullStatement: string, extras?: Partial<CFItem>): CFItem => ({
  identifier: id,
  uri: `urn:case:item:${id}`,
  fullStatement,
  lastChangeDateTime: nowIso(),
  ...extras,
})

export const makeCfDocument = (id: string, title: string, extras?: Partial<CFDocument>): CFDocument => ({
  identifier: id,
  uri: `urn:case:document:${id}`,
  creator: 'District Curriculum Team',
  title,
  lastChangeDateTime: nowIso(),
  CFPackageURI: { uri: `urn:case:package:${id}` },
  caseVersion: '1.1',
  ...extras,
})

const wrapperNodeClassName = 'bg-transparent border-0 p-0 shadow-none'

export function createEmptyFrameworkGraph(params: {
  id: string
  title: string
  frameworkType?: string
  adoptionStatus?: string
  description?: string
  creator?: string
}): EditorGraph {
  const cfDocument = makeCfDocument(params.id, params.title, {
    frameworkType: params.frameworkType,
    adoptionStatus: params.adoptionStatus,
    description: params.description,
    creator: params.creator,
  })

  const fwNode: CaseFrameworkNodeType = {
    id: params.id,
    type: 'caseFrameworkNode',
    position: { x: 0, y: HEADER_SAFE_Y },
    style: { width: 520, height: 210 },
    data: { cfDocument },
    className: wrapperNodeClassName,
  }

  return { nodes: [fwNode], edges: [] }
}

export function createSampleGraph(): EditorGraph {
  const fwId = 'fw1'

  const nodes: CaseEditorNodeType[] = [
    {
      id: fwId,
      type: 'caseFrameworkNode',
      // Start below the floating header so it is visible on first load.
      position: { x: 0, y: HEADER_SAFE_Y },
      style: { width: 520, height: 210 },
      data: {
        cfDocument: makeCfDocument('fw1', 'Grade 3–5 Mathematics (Draft)', {
          frameworkType: 'K-12',
          adoptionStatus: 'Draft',
          description: 'A draft set of math expectations focused on number and operations (grades 3–5).',
        }),
      },
      className: wrapperNodeClassName,
    },
    {
      id: 'n1',
      type: 'caseItemNode',
      // Leave enough room between nodes so edges are visible (node height ~220).
      position: { x: 0, y: HEADER_SAFE_Y + 210 + 140 },
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
        parentId: fwId,
      },
      className: wrapperNodeClassName,
    },
    {
      id: 'n2',
      type: 'caseItemNode',
      position: { x: 0, y: HEADER_SAFE_Y + 210 + 140 + 320 },
      style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
      data: {
        cfItem: makeCfItem('n2', 'Explain patterns in the number of zeros of the product when multiplying by powers of 10.', {
          humanCodingScheme: '3.NBT.A.2',
          CFItemType: 'Standard',
          subject: ['Mathematics'],
          educationLevel: ['Grade 3'],
          conceptKeywords: ['powers of ten', 'patterns', 'multiplication'],
        }),
        parentId: 'n1',
      },
      className: wrapperNodeClassName,
    },
    {
      id: 'n3',
      type: 'caseItemNode',
      position: { x: 0, y: HEADER_SAFE_Y + 210 + 140 + 320 + 320 },
      style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
      data: {
        cfItem: makeCfItem('n3', 'Use place value understanding to round decimals to a specified place.', {
          humanCodingScheme: '5.NBT.A.4',
          CFItemType: 'Standard',
          subject: ['Mathematics'],
          educationLevel: ['Grade 5'],
          conceptKeywords: ['decimals', 'rounding', 'place value'],
        }),
        parentId: 'n2',
      },
      className: wrapperNodeClassName,
    },
  ]

  const edges: CaseEditorEdge[] = [
    { id: 'fw1-n1', source: 'fw1', target: 'n1', markerEnd: DEFAULT_EDGE_MARKER, data: { isHierarchical: true, associationType: 'isChildOf' } },
    { id: 'n1-n2', source: 'n1', target: 'n2', markerEnd: DEFAULT_EDGE_MARKER, data: { isHierarchical: true, associationType: 'isChildOf' } },
    { id: 'n2-n3', source: 'n2', target: 'n3', markerEnd: DEFAULT_EDGE_MARKER, data: { isHierarchical: true, associationType: 'isChildOf' } },
  ]

  return { nodes, edges }
}

/**
 * @deprecated Use FrameworkLoader + toReactFlowGraph instead.
 *
 * This function was removed as part of the DDD refactor. The proper flow is now:
 * 1. Use FrameworkLoader.loadFromCfPackage() to get a domain Framework
 * 2. Use toReactFlowGraph({ framework }) to convert to EditorGraph
 *
 * This ensures the domain Framework is the source of truth and CASE version
 * differences are handled in the application layer, not the UI.
 */
// export function createGraphFromCfPackage - REMOVED
