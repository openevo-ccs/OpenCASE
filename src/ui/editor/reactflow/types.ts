import type { Node } from '@xyflow/react'

export type CaseItemNodeData = {
  label?: string
  parentId?: string
  onAddChild?: (_parentId: string) => void
}

export type CaseItemNodeType = Node<CaseItemNodeData, 'caseItemNode'>

