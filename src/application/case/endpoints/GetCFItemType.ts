import { type CFPackageRepository } from '../ports/CFPackageRepository'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface GetCFItemTypeQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: SourcedId
}

export class GetCFItemType {
  constructor (
    private readonly pkgRepo: CFPackageRepository,
    private readonly store: FileFrameworkStore
  ) {}

  async execute (query: GetCFItemTypeQuery) {
    logger.info({ query }, 'Executing GetCFItemType')

    const documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)
    
    for (const docMeta of documents) {
      const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, docMeta.sourcedId)
      if (!pkg || !pkg.definitions) continue

      const itemType = pkg.definitions.CFItemTypes?.find((it: any) => {
        const itemTypeId = it.identifier ?? it.sourcedId
        return itemTypeId === query.sourcedId
      })

      if (itemType) {
        return {
          CFItemType: itemType
        }
      }
    }

    return null
  }
}

