import { ListTenantClients } from '../ListTenantClients'
import { OAuthClientRepository } from '../../ports/OAuthClientRepository'
import { OAuthClient } from '../../../../domain/oauth/entities/OAuthClient'

describe('ListTenantClients', () => {
  let mockClientRepo: jest.Mocked<OAuthClientRepository>
  let listTenantClients: ListTenantClients

  beforeEach(() => {
    mockClientRepo = {
      findByClientId: jest.fn(),
      findByTenantId: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
      delete: jest.fn()
    } as any

    listTenantClients = new ListTenantClients(mockClientRepo)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'

    it('should list all clients for a tenant', async () => {
      const client1 = OAuthClient.create({
        clientId: 'client-1',
        clientSecret: 'secret-1',
        tenantId,
        grantTypes: ['client_credentials'],
        scopes: ['case.read'],
        active: true
      })

      const client2 = OAuthClient.create({
        clientId: 'client-2',
        clientSecret: 'secret-2',
        tenantId,
        grantTypes: ['authorization_code'],
        scopes: ['case.read', 'case.write'],
        active: true
      })

      mockClientRepo.findByTenantId.mockResolvedValue([client1, client2])

      const result = await listTenantClients.execute({ tenantId })

      expect(mockClientRepo.findByTenantId).toHaveBeenCalledWith(tenantId)
      expect(result.clients).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.clients[0].clientId).toBe('client-1')
      expect(result.clients[0].grantTypes).toEqual(['client_credentials'])
      expect(result.clients[1].clientId).toBe('client-2')
      expect(result.clients[1].grantTypes).toEqual(['authorization_code'])
    })

    it('should return empty array when no clients exist', async () => {
      const result = await listTenantClients.execute({ tenantId })

      expect(result.clients).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should not include client secrets in response', async () => {
      const client = OAuthClient.create({
        clientId: 'client-1',
        clientSecret: 'secret-1',
        tenantId,
        grantTypes: ['client_credentials'],
        active: true
      })

      mockClientRepo.findByTenantId.mockResolvedValue([client])

      const result = await listTenantClients.execute({ tenantId })

      expect(result.clients[0]).not.toHaveProperty('clientSecret')
      expect(result.clients[0]).toHaveProperty('clientId')
      expect(result.clients[0]).toHaveProperty('grantTypes')
      expect(result.clients[0]).toHaveProperty('active')
    })
  })
})













