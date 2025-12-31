import type { CFPackageRepository } from '../ports/CFPackageRepository'
import type { CaseVersion, SourcedId, TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'

export interface GetCFPackageQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  docId: SourcedId
}

export class GetCFPackage {
  constructor (private readonly pkgRepo: CFPackageRepository) {}

  async execute(query: GetCFPackageQuery) {
    logger.info({ query }, 'Executing GetCFPackage')
    const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, query.docId)
    logger.info({ pkg }, 'Loaded CFPackage')
    if (!pkg) return null

    return {
      CFPackage: {
        CFDocument: pkg.document.toJSON(),
        CFItems: pkg.items.map(i => i.toJSON()),
        CFAssociations: pkg.associations.map(a => a.toJSON()),
        CFRubrics: pkg.rubrics // TODO: proper rubric entities
      }
    }
  }
}
