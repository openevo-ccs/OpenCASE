import { Request, Response } from 'express'
import { RevokeToken } from '../../../../application/oauth/endpoints/RevokeToken'

export class RevokeController {
  constructor(private readonly revokeToken: RevokeToken) {}

  revoke = async (req: Request, res: Response) => {
    try {
      const token = req.body.token
      const tokenTypeHint = req.body.token_type_hint // Optional: 'access_token' or 'refresh_token'
      const clientId = req.body.client_id

      if (!token) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'token is required' })
      }

      if (!clientId) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'client_id is required' })
      }

      // Only refresh tokens can be revoked (access tokens are stateless JWTs)
      if (tokenTypeHint && tokenTypeHint !== 'refresh_token') {
        // Still try to revoke, but log that it might not be a refresh token
      }

      await this.revokeToken.execute({
        token,
        clientId
      })

      // RFC 7009: revocation endpoint returns 200 OK even if token doesn't exist
      res.status(200).json({ revoked: true })
    } catch (error: any) {
      if (error.message.includes('Client ID mismatch')) {
        return res.status(400).json({ error: 'invalid_client', error_description: error.message })
      }

      return res.status(400).json({ error: 'invalid_request', error_description: error.message })
    }
  }
}

