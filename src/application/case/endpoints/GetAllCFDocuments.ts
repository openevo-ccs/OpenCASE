import { type CaseVersion, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { type FileFrameworkStore } from '../../../infrastructure/persistence/file/FileFrameworkStore'
import { type LinkData } from '../../../domain/case/value-objects/LinkData'

export interface GetAllCFDocumentsQuery {
  tenantId: TenantId
  caseVersion: CaseVersion
  limit?: number
  offset?: number
  sort?: string
  orderBy?: 'asc' | 'desc'
  filter?: string
  fields?: string[]
}

export class GetAllCFDocuments {
  constructor (private readonly store: FileFrameworkStore) {}

  async execute (query: GetAllCFDocumentsQuery) {
    //logger.info({ query }, 'Executing GetAllCFDocuments')

    // Get all documents
    let documents = this.store.getAllDocuments(query.tenantId, query.caseVersion)

    // Apply filtering (basic implementation - can be enhanced)
    if (query.filter) {
      // Simple filter implementation - can be enhanced with proper parsing
      documents = documents.filter(doc => {
        // Basic string matching for now
        const filterLower = query.filter!.toLowerCase()
        return (
          doc.title.toLowerCase().includes(filterLower) ||
          doc.sourcedId.toLowerCase().includes(filterLower) ||
          (doc.subject && doc.subject.toLowerCase().includes(filterLower))
        )
      })
    }

    // Apply sorting
    if (query.sort) {
      const orderBy = query.orderBy ?? 'asc'
      documents.sort((a, b) => {
        let aVal: any
        let bVal: any

        switch (query.sort) {
          case 'title':
            aVal = a.title
            bVal = b.title
            break
          case 'lastChangeDateTime':
            aVal = a.lastChangeDateTime.getTime()
            bVal = b.lastChangeDateTime.getTime()
            break
          default:
            aVal = a.sourcedId
            bVal = b.sourcedId
        }

        if (aVal < bVal) return orderBy === 'asc' ? -1 : 1
        if (aVal > bVal) return orderBy === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply pagination
    const offset = query.offset ?? 0
    const limit = query.limit
    const total = documents.length
    const paginatedDocs = limit ? documents.slice(offset, offset + limit) : documents.slice(offset)

    // Generate CFDocument objects with proper structure
    const basePath = query.caseVersion === '1.1' ? '/ims/case/v1p1' : '/ims/case/v1p0'
    const cfDocuments = paginatedDocs.map(docMeta => {
      const packageURI: LinkData = {
        title: 'CFPackage',
        identifier: docMeta.sourcedId,
        uri: `${basePath}/CFPackages/${docMeta.sourcedId}`
      }

      const doc: any = {
        identifier: docMeta.sourcedId,
        uri: `${basePath}/CFDocuments/${docMeta.sourcedId}`,
        title: docMeta.title,
        lastChangeDateTime: docMeta.lastChangeDateTime.toISOString(),
        CFPackageURI: packageURI
      }

      // Add optional fields if present
      if (docMeta.language) doc.language = docMeta.language
      if (docMeta.frameworkType) doc.frameworkType = docMeta.frameworkType
      if (docMeta.subject) doc.subject = docMeta.subject
      if (docMeta.version) doc.version = docMeta.version

      // Apply field selection if specified
      if (query.fields && query.fields.length > 0) {
        const filteredDoc: any = {}
        for (const field of query.fields) {
          if (doc[field] !== undefined) {
            filteredDoc[field] = doc[field]
          }
        }
        return filteredDoc
      }

      return doc
    })

    return {
      CFDocumentSet: {
        CFDocuments: cfDocuments
      },
      // Pagination metadata (if pagination is used)
      ...(limit !== undefined && {
        total,
        limit,
        offset
      })
    }
  }
}













