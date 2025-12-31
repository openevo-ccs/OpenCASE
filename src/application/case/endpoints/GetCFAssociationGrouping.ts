import { type CFPackageRepository } from '../ports/CFPackageRepository'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface GetCFAssociationGroupingQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: SourcedId
}

export class GetCFAssociationGrouping {
  constructor (
    private readonly pkgRepo: CFPackageRepository,
    private readonly store: FileFrameworkStore
  ) {}

  async execute (query: GetCFAssociationGroupingQuery) {
    logger.info({ query }, 'Executing GetCFAssociationGrouping')

    const documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)
    
    for (const docMeta of documents) {
      const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, docMeta.sourcedId)
      if (!pkg || !pkg.definitions) continue

      const grouping = pkg.definitions.CFAssociationGroupings?.find((g: any) => {
        const groupingId = g.identifier ?? g.sourcedId
        return groupingId === query.sourcedId
      })

      if (grouping) {
        return {
          CFAssociationGrouping: grouping
        }
      }
    }

    return null
  }
}

