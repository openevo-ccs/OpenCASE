import { Request, Response } from 'express'
import { CreateOAuthClient } from '../../../../application/oauth/endpoints/CreateOAuthClient'
import { DeleteOAuthClient } from '../../../../application/oauth/endpoints/DeleteOAuthClient'
import { ListTenantClients } from '../../../../application/oauth/endpoints/ListTenantClients'

export class OAuthClientsManagementController {
  constructor(
    private readonly createOAuthClient: CreateOAuthClient,
    private readonly deleteOAuthClient: DeleteOAuthClient,
    private readonly listTenantClients: ListTenantClients
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      const clientId = req.body.clientId
      const clientSecret = req.body.clientSecret
      const grantTypes = req.body.grantTypes
      const scopes = req.body.scopes
      const active = req.body.active !== undefined ? req.body.active : true
      const autoGenerateSecret = req.body.autoGenerateSecret ?? false

      if (!grantTypes || grantTypes.length === 0) {
        return res.status(400).json({ error: 'grantTypes is required' })
      }

      const result = await this.createOAuthClient.execute({
        tenantId,
        clientId,
        clientSecret,
        grantTypes,
        scopes,
        active,
        autoGenerateSecret
      })

      res.status(201).json({
        clientId: result.clientId,
        clientSecret: result.clientSecret, // Include secret in response (only time it's visible)
        tenantId: result.tenantId,
        grantTypes: result.grantTypes,
        scopes: result.scopes,
        active: result.active
      })
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ error: error.message })
      }
      if (error.message?.includes('Invalid grant type')) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Create failed' })
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId
      const clientId = req.params.clientId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      await this.deleteOAuthClient.execute({
        clientId,
        tenantId // Verify client belongs to tenant
      })

      res.status(200).json({ status: 'deleted' })
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: error.message })
      }
      if (error.message?.includes('does not belong')) {
        return res.status(403).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Delete failed' })
    }
  }

  list = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      const result = await this.listTenantClients.execute({
        tenantId
      })

      res.status(200).json(result)
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'List failed' })
    }
  }
}

