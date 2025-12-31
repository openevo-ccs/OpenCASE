import type { OAuthClientRepository } from '../ports/OAuthClientRepository';
import type { JwtSigner } from '../ports/JwtSigner';
import { AccessToken } from '../../../domain/oauth/entities/AccessToken';

export interface IssueTokenCommand {
  grantType: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

export class IssueToken {
  constructor(
    private readonly clientRepo: OAuthClientRepository,
    private readonly jwtSigner: JwtSigner,
    private readonly audience: string,
    private readonly defaultExpiresIn: number = 3600
  ) {}

  async execute(cmd: IssueTokenCommand): Promise<AccessToken> {
    // Validate grant type
    if (cmd.grantType !== 'client_credentials') {
      throw new Error(`Unsupported grant_type: ${cmd.grantType}`);
    }

    // Find and validate client
    const client = await this.clientRepo.findByClientId(cmd.clientId);
    if (!client) {
      throw new Error('Invalid client_id');
    }

    if (!client.active) {
      throw new Error('Client is not active');
    }

    if (!client.validateSecret(cmd.clientSecret)) {
      throw new Error('Invalid client_secret');
    }

    if (!client.supportsGrantType(cmd.grantType)) {
      throw new Error(`Grant type ${cmd.grantType} not supported for this client`);
    }

    // Validate scopes if provided
    if (cmd.scope) {
      const requestedScopes = cmd.scope.split(' ');
      for (const scope of requestedScopes) {
        if (!client.hasScope(scope)) {
          throw new Error(`Invalid scope: ${scope}`);
        }
      }
    }

    // Create JWT payload
    // Note: 'iss' (issuer) is set by JwtSignerImpl via options, not in payload
    const payload: Record<string, unknown> = {
      sub: cmd.clientId,
      tenantId: client.tenantId,
      client_id: cmd.clientId,
      aud: this.audience
    };

    if (cmd.scope) {
      payload.scope = cmd.scope;
    }

    // Sign token
    const token = this.jwtSigner.sign(payload, this.defaultExpiresIn);

    // Return access token
    return AccessToken.create({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.defaultExpiresIn,
      scope: cmd.scope
    });
  }
}


