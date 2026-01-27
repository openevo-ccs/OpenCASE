import { DeleteOAuthClient } from '../DeleteOAuthClient'
import { OAuthClientRepository } from '../../ports/OAuthClientRepository'
import { OAuthClient } from '../../../../domain/oauth/entities/OAuthClient'

describe('DeleteOAuthClient', () => {
  let mockClientRepo: jest.Mocked<OAuthClientRepository>
  let deleteOAuthClient: DeleteOAuthClient

  beforeEach(() => {
    mockClientRepo = {
      findByClientId: jest.fn(),
      findByTenantId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined)
    } as any

    deleteOAuthClient = new DeleteOAuthClient(mockClientRepo)
  })

  describe('execute', () => {
    const clientId = 'test-client'
    const tenantId = 'test-tenant'
    const client = OAuthClient.create({
      clientId,
      clientSecret: 'secret',
      tenantId,
      grantTypes: ['client_credentials'],
      active: true
    })

    it('should delete OAuth client successfully', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)

      await deleteOAuthClient.execute({ clientId })

      expect(mockClientRepo.findByClientId).toHaveBeenCalledWith(clientId)
      expect(mockClientRepo.delete).toHaveBeenCalledWith(clientId)
    })

    it('should verify tenant when provided', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)

      await deleteOAuthClient.execute({ clientId, tenantId })

      expect(mockClientRepo.delete).toHaveBeenCalledWith(clientId)
    })

    it('should throw error if client not found', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(null)

      await expect(
        deleteOAuthClient.execute({ clientId })
      ).rejects.toThrow(`OAuth client '${clientId}' not found`)
    })

    it('should throw error if tenant mismatch', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)

      await expect(
        deleteOAuthClient.execute({ clientId, tenantId: 'different-tenant' })
      ).rejects.toThrow(`OAuth client '${clientId}' does not belong to tenant 'different-tenant'`)
    })
  })
})













