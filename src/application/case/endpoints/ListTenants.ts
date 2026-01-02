import fs from 'node:fs/promises'
import path from 'node:path'
import { logger } from '../../../infrastructure/logging/Logger'

export interface ListTenantsQuery {
  baseDataDir: string
}

export class ListTenants {
  async execute (query: ListTenantsQuery) {
    logger.info({ baseDataDir: query.baseDataDir }, 'Executing ListTenants')

    const tenantsDir = path.join(query.baseDataDir, 'tenants')
    let tenantNames: string[]
    
    try {
      const entries = await fs.readdir(tenantsDir, { withFileTypes: true })
      tenantNames = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return { tenants: [], total: 0 }
      }
      throw error
    }

    // Get additional info for each tenant
    const tenants = await Promise.all(
      tenantNames.map(async (tenantId) => {
        const tenantPath = path.join(tenantsDir, tenantId)
        let hasFrameworks = false
        
        try {
          // Check if tenant has any frameworks
          const v1p1Path = path.join(tenantPath, 'v1p1')
          const v1p0Path = path.join(tenantPath, 'v1p0')
          
          const [v1p1Exists, v1p0Exists] = await Promise.all([
            fs.access(v1p1Path).then(() => true).catch(() => false),
            fs.access(v1p0Path).then(() => true).catch(() => false)
          ])
          
          if (v1p1Exists || v1p0Exists) {
            hasFrameworks = true
          }
        } catch {
          // Ignore errors
        }

        return {
          tenantId,
          hasFrameworks
        }
      })
    )

    return {
      tenants,
      total: tenants.length
    }
  }
}

