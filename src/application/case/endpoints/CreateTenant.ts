import fs from 'node:fs/promises'
import path from 'node:path'
import { logger } from '../../../infrastructure/logging/Logger'

export interface CreateTenantCommand {
  baseDataDir: string
  tenantId: string
}

export class CreateTenant {
  async execute (cmd: CreateTenantCommand): Promise<void> {
    logger.info({ tenantId: cmd.tenantId }, 'Executing CreateTenant')

    const tenantsDir = path.join(cmd.baseDataDir, 'tenants')
    const tenantPath = path.join(tenantsDir, cmd.tenantId)

    // Check if tenant already exists
    try {
      const stat = await fs.stat(tenantPath)
      if (stat.isDirectory()) {
        throw new Error(`Tenant '${cmd.tenantId}' already exists`)
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    // Create tenant directory structure
    await fs.mkdir(tenantPath, { recursive: true })
    
    // Create version directories
    const v1p1Path = path.join(tenantPath, 'v1p1')
    const v1p0Path = path.join(tenantPath, 'v1p0')
    
    await fs.mkdir(v1p1Path, { recursive: true })
    await fs.mkdir(v1p0Path, { recursive: true })
    
    // Create indexes directories
    await fs.mkdir(path.join(v1p1Path, 'indexes'), { recursive: true })
    await fs.mkdir(path.join(v1p0Path, 'indexes'), { recursive: true })
    
    // Create frameworks directories
    await fs.mkdir(path.join(v1p1Path, 'frameworks'), { recursive: true })
    await fs.mkdir(path.join(v1p0Path, 'frameworks'), { recursive: true })

    // Initialize empty index files
    const indexFiles = ['documents.json', 'document-versions.json', 'items.json', 'associations.json']
    for (const indexFile of indexFiles) {
      await fs.writeFile(
        path.join(v1p1Path, 'indexes', indexFile),
        JSON.stringify([], null, 2),
        'utf8'
      )
      await fs.writeFile(
        path.join(v1p0Path, 'indexes', indexFile),
        JSON.stringify([], null, 2),
        'utf8'
      )
    }

    logger.info({ tenantId: cmd.tenantId }, 'Tenant created successfully')
  }
}

