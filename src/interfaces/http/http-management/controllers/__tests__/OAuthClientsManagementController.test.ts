import { Request, Response } from 'express'
import { OAuthClientsManagementController } from '../OAuthClientsManagementController'
import { CreateOAuthClient } from '../../../../../application/oauth/endpoints/CreateOAuthClient'
import { DeleteOAuthClient } from '../../../../../application/oauth/endpoints/DeleteOAuthClient'
import { ListTenantClients } from '../../../../../application/oauth/endpoints/ListTenantClients'

describe('OAuthClientsManagementController', () => {
  let controller: OAuthClientsManagementController
  let mockCreateOAuthClient: jest.Mocked<CreateOAuthClient>
  let mockDeleteOAuthClient: jest.Mocked<DeleteOAuthClient>
  let mockListTenantClients: jest.Mocked<ListTenantClients>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockCreateOAuthClient = {
      execute: jest.fn().mockResolvedValue({
        clientId: 'test-client',
        clientSecret: 'test-secret',
        tenantId: 'test-tenant',
        grantTypes: ['client_credentials'],
        scopes: ['case.read'],
        active: true
      })
    } as any

    mockDeleteOAuthClient = {
      execute: jest.fn().mockResolvedValue(undefined)
    } as any

    mockListTenantClients = {
      execute: jest.fn().mockResolvedValue({
        clients: [
          {
            clientId: 'client-1',
            grantTypes: ['client_credentials'],
            scopes: ['case.read'],
            active: true
          }
        ],
        total: 1
      })
    } as any

    controller = new OAuthClientsManagementController(
      mockCreateOAuthClient,
      mockDeleteOAuthClient,
      mockListTenantClients
    )

    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnValue({ json: responseJson })

    mockRequest = {
      params: { tenantId: 'test-tenant' },
      body: {}
    }

    mockResponse = {
      status: responseStatus,
      json: responseJson
    }
  })

  describe('create', () => {
    it('should create OAuth client successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.body = {
        grantTypes: ['client_credentials'],
        scopes: ['case.read']
      }

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(mockCreateOAuthClient.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        grantTypes: ['client_credentials'],
        scopes: ['case.read'],
        active: true,
        autoGenerateSecret: false
      })
      expect(responseStatus).toHaveBeenCalledWith(201)
      expect(responseJson).toHaveBeenCalledWith({
        clientId: 'test-client',
        clientSecret: 'test-secret',
        tenantId: 'test-tenant',
        grantTypes: ['client_credentials'],
        scopes: ['case.read'],
        active: true
      })
    })

    it('should return 403 when tenant mismatch', async () => {
      ;(mockRequest as any).tenantId = 'different-tenant'
      mockRequest.body = { grantTypes: ['client_credentials'] }

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Tenant mismatch - authenticated tenant does not match URL parameter'
      })
    })

    it('should return 400 when grantTypes is missing', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.body = {}

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'grantTypes is required'
      })
    })

    it('should return 409 when client already exists', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.body = {
        clientId: 'existing-client',
        grantTypes: ['client_credentials']
      }
      mockCreateOAuthClient.execute.mockRejectedValueOnce(
        new Error("OAuth client 'existing-client' already exists")
      )

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(409)
    })
  })

  describe('list', () => {
    it('should list clients successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.list(mockRequest as Request, mockResponse as Response)

      expect(mockListTenantClients.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        clients: expect.any(Array),
        total: 1
      })
    })
  })

  describe('delete', () => {
    it('should delete client successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.params = { ...mockRequest.params, clientId: 'test-client' }

      await controller.delete(mockRequest as Request, mockResponse as Response)

      expect(mockDeleteOAuthClient.execute).toHaveBeenCalledWith({
        clientId: 'test-client',
        tenantId: 'test-tenant'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({ status: 'deleted' })
    })

    it('should return 404 when client not found', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.params = { ...mockRequest.params, clientId: 'non-existent' }
      mockDeleteOAuthClient.execute.mockRejectedValueOnce(
        new Error("OAuth client 'non-existent' not found")
      )

      await controller.delete(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
    })
  })
})

