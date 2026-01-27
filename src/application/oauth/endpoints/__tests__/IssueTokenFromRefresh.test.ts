import { IssueTokenFromRefresh } from '../IssueTokenFromRefresh'
import { RefreshTokenRepository } from '../../ports/RefreshTokenRepository'
import { TenantMembershipRepository } from '../../../user/ports/TenantMembershipRepository'
import { JwtSigner } from '../../ports/JwtSigner'
import { RefreshToken } from '../../../../domain/oauth/entities/RefreshToken'
import { TenantMembership } from '../../../../domain/user/entities/TenantMembership'

describe('IssueTokenFromRefresh', () => {
  let mockRefreshTokenRepo: jest.Mocked<RefreshTokenRepository>
  let mockMembershipRepo: jest.Mocked<TenantMembershipRepository>
  let mockJwtSigner: jest.Mocked<JwtSigner>
  let issueTokenFromRefresh: IssueTokenFromRefresh

  beforeEach(() => {
    mockRefreshTokenRepo = {
      findByToken: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByAccountId: jest.fn()
    } as any

    mockMembershipRepo = {
      findByAccountId: jest.fn(),
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      findByAccountAndTenant: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any

    mockJwtSigner = {
      sign: jest.fn().mockReturnValue('new-access-token')
    } as any

    issueTokenFromRefresh = new IssueTokenFromRefresh(
      mockRefreshTokenRepo,
      mockMembershipRepo,
      mockJwtSigner,
      'test-audience'
    )
  })

  describe('execute', () => {
    const refreshToken = RefreshToken.create({
      token: 'refresh-token-123',
      accountId: 'account-1',
      clientId: 'react-client',
      scopes: ['case.read', 'case.write'],
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000), // 30 days from now
      createdAt: new Date(),
      revoked: false
    })

    const membership = TenantMembership.create({
      id: 'membership-1',
      accountId: 'account-1',
      tenantId: 'tenant-1',
      role: 'user',
      createdAt: new Date()
    })

    it('should issue new access token from refresh token', async () => {
      jest.spyOn(refreshToken, 'isValid').mockReturnValue(true)
      mockRefreshTokenRepo.findByToken.mockResolvedValue(refreshToken)
      mockMembershipRepo.findByAccountId.mockResolvedValue([membership])

      const result = await issueTokenFromRefresh.execute({
        refreshToken: 'refresh-token-123',
        clientId: 'react-client'
      })

      expect(mockRefreshTokenRepo.findByToken).toHaveBeenCalledWith('refresh-token-123')
      expect(mockJwtSigner.sign).toHaveBeenCalled()
      expect(result.accessToken).toBeDefined()
    })

    it('should throw error for invalid refresh token', async () => {
      mockRefreshTokenRepo.findByToken.mockResolvedValue(null)

      await expect(
        issueTokenFromRefresh.execute({
          refreshToken: 'invalid-token',
          clientId: 'react-client'
        })
      ).rejects.toThrow('Invalid refresh token')
    })

    it('should throw error for expired refresh token', async () => {
      jest.spyOn(refreshToken, 'isValid').mockReturnValue(false)
      mockRefreshTokenRepo.findByToken.mockResolvedValue(refreshToken)

      await expect(
        issueTokenFromRefresh.execute({
          refreshToken: 'refresh-token-123',
          clientId: 'react-client'
        })
      ).rejects.toThrow('Refresh token is expired or revoked')
    })

    it('should throw error for client ID mismatch', async () => {
      jest.spyOn(refreshToken, 'isValid').mockReturnValue(true)
      mockRefreshTokenRepo.findByToken.mockResolvedValue(refreshToken)

      await expect(
        issueTokenFromRefresh.execute({
          refreshToken: 'refresh-token-123',
          clientId: 'wrong-client'
        })
      ).rejects.toThrow('Client ID mismatch')
    })
  })
})













