import type { FrameworkRepository } from '@/application/framework/ports/FrameworkRepository'
import type { Framework } from '@/domain/framework/model/types'
import type { FrameworkId } from '@/domain/shared/types'
import type { CaseApiClient } from './CaseApiClient'

export class CaseFrameworkRepository implements FrameworkRepository {
  constructor(private readonly _client: CaseApiClient) {}

  async getById(_id: FrameworkId): Promise<Framework | null> {
    // Placeholder: implement via CASE API later.
    return null
  }

  async saveDraft(_framework: Framework): Promise<void> {
    // Placeholder: implement via authoring API later.
  }

  async publish(_frameworkId: FrameworkId): Promise<void> {
    // Placeholder: implement publish endpoint later.
  }
}

