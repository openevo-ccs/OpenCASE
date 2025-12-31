import fs from 'node:fs/promises'
import path from 'node:path'
import { type CaseVersion, type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../logging/Logger'

export interface FileFrameworkStoreConfig {
  baseDataDir: string
}

export interface DocumentMetadata {
  sourcedId: string
  title: string
  language?: string
  frameworkType?: string
  subject?: string
  version?: string
  lastChangeDateTime: Date
  currentFile: string // relative to tenant/version root
}

export interface DocumentVersionInfo {
  file: string
  lastChangeDateTime: Date
  version?: string
}

interface ItemIndexEntry {
  docSourcedId: string
}

interface AssocIndexEntry {
  docSourcedId: string
}

export class FileFrameworkStore {
  private readonly documents = new Map<TenantId, Map<CaseVersion, Map<string, DocumentMetadata>>>()
  private readonly documentVersions = new Map<TenantId, Map<CaseVersion, Map<string, DocumentVersionInfo[]>>>()
  private readonly itemsIndex = new Map<TenantId, Map<CaseVersion, Map<string, ItemIndexEntry>>>()
  private readonly assocIndex = new Map<TenantId, Map<CaseVersion, Map<string, AssocIndexEntry>>>()

  constructor (private readonly cfg: FileFrameworkStoreConfig) {}

  async loadAll (): Promise<void> {
    const tenantsDir = path.join(this.cfg.baseDataDir, 'tenants')
    let tenantNames: string[]
    try {
      tenantNames = await fs.readdir(tenantsDir)
    } catch {
      return
    }

    const versions: CaseVersion[] = ['1.0', '1.1']

    await Promise.all(
      tenantNames.map(async tenantId => {
        const tenantPath = path.join(tenantsDir, tenantId)
        const stat = await fs.stat(tenantPath)
        if (!stat.isDirectory()) return

        for (const version of versions) {
          const versionDir = path.join(tenantPath, version === '1.0' ? 'v1p0' : 'v1p1')
          await this.loadIndexesForTenantVersion(tenantId, version, versionDir)
        }
      })
    )
  }

  private async loadIndexesForTenantVersion (
    tenantId: TenantId,
    version: CaseVersion,
    versionDir: string
  ): Promise<void> {
    const idxDir = path.join(versionDir, 'indexes')
    const docsMap = await this.loadDocumentsIndex(idxDir)
    const versionsMap = await this.loadDocumentVersionsIndex(idxDir)
    const itemsMap = await this.loadItemsIndex(idxDir)
    const assocMap = await this.loadAssociationsIndex(idxDir)

    this.setTenantVersionMap(this.documents, tenantId, version, docsMap)
    this.setTenantVersionMap(this.documentVersions, tenantId, version, versionsMap)
    this.setTenantVersionMap(this.itemsIndex, tenantId, version, itemsMap)
    this.setTenantVersionMap(this.assocIndex, tenantId, version, assocMap)
  }

  private setTenantVersionMap<T>(
    root: Map<TenantId, Map<CaseVersion, Map<string, T>>>,
    tenantId: TenantId,
    version: CaseVersion,
    data: Map<string, T>
  ): void {
    let tenantMap = root.get(tenantId)
    if (!tenantMap) {
      tenantMap = new Map()
      root.set(tenantId, tenantMap)
    }
    tenantMap.set(version, data)
  }

  private async loadDocumentsIndex (idxDir: string): Promise<Map<string, DocumentMetadata>> {
    const map = new Map<string, DocumentMetadata>()
    try {
      const raw = JSON.parse(
        await fs.readFile(path.join(idxDir, 'documents.json'), 'utf8')
      ) as any[]
      for (const d of raw) {
        map.set(d.sourcedId as string, {
          sourcedId: d.sourcedId,
          title: d.title,
          language: d.language,
          frameworkType: d.frameworkType,
          subject: d.subject,
          version: d.version,
          lastChangeDateTime: new Date(d.lastChangeDateTime as string | number | Date),
          currentFile: d.currentFile
        })
      }
    } catch {
      // ignore missing
    }
    return map
  }

  private async loadDocumentVersionsIndex (
    idxDir: string
  ): Promise<Map<string, DocumentVersionInfo[]>> {
    const map = new Map<string, DocumentVersionInfo[]>()
    try {
      const raw = JSON.parse(
        await fs.readFile(path.join(idxDir, 'document-versions.json'), 'utf8')
      ) as Record<string, any[]>
      for (const [docId, versions] of Object.entries(raw)) {
        map.set(
          docId,
          versions.map(v => ({
            file: v.file,
            lastChangeDateTime: new Date(v.lastChangeDateTime as string | number | Date),
            version: v.version
          }))
        )
      }
    } catch {
      // ignore missing
    }
    return map
  }

  private async loadItemsIndex (idxDir: string): Promise<Map<string, ItemIndexEntry>> {
    const map = new Map<string, ItemIndexEntry>()
    try {
      const raw = JSON.parse(
        await fs.readFile(path.join(idxDir, 'items.json'), 'utf8')
      ) as Record<string, { docSourcedId: string }>
      for (const [itemId, v] of Object.entries(raw)) {
        map.set(itemId, { docSourcedId: v.docSourcedId })
      }
    } catch {
      // ignore missing
    }
    return map
  }

  private async loadAssociationsIndex (idxDir: string): Promise<Map<string, AssocIndexEntry>> {
    const map = new Map<string, AssocIndexEntry>()
    try {
      const raw = JSON.parse(
        await fs.readFile(path.join(idxDir, 'associations.json'), 'utf8')
      ) as Record<string, { docSourcedId: string }>
      for (const [assocId, v] of Object.entries(raw)) {
        map.set(assocId, { docSourcedId: v.docSourcedId })
      }
    } catch {
      // ignore missing
    }
    return map
  }

  getTenantVersionRootDir (tenantId: TenantId, version: CaseVersion): string {
    const tenantDir = path.join(this.cfg.baseDataDir, 'tenants', tenantId)
    const vDir = version === '1.0' ? 'v1p0' : 'v1p1'
    return path.join(tenantDir, vDir)
  }

  async loadDocumentBundle (
    tenantId: TenantId,
    version: CaseVersion,
    docId: string
  ): Promise<{ document: any, items?: any[], associations?: any[], rubrics?: any[], definitions?: any } | null> {
    logger.info({ tenantId, version, docId }, 'loadDocumentBundle')
    const meta = this.documents.get(tenantId)?.get(version)?.get(docId)
    if (!meta) return null
    logger.info({ meta }, 'meta')
    const rootDir = this.getTenantVersionRootDir(tenantId, version)
    const fullPath = path.join(rootDir, meta.currentFile)
    const json = JSON.parse(await fs.readFile(fullPath, 'utf8'))
    return json
  }

  async writeBundleFile (
    tenantId: TenantId,
    version: CaseVersion,
    docId: string,
    bundle: any
  ): Promise<{ relativePath: string }> {
    const rootDir = this.getTenantVersionRootDir(tenantId, version)
    const frameworksDir = path.join(rootDir, 'frameworks', docId)
    await fs.mkdir(frameworksDir, { recursive: true })

    const existing = await fs.readdir(frameworksDir).catch(() => [])
    const nextVersion = existing.length + 1
    const versionLabel = String(nextVersion).padStart(4, '0')
    const fileName = `${docId}_v${versionLabel}.json`
    const fullPath = path.join(frameworksDir, fileName)
    const relativePath = path.relative(rootDir, fullPath)

    await fs.writeFile(fullPath, JSON.stringify(bundle, null, 2), 'utf8')

    return { relativePath }
  }

  async updateIndexesForBundle (
    tenantId: TenantId,
    version: CaseVersion,
    bundle: {
      document: any
      items?: any[]
      associations?: any[]
    },
    relativePath: string
  ): Promise<void> {
    const rootDir = this.getTenantVersionRootDir(tenantId, version)
    const idxDir = path.join(rootDir, 'indexes')
    await fs.mkdir(idxDir, { recursive: true })

    const doc = bundle.document
    const docId = (doc.sourcedId ?? doc.identifier) as string
    const lastChangeDateTime = new Date(doc.lastChangeDateTime as string | number | Date)

    // Update in-memory indexes
    this.updateInMemoryDocumentIndex(tenantId, version, docId, doc, relativePath)
    this.updateInMemoryDocumentVersionsIndex(tenantId, version, docId, relativePath, lastChangeDateTime, doc.version as string | undefined)
    this.updateInMemoryItemsIndex(tenantId, version, bundle.items ?? [], docId)
    this.updateInMemoryAssociationsIndex(tenantId, version, bundle.associations ?? [], docId)

    // Write index files to disk
    await this.writeDocumentsIndex(idxDir, tenantId, version)
    await this.writeDocumentVersionsIndex(idxDir, tenantId, version)
    await this.writeItemsIndex(idxDir, tenantId, version)
    await this.writeAssociationsIndex(idxDir, tenantId, version)
  }

  private updateInMemoryDocumentIndex (
    tenantId: TenantId,
    version: CaseVersion,
    docId: string,
    doc: any,
    relativePath: string
  ): void {
    let tenantMap = this.documents.get(tenantId)
    if (!tenantMap) {
      tenantMap = new Map()
      this.documents.set(tenantId, tenantMap)
    }
    let versionMap = tenantMap.get(version)
    if (!versionMap) {
      versionMap = new Map()
      tenantMap.set(version, versionMap)
    }

    versionMap.set(docId, {
      sourcedId: docId,
      title: doc.title as string,
      language: doc.language as string | undefined,
      frameworkType: doc.frameworkType as string | undefined,
      subject: doc.subject as string | undefined,
      version: doc.version as string | undefined,
      lastChangeDateTime: new Date(doc.lastChangeDateTime as string | number | Date),
      currentFile: relativePath
    })
  }

  private updateInMemoryDocumentVersionsIndex (
    tenantId: TenantId,
    version: CaseVersion,
    docId: string,
    relativePath: string,
    lastChangeDateTime: Date,
    docVersion?: string
  ): void {
    let tenantMap = this.documentVersions.get(tenantId)
    if (!tenantMap) {
      tenantMap = new Map()
      this.documentVersions.set(tenantId, tenantMap)
    }
    let versionMap = tenantMap.get(version)
    if (!versionMap) {
      versionMap = new Map()
      tenantMap.set(version, versionMap)
    }

    const versions = versionMap.get(docId) ?? []
    versions.push({
      file: relativePath,
      lastChangeDateTime,
      version: docVersion
    })
    versionMap.set(docId, versions)
  }

  private updateInMemoryItemsIndex (
    tenantId: TenantId,
    version: CaseVersion,
    items: any[],
    docId: string
  ): void {
    let tenantMap = this.itemsIndex.get(tenantId)
    if (!tenantMap) {
      tenantMap = new Map()
      this.itemsIndex.set(tenantId, tenantMap)
    }
    let versionMap = tenantMap.get(version)
    if (!versionMap) {
      versionMap = new Map()
      tenantMap.set(version, versionMap)
    }

    for (const item of items) {
      const itemId = (item.sourcedId ?? item.identifier) as string | undefined
      if (itemId) {
        versionMap.set(itemId, { docSourcedId: docId })
      }
    }
  }

  private updateInMemoryAssociationsIndex (
    tenantId: TenantId,
    version: CaseVersion,
    associations: any[],
    docId: string
  ): void {
    let tenantMap = this.assocIndex.get(tenantId)
    if (!tenantMap) {
      tenantMap = new Map()
      this.assocIndex.set(tenantId, tenantMap)
    }
    let versionMap = tenantMap.get(version)
    if (!versionMap) {
      versionMap = new Map()
      tenantMap.set(version, versionMap)
    }

    for (const assoc of associations) {
      const assocId = (assoc.sourcedId ?? assoc.identifier) as string | undefined
      if (assocId) {
        versionMap.set(assocId, { docSourcedId: docId })
      }
    }
  }

  private async writeDocumentsIndex (
    idxDir: string,
    tenantId: TenantId,
    version: CaseVersion
  ): Promise<void> {
    const versionMap = this.documents.get(tenantId)?.get(version)
    if (!versionMap) return

    const documents = Array.from(versionMap.values()).map(meta => ({
      sourcedId: meta.sourcedId,
      title: meta.title,
      language: meta.language,
      frameworkType: meta.frameworkType,
      subject: meta.subject,
      version: meta.version,
      lastChangeDateTime: meta.lastChangeDateTime.toISOString(),
      currentFile: meta.currentFile
    }))

    await fs.writeFile(
      path.join(idxDir, 'documents.json'),
      JSON.stringify(documents, null, 2),
      'utf8'
    )
  }

  private async writeDocumentVersionsIndex (
    idxDir: string,
    tenantId: TenantId,
    version: CaseVersion
  ): Promise<void> {
    const versionMap = this.documentVersions.get(tenantId)?.get(version)
    if (!versionMap) return

    const versions: Record<string, any[]> = {}
    for (const [docId, vers] of versionMap.entries()) {
      versions[docId] = vers.map(v => ({
        file: v.file,
        lastChangeDateTime: v.lastChangeDateTime.toISOString(),
        version: v.version
      }))
    }

    await fs.writeFile(
      path.join(idxDir, 'document-versions.json'),
      JSON.stringify(versions, null, 2),
      'utf8'
    )
  }

  private async writeItemsIndex (
    idxDir: string,
    tenantId: TenantId,
    version: CaseVersion
  ): Promise<void> {
    const versionMap = this.itemsIndex.get(tenantId)?.get(version)
    if (!versionMap) return

    const items: Record<string, { docSourcedId: string }> = {}
    for (const [itemId, entry] of versionMap.entries()) {
      items[itemId] = { docSourcedId: entry.docSourcedId }
    }

    await fs.writeFile(
      path.join(idxDir, 'items.json'),
      JSON.stringify(items, null, 2),
      'utf8'
    )
  }

  private async writeAssociationsIndex (
    idxDir: string,
    tenantId: TenantId,
    version: CaseVersion
  ): Promise<void> {
    const versionMap = this.assocIndex.get(tenantId)?.get(version)
    if (!versionMap) return

    const associations: Record<string, { docSourcedId: string }> = {}
    for (const [assocId, entry] of versionMap.entries()) {
      associations[assocId] = { docSourcedId: entry.docSourcedId }
    }

    await fs.writeFile(
      path.join(idxDir, 'associations.json'),
      JSON.stringify(associations, null, 2),
      'utf8'
    )
  }
}
