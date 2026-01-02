import { Request, Response } from 'express'
import { AuthorizeController } from '../AuthorizeController'
import { Authorize } from '../../../../../application/oauth/endpoints/Authorize'

describe('AuthorizeController', () => {
  let controller: AuthorizeController
  let mockAuthorize: jest.Mocked<Authorize>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock
  let responseRedirect: jest.Mock

  beforeEach(() => {
    mockAuthorize = {
      execute: jest.fn().mockResolvedValue({
        code: 'auth-code-123',
        state: 'state-123'
      })
    } as any

    controller = new AuthorizeController(mockAuthorize)

    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnValue({ json: responseJson })
    responseRedirect = jest.fn()

    mockRequest = {
      query: {},
      body: {}
    }

    mockResponse = {
      status: responseStatus,
      json: responseJson,
      redirect: responseRedirect
    }
  })

  describe('authorize', () => {
    it('should redirect with authorization code', async () => {
      mockRequest.query = {
        client_id: 'react-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        code_challenge: 'challenge-123',
        code_challenge_method: 'S256',
        state: 'state-123'
      }
      mockRequest.body = {
        email: 'user@example.com',
        password: 'password123'
      }

      await controller.authorize(mockRequest as Request, mockResponse as Response)

      expect(mockAuthorize.execute).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        clientId: 'react-client',
        redirectUri: 'http://localhost:3000/callback',
        scope: undefined,
        codeChallenge: 'challenge-123',
        codeChallengeMethod: 'S256',
        state: 'state-123'
      })
      expect(responseRedirect).toHaveBeenCalledWith(
        expect.stringContaining('code=auth-code-123')
      )
    })

    it('should return 400 when client_id is missing', async () => {
      mockRequest.query = {
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code'
      }

      await controller.authorize(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'invalid_request',
        error_description: 'client_id is required'
      })
    })

    it('should return 400 when response_type is not code', async () => {
      mockRequest.query = {
        client_id: 'react-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'token'
      }

      await controller.authorize(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'unsupported_response_type',
        error_description: 'response_type must be "code"'
      })
    })

    it('should return 400 when code_challenge is missing', async () => {
      mockRequest.query = {
        client_id: 'react-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code'
      }

      await controller.authorize(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'invalid_request',
        error_description: 'code_challenge is required (PKCE)'
      })
    })
  })
})

