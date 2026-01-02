import { Express } from 'express';
import { TokenController } from './controllers/TokenController';
import { AuthorizeController } from './controllers/AuthorizeController';
import { RevokeController } from './controllers/RevokeController';

export interface OAuthDeps {
  tokenController: TokenController;
  authorizeController?: AuthorizeController;
  revokeController?: RevokeController;
}

export function registerOAuthRoutes(app: Express, deps: OAuthDeps) {
  // OAuth2 authorization endpoint
  if (deps.authorizeController) {
    app.get('/oauth/authorize', deps.authorizeController.authorize);
    app.post('/oauth/authorize', deps.authorizeController.authorize); // Support POST for form submissions
  }

  // OAuth2 token endpoint
  app.post('/oauth/token', deps.tokenController.token);

  // OAuth2 token revocation endpoint
  if (deps.revokeController) {
    app.post('/oauth/revoke', deps.revokeController.revoke);
  }

  // Optional: OAuth2 discovery endpoint (simplified)
  app.get('/.well-known/oauth-authorization-server', (_req, res) => {
    const grantTypes = ['client_credentials'];
    if (deps.authorizeController) {
      grantTypes.push('authorization_code', 'refresh_token');
    }

    res.json({
      issuer: 'opencase-oauth',
      authorization_endpoint: '/oauth/authorize',
      token_endpoint: '/oauth/token',
      revocation_endpoint: deps.revokeController ? '/oauth/revoke' : undefined,
      grant_types_supported: grantTypes,
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
      code_challenge_methods_supported: ['S256', 'plain'],
      response_types_supported: ['code'],
      scopes_supported: ['case.read', 'case.write', 'case.owner', 'case.admin']
    });
  });
}
