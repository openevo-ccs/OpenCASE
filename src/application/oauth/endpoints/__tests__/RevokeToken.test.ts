import { RevokeToken } from '../RevokeToken'
import { RefreshTokenRepository } from '../../ports/RefreshTokenRepository'
import { RefreshToken } from '../../../../domain/oauth/entities/RefreshToken'

describe('RevokeToken', () => {
  let mockRefreshTokenRepo: jest.Mocked<RefreshTokenRepository>
  let revokeToken: RevokeToken

  beforeEach(() => {
    mockRefreshTokenRepo = {
      findByToken: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
      findByAccountId: jest.fn()
    } as any

    revokeToken = new RevokeToken(mockRefreshTokenRepo)
  })

  describe('execute', () => {
    const refreshToken = RefreshToken.create({
      token: 'refresh-token-123',
      accountId: 'account-1',
      clientId: 'react-client',
      scopes: ['case.read'],
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      createdAt: new Date(),
      revoked: false
    })

    it('should revoke token successfully', async () => {
      mockRefreshTokenRepo.findByToken.mockResolvedValue(refreshToken)

      await revokeToken.execute({
        token: 'refresh-token-123',
        clientId: 'react-client'
      })

      expect(mockRefreshTokenRepo.findByToken).toHaveBeenCalledWith('refresh-token-123')
      expect(mockRefreshTokenRepo.save).toHaveBeenCalled()
      const savedToken = (mockRefreshTokenRepo.save as jest.Mock).mock.calls[0][0]
      expect(savedToken.revoked).toBe(true)
    })

    it('should succeed even if token not found (RFC 7009)', async () => {
      mockRefreshTokenRepo.findByToken.mockResolvedValue(null)

      await revokeToken.execute({
        token: 'non-existent-token',
        clientId: 'react-client'
      })

      // Should not throw, per RFC 7009
      expect(mockRefreshTokenRepo.findByToken).toHaveBeenCalled()
      expect(mockRefreshTokenRepo.save).not.toHaveBeenCalled()
    })

    it('should throw error for client ID mismatch', async () => {
      mockRefreshTokenRepo.findByToken.mockResolvedValue(refreshToken)

      await expect(
        revokeToken.execute({
          token: 'refresh-token-123',
          clientId: 'wrong-client'
        })
      ).rejects.toThrow('Client ID mismatch')
    })
  })
})













