import type { CFPackageRepository } from '../ports/CFPackageRepository'
import type { CaseVersion, SourcedId, TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { LinkData } from '../../../domain/case/value-objects/LinkData'

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

    // Generate CFPackageURI for the document
    const basePath = query.caseVersion === '1.1' ? '/ims/case/v1p1' : '/ims/case/v1p0'
    const packageURI: LinkData = {
      title: 'CFPackage',
      identifier: query.docId,
      uri: `${basePath}/CFPackages/${query.docId}`
    }

    const documentJSON = pkg.document.toJSON()
    // Add CFPackageURI if not already present
    if (!documentJSON.CFPackageURI) {
      documentJSON.CFPackageURI = packageURI
    }

    const result: any = {
      CFPackage: {
        CFDocument: documentJSON,
        CFItems: pkg.items.map(i => i.toJSON()),
        CFAssociations: pkg.associations.map(a => a.toJSON())
      }
    }

    // Add CFDefinitions if present (optional field [0..1])
    if (pkg.definitions) {
      result.CFPackage.CFDefinitions = {
        CFConcepts: pkg.definitions.CFConcepts ?? [],
        CFSubjects: pkg.definitions.CFSubjects ?? [],
        CFLicenses: pkg.definitions.CFLicenses ?? [],
        CFItemTypes: pkg.definitions.CFItemTypes ?? [],
        CFAssociationGroupings: pkg.definitions.CFAssociationGroupings ?? [],
        ...(pkg.definitions.extensions ? { extensions: pkg.definitions.extensions } : {})
      }
    }

    // Add CFRubrics if present (optional field [0..*])
    if (pkg.rubrics && pkg.rubrics.length > 0) {
      result.CFPackage.CFRubrics = pkg.rubrics
    }

    // Add extensions if present (optional field [0..1])
    if (pkg.extensions) {
      result.CFPackage.extensions = pkg.extensions
    }

    return result
  }
}
