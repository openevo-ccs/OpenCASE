import type { Framework, FrameworkMetadata } from './types'
import type { FrameworkId  } from '@/domain/shared/types'

export function createFramework(params: {
  id: FrameworkId
  metadata?: FrameworkMetadata
}): Framework {
  return {
    id: params.id,
    metadata: params.metadata ?? {},
    items: new Map(),
    associations: new Map(),
    status: 'Draft',
  }
}

