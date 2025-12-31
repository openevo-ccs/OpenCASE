import { Request, Response } from 'express';
import { IssueToken } from '../../../../application/oauth/endpoints/IssueToken';

export class TokenController {
  constructor(private readonly issueToken: IssueToken) {}

  token = async (req: Request, res: Response) => {
    try {
      // OAuth2 token endpoint expects form-encoded or JSON
      const grantType = req.body.grant_type ?? req.body.grantType;
      const clientId = req.body.client_id ?? req.body.clientId;
      const clientSecret = req.body.client_secret ?? req.body.clientSecret;
      const scope = req.body.scope;

      if (!grantType) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'grant_type is required' });
      }

      if (!clientId) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'client_id is required' });
      }

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


