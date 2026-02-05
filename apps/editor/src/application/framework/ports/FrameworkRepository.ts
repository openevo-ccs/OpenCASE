import type { Framework } from '@/domain/framework/model/types'
import type { FrameworkId } from '@/domain/shared/types'

export interface FrameworkRepository {
  getById(_id: FrameworkId): Promise<Framework | null>
  saveDraft(_framework: Framework): Promise<void>
  publish(_frameworkId: FrameworkId): Promise<void>
}

