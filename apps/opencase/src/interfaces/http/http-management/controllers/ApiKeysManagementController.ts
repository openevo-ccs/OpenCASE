/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { randomBytes } from 'node:crypto'
import { type Request, type Response } from 'express'
import { KeycloakAdminClient } from '../../../../infrastructure/keycloak/KeycloakAdminClient'
import { OidcJwtVerifier } from '../../../../infrastructure/auth/OidcJwtVerifier'
import { logger } from '../../../../infrastructure/logging/Logger'

export interface ApiKeysControllerConfig {
  clientIdPrefix: string
}

/**
 * Management controller for tenant-level API keys.
 *
 * Each API key is modelled as a Keycloak **confidential client** with the
 * `client_credentials` grant enabled.  External systems use the issued
 * `clientId` / `clientSecret` pair to obtain an access token from Keycloak's
 * token endpoint, which they then present as a Bearer token when calling the
 * CASE Provider API.
 *
 * All endpoints require the `case.owner` scope.
 */
export class ApiKeysManagementController {
  constructor (
    private readonly admin: KeycloakAdminClient,
    private readonly cfg: ApiKeysControllerConfig
  ) {}

  // ── Helpers ────────────────────────────────────────────────────

  /** Derive the prefix used for all API-key client IDs within a tenant. */
  private apiKeyPrefix (tenantId: string): string {
    return `${tenantId}-api-`
  }

  /** Validate that the requesting user's tenantId matches the URL param. */
  private checkTenantAccess (req: Request, res: Response): string | null {
    const tokenTenantId = (req as any).tenantId as string | undefined
    const rawUrlTenantId = req.params.tenantId
    const urlTenantId = Array.isArray(rawUrlTenantId) ? rawUrlTenantId[0] : rawUrlTenantId
    if (!tokenTenantId || !urlTenantId) {
      res.status(400).json({ error: 'Missing tenantId' })
      return null
    }
    if (tokenTenantId !== urlTenantId) {
      res.status(403).json({ error: 'Tenant mismatch' })
      return null
    }
    return urlTenantId
  }

  // ── Handlers ───────────────────────────────────────────────────

  /**
   * GET /management/tenants/:tenantId/api-keys
   *
   * List all API keys for the tenant.
   */
  list = async (req: Request, res: Response) => {
    try {
      const tenantId = this.checkTenantAccess(req, res)
      if (!tenantId) return

      const prefix = this.apiKeyPrefix(tenantId)
      const clients = await this.admin.listClientsByPrefix(prefix)

      const keys = clients.map((c) => ({
        id: c.id,
        clientId: c.clientId,
        description: c.description
      }))

      res.status(200).json({ apiKeys: keys })
    } catch (error: any) {
      logger.error({ error }, 'Failed to list API keys')
      res.status(500).json({ error: error.message || 'Failed to list API keys' })
    }
  }

  /**
   * POST /management/tenants/:tenantId/api-keys
   *
   * Create a new API key (Keycloak confidential client).
   * Returns the clientId and clientSecret — the secret is only visible at
   * creation time.
   */
  create = async (req: Request, res: Response) => {
    try {
      const tenantId = this.checkTenantAccess(req, res)
      if (!tenantId) return

      const description = typeof req.body?.description === 'string'
        ? req.body.description.trim()
        : ''

      // Generate a short random suffix for the clientId
      const shortId = randomBytes(6).toString('hex')
      const apiKeyClientId = `${this.apiKeyPrefix(tenantId)}${shortId}`

      // 1. Create the confidential client in Keycloak
      const { id: clientUuid, secret } = await this.admin.createConfidentialClient({
        clientId: apiKeyClientId,
        description
      })

      // 2. Create `case.read` role on this API-key client
      await this.admin.ensureClientRole(clientUuid, 'case.read')

      // 3. Protocol mapper: inject `tenantId` claim
      await this.admin.ensureProtocolMapper(clientUuid, {
        name: 'tenantId',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-hardcoded-claim-mapper',
        config: {
          'claim.name': 'tenantId',
          'claim.value': tenantId,
          'jsonType.label': 'String',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true'
        }
      })

      // 4. Protocol mapper: map client roles → `scope` claim
      await this.admin.ensureProtocolMapper(clientUuid, {
        name: 'scope',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-client-role-mapper',
        config: {
          clientId: apiKeyClientId,
          rolePrefix: '',
          'claim.name': 'scope',
          'jsonType.label': 'String',
          multivalued: 'true',
          'access.token.claim': 'true',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'true'
        }
      })

      // 5. Protocol mapper: hardcoded audience so the existing JWT verifier
      //    accepts the token (it checks aud / azp against `tenant-{tenantId}`)
      const tenantSpaClientId = OidcJwtVerifier.computeTenantClientId(
        this.cfg.clientIdPrefix,
        tenantId
      )
      await this.admin.ensureProtocolMapper(clientUuid, {
        name: 'audience',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-audience-mapper',
        config: {
          'included.client.audience': tenantSpaClientId,
          'id.token.claim': 'false',
          'access.token.claim': 'true'
        }
      })

      // 6. Assign `case.read` role to the service-account user
      const { id: saUserId } = await this.admin.getServiceAccountUser(clientUuid)
      await this.admin.assignClientRoles(saUserId, clientUuid, ['case.read'])

      logger.info({ tenantId, apiKeyClientId }, 'Created API key')

      res.status(201).json({
        clientId: apiKeyClientId,
        clientSecret: secret,
        description
      })
    } catch (error: any) {
      logger.error({ error }, 'Failed to create API key')
      res.status(500).json({ error: error.message || 'Failed to create API key' })
    }
  }

  /**
   * DELETE /management/tenants/:tenantId/api-keys/:keyId
   *
   * Delete an API key.  `:keyId` is the Keycloak-internal UUID of the client.
   */
  delete = async (req: Request, res: Response) => {
    try {
      const tenantId = this.checkTenantAccess(req, res)
      if (!tenantId) return

      const rawKeyId = req.params.keyId
      const keyId = Array.isArray(rawKeyId) ? rawKeyId[0] : rawKeyId
      if (!keyId) {
        res.status(400).json({ error: 'Missing keyId' })
        return
      }

      // Verify the client belongs to this tenant before deleting
      const client = await this.admin.getClientByUuid(keyId)
      if (!client) {
        res.status(404).json({ error: 'API key not found' })
        return
      }

      const prefix = this.apiKeyPrefix(tenantId)
      if (!client.clientId.startsWith(prefix)) {
        res.status(403).json({ error: 'API key does not belong to this tenant' })
        return
      }

      await this.admin.deleteClient(keyId)

      logger.info({ tenantId, clientId: client.clientId }, 'Deleted API key')

      res.status(200).json({ status: 'deleted' })
    } catch (error: any) {
      logger.error({ error }, 'Failed to delete API key')
      res.status(500).json({ error: error.message || 'Failed to delete API key' })
    }
  }
}
