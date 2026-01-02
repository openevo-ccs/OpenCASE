import { Request, Response } from 'express'
import { Authorize } from '../../../../application/oauth/endpoints/Authorize'

export class AuthorizeController {
  constructor(private readonly authorizeEndpoint: Authorize) {}

  authorize = async (req: Request, res: Response) => {
    try {
      // OAuth2 authorization endpoint parameters
      const clientId = req.query.client_id as string
      const redirectUri = req.query.redirect_uri as string
      const responseType = req.query.response_type as string
      const scope = req.query.scope as string | undefined
      const state = req.query.state as string | undefined
      const codeChallenge = req.query.code_challenge as string
      const codeChallengeMethod = (req.query.code_challenge_method as string) || 'S256'

      // Validate required parameters
      if (!clientId) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'client_id is required' })
      }

      if (!redirectUri) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' })
      }

      if (responseType !== 'code') {
        return res.status(400).json({ error: 'unsupported_response_type', error_description: 'response_type must be "code"' })
      }

      if (!codeChallenge) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'code_challenge is required (PKCE)' })
      }

      if (codeChallengeMethod !== 'S256' && codeChallengeMethod !== 'plain') {
        return res.status(400).json({ error: 'invalid_request', error_description: 'code_challenge_method must be "S256" or "plain"' })
      }

      // For now, we'll expect email/password in the request body
      // In a real implementation, this would be a login form
      const email = req.body.email
      const password = req.body.password

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'invalid_request', 
          error_description: 'email and password are required',
          // In production, redirect to login form
          login_required: true
        })
      }

      const result = await this.authorizeEndpoint.execute({
        email,
        password,
        clientId,
        redirectUri,
        scope,
        codeChallenge,
        codeChallengeMethod: codeChallengeMethod as 'S256' | 'plain',
        state
      })

      // Redirect to redirect_uri with authorization code
      const redirectUrl = new URL(redirectUri)
      redirectUrl.searchParams.set('code', result.code)
      if (result.state) {
        redirectUrl.searchParams.set('state', result.state)
      }

      res.redirect(redirectUrl.toString())
    } catch (error: any) {
      // Map errors to OAuth2 error responses
      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({ error: 'invalid_grant', error_description: error.message })
      }
      if (error.message.includes('Invalid client')) {
        return res.status(401).json({ error: 'invalid_client', error_description: error.message })
      }
      if (error.message.includes('not active')) {
        return res.status(401).json({ error: 'invalid_client', error_description: error.message })
      }

      return res.status(400).json({ error: 'invalid_request', error_description: error.message })
    }
  }
}

