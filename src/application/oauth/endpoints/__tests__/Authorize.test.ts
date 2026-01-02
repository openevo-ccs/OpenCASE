import { Authorize } from '../Authorize'
import { UserAccountRepository } from '../../../user/ports/UserAccountRepository'
import { TenantMembershipRepository } from '../../../user/ports/TenantMembershipRepository'
import { PasswordHasher } from '../../../user/services/PasswordHasher'
import { AuthorizationCodeRepository } from '../../ports/AuthorizationCodeRepository'
import { OAuthClientRepository } from '../../ports/OAuthClientRepository'
import { UserAccount } from '../../../../domain/user/entities/UserAccount'
import { TenantMembership } from '../../../../domain/user/entities/TenantMembership'
import { OAuthClient } from '../../../../domain/oauth/entities/OAuthClient'

describe('Authorize', () => {
  let mockAccountRepo: jest.Mocked<UserAccountRepository>
  let mockMembershipRepo: jest.Mocked<TenantMembershipRepository>
  let mockPasswordHasher: jest.Mocked<PasswordHasher>
  let mockCodeRepo: jest.Mocked<AuthorizationCodeRepository>
  let mockClientRepo: jest.Mocked<OAuthClientRepository>
  let authorize: Authorize

  beforeEach(() => {
    mockAccountRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    } as any

    mockMembershipRepo = {
      findByAccountId: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      findByAccountAndTenant: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any

    mockPasswordHasher = {
      verify: jest.fn().mockResolvedValue(true),
      hash: jest.fn(),
      generateSecurePassword: jest.fn(),
      validatePasswordStrength: jest.fn()
    } as any

    mockCodeRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByCode: jest.fn(),
      delete: jest.fn(),
      deleteExpired: jest.fn()
    } as any

    mockClientRepo = {
      findByClientId: jest.fn()
    } as any

    authorize = new Authorize(
      mockAccountRepo,
      mockMembershipRepo,
      mockPasswordHasher,
      mockCodeRepo,
      mockClientRepo
    )
  })

  describe('execute', () => {
    const account = UserAccount.create({
      id: 'account-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const client = OAuthClient.create({
      clientId: 'react-client',
      clientSecret: 'secret',
      tenantId: 'tenant-1',
      grantTypes: ['authorization_code'],
      scopes: ['case.read', 'case.write'],
      active: true
    })

    const membership = TenantMembership.create({
      id: 'membership-1',
      accountId: 'account-1',
      tenantId: 'tenant-1',
      role: 'user',
      createdAt: new Date()
    })

    it('should generate authorization code successfully', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)
      mockAccountRepo.findByEmail.mockResolvedValue(account)
      mockPasswordHasher.verify.mockResolvedValue(true)
      mockMembershipRepo.findByAccountId.mockResolvedValue([membership])

      const result = await authorize.execute({
        email: 'user@example.com',
        password: 'password123',
        clientId: 'react-client',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'case.read case.write',
        codeChallenge: 'challenge-123',
        codeChallengeMethod: 'S256',
        state: 'state-123'
      })

      expect(mockClientRepo.findByClientId).toHaveBeenCalledWith('react-client')
      expect(mockAccountRepo.findByEmail).toHaveBeenCalledWith('user@example.com')
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith('password123', 'hash')
      expect(mockCodeRepo.save).toHaveBeenCalled()
      expect(result.code).toBeDefined()
      expect(result.state).toBe('state-123')
    })

    it('should throw error for invalid client', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(null)

      await expect(
        authorize.execute({
          email: 'user@example.com',
          password: 'password123',
          clientId: 'invalid-client',
          redirectUri: 'http://localhost:3000/callback',
          codeChallenge: 'challenge-123',
          codeChallengeMethod: 'S256'
        })
      ).rejects.toThrow('Invalid client_id')
    })

    it('should throw error if client does not support authorization_code', async () => {
      const clientCredentialsOnly = OAuthClient.create({
        clientId: 'service-client',
        clientSecret: 'secret',
        tenantId: 'tenant-1',
        grantTypes: ['client_credentials'],
        scopes: ['case.read'],
        active: true
      })

      mockClientRepo.findByClientId.mockResolvedValue(clientCredentialsOnly)

      await expect(
        authorize.execute({
          email: 'user@example.com',
          password: 'password123',
          clientId: 'service-client',
          redirectUri: 'http://localhost:3000/callback',
          codeChallenge: 'challenge-123',
          codeChallengeMethod: 'S256'
        })
      ).rejects.toThrow('Client does not support authorization_code grant type')
    })

    it('should throw error for invalid credentials', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)
      mockAccountRepo.findByEmail.mockResolvedValue(account)
      mockPasswordHasher.verify.mockResolvedValue(false)

      await expect(
        authorize.execute({
          email: 'user@example.com',
          password: 'wrong-password',
          clientId: 'react-client',
          redirectUri: 'http://localhost:3000/callback',
          codeChallenge: 'challenge-123',
          codeChallengeMethod: 'S256'
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for inactive account', async () => {
      const inactiveAccount = UserAccount.create({
        id: 'account-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      mockClientRepo.findByClientId.mockResolvedValue(client)
      mockAccountRepo.findByEmail.mockResolvedValue(inactiveAccount)

      await expect(
        authorize.execute({
          email: 'user@example.com',
          password: 'password123',
          clientId: 'react-client',
          redirectUri: 'http://localhost:3000/callback',
          codeChallenge: 'challenge-123',
          codeChallengeMethod: 'S256'
        })
      ).rejects.toThrow('Account is not active')
    })

    it('should grant default scope when none requested', async () => {
      mockClientRepo.findByClientId.mockResolvedValue(client)
      mockAccountRepo.findByEmail.mockResolvedValue(account)
      mockPasswordHasher.verify.mockResolvedValue(true)
      mockMembershipRepo.findByAccountId.mockResolvedValue([membership])

      const result = await authorize.execute({
        email: 'user@example.com',
        password: 'password123',
        clientId: 'react-client',
        redirectUri: 'http://localhost:3000/callback',
        codeChallenge: 'challenge-123',
        codeChallengeMethod: 'S256'
      })

      expect(mockCodeRepo.save).toHaveBeenCalled()
      const savedCode = (mockCodeRepo.save as jest.Mock).mock.calls[0][0]
      expect(savedCode.scopes).toContain('case.read')
    })
  })
})

