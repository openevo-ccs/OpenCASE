import { type CFPackageRepository } from '../../../application/case/ports/CFPackageRepository'
import { CFPackage } from '../../../domain/case/entities/CFPackage'
import { type CaseVersion, type SourcedId, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { type FileFrameworkStore } from './FileFrameworkStore'
import { CFDocument } from '../../../domain/case/entities/CFDocument'
import { CFItem } from '../../../domain/case/entities/CFItem'
import { CFAssociation } from '../../../domain/case/entities/CFAssociation'
import { logger } from '../../logging/Logger'

export class FileCFPackageRepository implements CFPackageRepository {
  constructor (private readonly store: FileFrameworkStore) {}

  async load (
    tenantId: TenantId,
    version: CaseVersion,
    docId: SourcedId
  ): Promise<CFPackage | null> {
    logger.info({ tenantId, version, docId }, 'Loading CFPackage')
    const bundle = await this.store.loadDocumentBundle(tenantId, version, docId)
    if (!bundle) return null

    const document = CFDocument.fromRaw(tenantId, version, bundle.document)
    const items = (bundle.items ?? []).map((i: any) =>
      CFItem.fromRaw(tenantId, version, i)
    )
    const associations = (bundle.associations ?? []).map((a: any) =>
      CFAssociation.fromRaw(tenantId, version, a)
    )
    const rubrics = bundle.rubrics ?? []

    return new CFPackage({ document, items, associations, rubrics })
  }

  async saveNewVersion (
    tenantId: TenantId,
    version: CaseVersion,
    pkg: CFPackage
  ): Promise<void> {
    const docId = pkg.document.sourcedId
    const bundle = {
      document: pkg.document.toJSON(),
      items: pkg.items.map(i => i.toJSON()),
      associations: pkg.associations.map(a => a.toJSON()),
      rubrics: pkg.rubrics
    }

    const { relativePath } = await this.store.writeBundleFile(tenantId, version, docId, bundle)

    // Update indexes (both in-memory and on disk)
    await this.store.updateIndexesForBundle(tenantId, version, bundle, relativePath)
  }
}
