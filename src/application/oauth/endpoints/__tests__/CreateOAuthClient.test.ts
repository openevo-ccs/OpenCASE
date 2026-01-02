import { CreateOAuthClient } from '../CreateOAuthClient'
import { OAuthClientRepository } from '../../ports/OAuthClientRepository'
import { OAuthClient } from '../../../../domain/oauth/entities/OAuthClient'

describe('CreateOAuthClient', () => {
  let mockClientRepo: jest.Mocked<OAuthClientRepository>
  let createOAuthClient: CreateOAuthClient

  beforeEach(() => {
    mockClientRepo = {
      findByClientId: jest.fn().mockResolvedValue(null),
      findByTenantId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn()
    } as any

    createOAuthClient = new CreateOAuthClient(mockClientRepo)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'

    it('should create OAuth client successfully', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        clientId: 'test-client',
        clientSecret: 'test-secret',
        grantTypes: ['client_credentials'],
        scopes: ['case.read', 'case.write']
      })

      expect(mockClientRepo.findByClientId).toHaveBeenCalledWith('test-client')
      expect(mockClientRepo.save).toHaveBeenCalled()
      expect(result.clientId).toBe('test-client')
      expect(result.clientSecret).toBe('test-secret')
      expect(result.tenantId).toBe(tenantId)
      expect(result.grantTypes).toEqual(['client_credentials'])
      expect(result.scopes).toEqual(['case.read', 'case.write'])
    })

    it('should auto-generate client ID when not provided', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        grantTypes: ['client_credentials']
      })

      expect(result.clientId).toBeDefined()
      expect(result.clientId).toMatch(/^client-/)
    })

    it('should auto-generate client secret when requested', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        clientId: 'test-client',
        grantTypes: ['client_credentials'],
        autoGenerateSecret: true
      })

      expect(result.clientSecret).toBeDefined()
      expect(result.clientSecret.length).toBeGreaterThan(0)
    })

    it('should default to active when not specified', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        clientId: 'test-client',
        grantTypes: ['client_credentials']
      })

      expect(result.active).toBe(true)
    })

    it('should throw error if client already exists', async () => {
      const existingClient = OAuthClient.create({
        clientId: 'existing-client',
        clientSecret: 'secret',
        tenantId,
        grantTypes: ['client_credentials'],
        active: true
      })

      mockClientRepo.findByClientId.mockResolvedValue(existingClient)

      await expect(
        createOAuthClient.execute({
          tenantId,
          clientId: 'existing-client',
          grantTypes: ['client_credentials']
        })
      ).rejects.toThrow("OAuth client 'existing-client' already exists")
    })

    it('should throw error for invalid grant type', async () => {
      await expect(
        createOAuthClient.execute({
          tenantId,
          clientId: 'test-client',
          grantTypes: ['invalid_grant_type']
        })
      ).rejects.toThrow('Invalid grant type')
    })

    it('should accept authorization_code grant type', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        clientId: 'test-client',
        grantTypes: ['authorization_code']
      })

      expect(result.grantTypes).toEqual(['authorization_code'])
    })

    it('should accept multiple grant types', async () => {
      const result = await createOAuthClient.execute({
        tenantId,
        clientId: 'test-client',
        grantTypes: ['client_credentials', 'authorization_code']
      })

      expect(result.grantTypes).toEqual(['client_credentials', 'authorization_code'])
    })
  })
})

