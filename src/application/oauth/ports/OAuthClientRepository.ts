import { OAuthClient } from '../../../domain/oauth/entities/OAuthClient';

export interface OAuthClientRepository {
  findByClientId(clientId: string): Promise<OAuthClient | null>;
}

