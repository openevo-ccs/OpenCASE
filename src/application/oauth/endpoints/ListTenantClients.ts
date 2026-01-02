import { OAuthClientRepository } from '../ports/OAuthClientRepository'
import { type TenantId } from '../../../domain/case/value-objects/Identifiers'
import { logger } from '../../../infrastructure/logging/Logger'

export interface ListTenantClientsQuery {
  tenantId: TenantId
}

export interface TenantClientInfo {
  clientId: string
  grantTypes: string[]
  scopes: string[]
  active: boolean
}

export class ListTenantClients {
  constructor(
    private readonly clientRepo: OAuthClientRepository
  ) {}

  async execute(query: ListTenantClientsQuery): Promise<{ clients: TenantClientInfo[]; total: number }> {
    logger.info({ tenantId: query.tenantId }, 'Executing ListTenantClients')

    const clients = await this.clientRepo.findByTenantId(query.tenantId)

    const clientInfos: TenantClientInfo[] = clients.map(client => ({
      clientId: client.clientId,
      grantTypes: client.grantTypes,
      scopes: client.scopes,
      active: client.active
    }))

    return {
      clients: clientInfos,
      total: clientInfos.length
    }
  }
}

