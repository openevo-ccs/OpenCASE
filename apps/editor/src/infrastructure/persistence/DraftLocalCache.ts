import type { Framework } from '@/domain/framework/model/types'

export interface DraftLocalCache {
  loadDraft(): Framework | null
  saveDraft(_framework: Framework): void
  clear(): void
}

