import { type CFPackageRepository } from '../ports/CFPackageRepository'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface GetCFLicenseQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: SourcedId
}

export class GetCFLicense {
  constructor (
    private readonly pkgRepo: CFPackageRepository,
    private readonly store: FileFrameworkStore
  ) {}

  async execute (query: GetCFLicenseQuery) {
    //logger.info({ query }, 'Executing GetCFLicense')

    const documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)
    
    for (const docMeta of documents) {
      const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, docMeta.sourcedId)
      if (!pkg || !pkg.definitions) continue

      const license = pkg.definitions.CFLicenses?.find((l: any) => {
        const licenseId = l.identifier ?? l.sourcedId
        return licenseId === query.sourcedId
      })

      if (license) {
        return {
          CFLicense: license
        }
      }
    }

    return null
  }
}













