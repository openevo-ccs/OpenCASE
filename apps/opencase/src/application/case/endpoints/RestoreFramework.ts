import { CaseVersion, TenantId } from '../../../domain/case/value-objects/Identifiers'
import type { FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface RestoreFrameworkCommand {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: string
}

export class RestoreFramework {
  constructor (
    private readonly store: FileFrameworkStore
  ) {}

  async execute (cmd: RestoreFrameworkCommand): Promise<void> {
    const { tenantId, caseVersion, sourcedId } = cmd

    if (!this.store.isDocumentArchived(tenantId, caseVersion, sourcedId)) {
      throw new Error(`CFDocument with sourcedId ${sourcedId} is not archived`)
    }

    this.store.setDocumentArchived(tenantId, caseVersion, sourcedId, false)
    await this.store.writeIndexesToDisk(tenantId, caseVersion)
  }
}
