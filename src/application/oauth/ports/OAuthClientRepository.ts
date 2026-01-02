import { OAuthClient } from '../../../domain/oauth/entities/OAuthClient';
import { type TenantId } from '../../../domain/case/value-objects/Identifiers';

export interface OAuthClientRepository {
  findByClientId(clientId: string): Promise<OAuthClient | null>;
  findByTenantId(tenantId: TenantId): Promise<OAuthClient[]>;
  save(client: OAuthClient): Promise<void>;
  delete(clientId: string): Promise<void>;
}

