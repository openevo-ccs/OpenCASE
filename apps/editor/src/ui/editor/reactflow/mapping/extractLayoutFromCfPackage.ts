import type { CFPackage } from '@/domain/case/types'
import type { LayoutState, NodeLayout } from './types'

/** OpenCASE extension key for editor-specific data */
const OPENCASE_EXT_KEY = 'ext:opencase'

type OpencaseExtension = {
  layout?: NodeLayout
  editorNotes?: string
}

/**
 * Extract layout state from a CFPackage's extensions.
 * 
 * The OpenCASE editor stores layout data (node positions and sizes) in the
 * `ext:opencase` extension of CFDocument and CFItems. This function extracts
 * that data to recreate the visual layout when re-opening a framework.
 * 
 * @param cfPackage - The CFPackage from the server
 * @returns LayoutState with positions/sizes for each node, or undefined if no layout data
 */
export function extractLayoutFromCfPackage(cfPackage: CFPackage): LayoutState | undefined {
  const byNodeId: Record<string, NodeLayout> = {}
  let hasLayout = false

  // Extract layout from CFDocument (framework node)
  const docExtensions = cfPackage.CFDocument?.extensions as Record<string, unknown> | undefined
  const docOpencaseExt = docExtensions?.[OPENCASE_EXT_KEY] as OpencaseExtension | undefined
  if (docOpencaseExt?.layout) {
    const docId = cfPackage.CFDocument.identifier
    byNodeId[docId] = docOpencaseExt.layout
    hasLayout = true
  }

  // Extract layout from CFItems
  for (const item of cfPackage.CFItems ?? []) {
    const itemExtensions = item.extensions as Record<string, unknown> | undefined
    const itemOpencaseExt = itemExtensions?.[OPENCASE_EXT_KEY] as OpencaseExtension | undefined
    if (itemOpencaseExt?.layout) {
      byNodeId[item.identifier] = itemOpencaseExt.layout
      hasLayout = true
    }
  }

  return hasLayout ? { byNodeId } : undefined
}
