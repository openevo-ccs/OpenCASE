import { OAuthClientRepository } from '../ports/OAuthClientRepository'
import { type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'

export interface DeleteOAuthClientCommand {
  clientId: string
  tenantId?: TenantId // Optional: verify client belongs to this tenant
}

export class DeleteOAuthClient {
  constructor(
    private readonly clientRepo: OAuthClientRepository
  ) {}

  async execute(cmd: DeleteOAuthClientCommand): Promise<void> {
    logger.info({ clientId: cmd.clientId, tenantId: cmd.tenantId }, 'Executing DeleteOAuthClient')

    const client = await this.clientRepo.findByClientId(cmd.clientId)
    if (!client) {
      throw new Error(`OAuth client '${cmd.clientId}' not found`)
    }

    // Verify tenant if provided
    if (cmd.tenantId && client.tenantId !== cmd.tenantId) {
      throw new Error(`OAuth client '${cmd.clientId}' does not belong to tenant '${cmd.tenantId}'`)
    }

    await this.clientRepo.delete(cmd.clientId)

    logger.info({ clientId: cmd.clientId }, 'OAuth client deleted successfully')
  }
}

