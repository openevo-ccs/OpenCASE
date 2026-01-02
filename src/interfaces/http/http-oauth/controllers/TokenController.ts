import { Request, Response } from 'express';
import { IssueToken } from '../../../../application/oauth/endpoints/IssueToken';
import { IssueTokenFromCode } from '../../../../application/oauth/endpoints/IssueTokenFromCode';
import { IssueTokenFromRefresh } from '../../../../application/oauth/endpoints/IssueTokenFromRefresh';

export class TokenController {
  constructor(
    private readonly issueToken: IssueToken,
    private readonly issueTokenFromCode?: IssueTokenFromCode,
    private readonly issueTokenFromRefresh?: IssueTokenFromRefresh
  ) {}

  token = async (req: Request, res: Response) => {
    try {
      // OAuth2 token endpoint expects form-encoded or JSON
      const grantType = req.body.grant_type ?? req.body.grantType;
      const clientId = req.body.client_id ?? req.body.clientId;
      const clientSecret = req.body.client_secret ?? req.body.clientSecret;
      const scope = req.body.scope;
      const code = req.body.code;
      const redirectUri = req.body.redirect_uri;
      const codeVerifier = req.body.code_verifier;
      const refreshToken = req.body.refresh_token;

      if (!grantType) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'grant_type is required' });
      }

      if (!clientId) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'client_id is required' });
      }

      // Handle authorization_code grant
      if (grantType === 'authorization_code') {
        if (!this.issueTokenFromCode) {
          return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'authorization_code grant not supported' });
        }

        if (!code) {
          return res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
        }

        if (!redirectUri) {
          return res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' });
        }

        if (!codeVerifier) {
          return res.status(400).json({ error: 'invalid_request', error_description: 'code_verifier is required (PKCE)' });
        }

        const result = await this.issueTokenFromCode.execute({
          code,
          clientId,
          redirectUri,
          codeVerifier
        });

        const response: any = result.accessToken.toJSON();
        if (result.refreshToken) {
          response.refresh_token = result.refreshToken.token;
          response.refresh_token_expires_in = Math.floor((result.refreshToken.expiresAt.getTime() - Date.now()) / 1000);
        }

        return res.json(response);
      }

      // Handle refresh_token grant
      if (grantType === 'refresh_token') {
        if (!this.issueTokenFromRefresh) {
          return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'refresh_token grant not supported' });
        }

        if (!refreshToken) {
          return res.status(400).json({ error: 'invalid_request', error_description: 'refresh_token is required' });
        }

        const result = await this.issueTokenFromRefresh.execute({
          refreshToken,
          clientId
        });

        return res.json(result.accessToken.toJSON());
      }

      // Handle client_credentials grant (existing)
      if (!clientSecret) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'client_secret is required' });
      }

      const accessToken = await this.issueToken.execute({
        grantType,
        clientId,
        clientSecret,
        scope
      });

      res.json(accessToken.toJSON());
    } catch (error: any) {
      // Map domain errors to OAuth2 error responses
      if (error.message.includes('Invalid client')) {
        return res.status(401).json({ error: 'invalid_client', error_description: error.message });
      }
      if (error.message.includes('not active')) {
        return res.status(401).json({ error: 'invalid_client', error_description: error.message });
      }
      if (error.message.includes('Invalid client_secret')) {
        return res.status(401).json({ error: 'invalid_client', error_description: error.message });
      }
      if (error.message.includes('Unsupported grant_type')) {
        return res.status(400).json({ error: 'unsupported_grant_type', error_description: error.message });
      }
      if (error.message.includes('Invalid scope')) {
        return res.status(400).json({ error: 'invalid_scope', error_description: error.message });
      }

      return res.status(500).json({ error: 'server_error', error_description: error.message });
    }
  };
}


