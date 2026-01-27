import { OAuthClientRepository } from '../ports/OAuthClientRepository'
import { OAuthClient } from '../../../domain/oauth/entities/OAuthClient'
import { type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'
import { randomBytes } from 'crypto'

export interface CreateOAuthClientCommand {
  tenantId: TenantId
  clientId?: string
  clientSecret?: string
  grantTypes: string[]
  scopes?: string[]
  active?: boolean
  autoGenerateSecret?: boolean
}

export interface CreateOAuthClientResult {
  clientId: string
  clientSecret: string
  tenantId: TenantId
  grantTypes: string[]
  scopes: string[]
  active: boolean
}

export class CreateOAuthClient {
  constructor(
    private readonly clientRepo: OAuthClientRepository
  ) {}

  async execute(cmd: CreateOAuthClientCommand): Promise<CreateOAuthClientResult> {
    logger.info({ tenantId: cmd.tenantId }, 'Executing CreateOAuthClient')

    // Generate client ID if not provided
    const clientId = cmd.clientId || this.generateClientId()

    // Check if client already exists
    const existing = await this.clientRepo.findByClientId(clientId)
    if (existing) {
      throw new Error(`OAuth client '${clientId}' already exists`)
    }

    // Generate client secret if not provided or if auto-generate requested
    let clientSecret: string
    if (cmd.autoGenerateSecret || !cmd.clientSecret) {
      clientSecret = this.generateClientSecret()
    } else {
      clientSecret = cmd.clientSecret
    }

    // Validate grant types
    const validGrantTypes = ['client_credentials', 'authorization_code']
    for (const grantType of cmd.grantTypes) {
      if (!validGrantTypes.includes(grantType)) {
        throw new Error(`Invalid grant type: ${grantType}. Must be one of: ${validGrantTypes.join(', ')}`)
      }
    }

    // Create client
    const client = OAuthClient.create({
      clientId,
      clientSecret,
      tenantId: cmd.tenantId,
      grantTypes: cmd.grantTypes,
      scopes: cmd.scopes,
      active: cmd.active ?? true
    })

    await this.clientRepo.save(client)

    logger.info({ clientId, tenantId: cmd.tenantId }, 'OAuth client created successfully')

    return {
      clientId,
      clientSecret,
      tenantId: cmd.tenantId,
      grantTypes: cmd.grantTypes,
      scopes: cmd.scopes || [],
      active: client.active
    }
  }

  private generateClientId(): string {
    return `client-${randomBytes(16).toString('base64url')}`
  }

  private generateClientSecret(): string {
    return randomBytes(32).toString('base64url')
  }
}













