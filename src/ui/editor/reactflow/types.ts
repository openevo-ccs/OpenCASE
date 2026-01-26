import type { Node } from '@xyflow/react'
import type { CFItem } from '@/domain/case/types'

export type CaseItemNodeData = {
  cfItem: CFItem
  parentId?: string
  onAddChild?: (_parentId: string) => void
  onUpdateItem?: (_nodeId: string, _patch: Partial<CFItem>) => void
}

export type CaseItemNodeType = Node<CaseItemNodeData, 'caseItemNode'>

export type CaseItemNodeDataPatch = Partial<Omit<CaseItemNodeData, 'cfItem'>> & {
  cfItem?: Partial<CFItem>
}
