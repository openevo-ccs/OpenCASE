import { Express } from 'express';
import { TokenController } from './controllers/TokenController';

export interface OAuthDeps {
  tokenController: TokenController;
}

export function registerOAuthRoutes(app: Express, deps: OAuthDeps) {
  // OAuth2 token endpoint
  app.post('/oauth/token', deps.tokenController.token);

  // Optional: OAuth2 discovery endpoint (simplified)
  app.get('/.well-known/oauth-authorization-server', (_req, res) => {
    res.json({
      issuer: 'opencase-oauth',
      token_endpoint: '/oauth/token',
      grant_types_supported: ['client_credentials'],
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic']
    });
  });
}


