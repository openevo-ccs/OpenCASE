import { type CFPackageRepository } from '../ports/CFPackageRepository'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'

export interface GetCFSubjectQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  sourcedId: SourcedId
}

export class GetCFSubject {
  constructor (
    private readonly pkgRepo: CFPackageRepository,
    private readonly store: FileFrameworkStore
  ) {}

  async execute (query: GetCFSubjectQuery) {
    logger.info({ query }, 'Executing GetCFSubject')

    // Search through all documents to find the subject in definitions
    const documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)
    
    for (const docMeta of documents) {
      const pkg = await this.pkgRepo.load(query.tenantId, query.caseVersion, docMeta.sourcedId)
      if (!pkg || !pkg.definitions) continue

      const subject = pkg.definitions.CFSubjects?.find((s: any) => {
        const subjectId = s.identifier ?? s.sourcedId
        return subjectId === query.sourcedId
      })

      if (subject) {
        return {
          CFSubject: subject
        }
      }
    }

    return null
  }
}

