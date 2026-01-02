import { type CFPackageRepository } from '../ports/CFPackageRepository'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface GetCFConceptQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: SourcedId
}

export class GetCFConcept {
  constructor (
    private readonly pkgRepo: CFPackageRepository,
    private readonly store: FileFrameworkStore
  ) {}

  async execute (query: GetCFConceptQuery) {
    //logger.info({ query }, 'Executing GetCFConcept')

    const documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)
    
    for (const docMeta of documents) {
      const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, docMeta.sourcedId)
      if (!pkg || !pkg.definitions) continue

      const concept = pkg.definitions.CFConcepts?.find((c: any) => {
        const conceptId = c.identifier ?? c.sourcedId
        return conceptId === query.sourcedId
      })

      if (concept) {
        return {
          CFConcept: concept
        }
      }
    }

    return null
  }
}

