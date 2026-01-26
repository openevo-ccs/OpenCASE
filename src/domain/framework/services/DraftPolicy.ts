import type { Framework } from '../model/types'

export function canEditFramework(framework: Framework): boolean {
  return framework.status === 'Draft'
}

