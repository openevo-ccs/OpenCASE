import { OAuthClientRepository } from '../../application/oauth/ports/OAuthClientRepository';
import { OAuthClient } from '../../domain/oauth/entities/OAuthClient';
import { type TenantId } from '../../domain/case/value-objects/Identifiers';

export class InMemoryOAuthClientRepository implements OAuthClientRepository {
  private clients = new Map<string, OAuthClient>();

  constructor(initialClients: OAuthClient[] = []) {
    for (const client of initialClients) {
      this.clients.set(client.clientId, client);
    }
  }

  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    return this.clients.get(clientId) ?? null;
  }

  async findByTenantId(tenantId: TenantId): Promise<OAuthClient[]> {
    return Array.from(this.clients.values()).filter(
      client => client.tenantId === tenantId
    );
  }

  async save(client: OAuthClient): Promise<void> {
    this.clients.set(client.clientId, client);
  }

  async delete(clientId: string): Promise<void> {
    this.clients.delete(clientId);
  }

  addClient(client: OAuthClient): void {
    this.clients.set(client.clientId, client);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  getAllClients(): OAuthClient[] {
    return Array.from(this.clients.values());
  }
}


