import { IssueTokenFromCode } from '../IssueTokenFromCode'
import { AuthorizationCodeRepository } from '../../ports/AuthorizationCodeRepository'
import { TenantMembershipRepository } from '../../../user/ports/TenantMembershipRepository'
import { RefreshTokenRepository } from '../../ports/RefreshTokenRepository'
import { JwtSigner } from '../../ports/JwtSigner'
import { AuthorizationCode } from '../../../../domain/oauth/entities/AuthorizationCode'
import { TenantMembership } from '../../../../domain/user/entities/TenantMembership'

describe('IssueTokenFromCode', () => {
  let mockCodeRepo: jest.Mocked<AuthorizationCodeRepository>
  let mockMembershipRepo: jest.Mocked<TenantMembershipRepository>
  let mockRefreshTokenRepo: jest.Mocked<RefreshTokenRepository>
  let mockJwtSigner: jest.Mocked<JwtSigner>
  let issueTokenFromCode: IssueTokenFromCode

  beforeEach(() => {
    mockCodeRepo = {
      findByCode: jest.fn(),
      save: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      deleteExpired: jest.fn()
    } as any

    mockMembershipRepo = {
      findByAccountId: jest.fn(),
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      findByAccountAndTenant: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any

    mockRefreshTokenRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByToken: jest.fn(),
      delete: jest.fn(),
      findByAccountId: jest.fn()
    } as any

    mockJwtSigner = {
      sign: jest.fn().mockReturnValue('jwt-token-123')
    } as any

    issueTokenFromCode = new IssueTokenFromCode(
      mockCodeRepo,
      mockMembershipRepo,
      mockRefreshTokenRepo,
      mockJwtSigner,
      'test-audience'
    )
  })

  describe('execute', () => {
    const authCode = AuthorizationCode.create({
      code: 'auth-code-123',
      accountId: 'account-1',
      clientId: 'react-client',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['case.read', 'case.write'],
      codeChallenge: 'challenge-123',
      codeChallengeMethod: 'S256',
      expiresAt: new Date(Date.now() + 600000), // 10 minutes from now
      createdAt: new Date()
    })

    const membership = TenantMembership.create({
      id: 'membership-1',
      accountId: 'account-1',
      tenantId: 'tenant-1',
      role: 'user',
      createdAt: new Date()
    })

    it('should issue tokens from authorization code', async () => {
      // Mock code verifier verification
      jest.spyOn(authCode, 'verifyCodeVerifier').mockReturnValue(true)
      jest.spyOn(authCode, 'isExpired').mockReturnValue(false)

      mockCodeRepo.findByCode.mockResolvedValue(authCode)
      mockMembershipRepo.findByAccountId.mockResolvedValue([membership])

      const result = await issueTokenFromCode.execute({
        code: 'auth-code-123',
        clientId: 'react-client',
        redirectUri: 'http://localhost:3000/callback',
        codeVerifier: 'verifier-123'
      })

      expect(mockCodeRepo.findByCode).toHaveBeenCalledWith('auth-code-123')
      expect(mockJwtSigner.sign).toHaveBeenCalled()
      expect(mockRefreshTokenRepo.save).toHaveBeenCalled()
      expect(mockCodeRepo.delete).toHaveBeenCalledWith('auth-code-123')
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
    })

    it('should throw error for invalid authorization code', async () => {
      mockCodeRepo.findByCode.mockResolvedValue(null)

      await expect(
        issueTokenFromCode.execute({
          code: 'invalid-code',
          clientId: 'react-client',
          redirectUri: 'http://localhost:3000/callback',
          codeVerifier: 'verifier-123'
        })
      ).rejects.toThrow('Invalid authorization code')
    })

    it('should throw error for expired code', async () => {
      jest.spyOn(authCode, 'isExpired').mockReturnValue(true)
      mockCodeRepo.findByCode.mockResolvedValue(authCode)

      await expect(
        issueTokenFromCode.execute({
          code: 'auth-code-123',
          clientId: 'react-client',
          redirectUri: 'http://localhost:3000/callback',
          codeVerifier: 'verifier-123'
        })
      ).rejects.toThrow('Authorization code has expired')
    })

    it('should throw error for client ID mismatch', async () => {
      jest.spyOn(authCode, 'isExpired').mockReturnValue(false)
      mockCodeRepo.findByCode.mockResolvedValue(authCode)

      await expect(
        issueTokenFromCode.execute({
          code: 'auth-code-123',
          clientId: 'wrong-client',
          redirectUri: 'http://localhost:3000/callback',
          codeVerifier: 'verifier-123'
        })
      ).rejects.toThrow('Client ID mismatch')
    })

    it('should throw error for redirect URI mismatch', async () => {
      jest.spyOn(authCode, 'isExpired').mockReturnValue(false)
      mockCodeRepo.findByCode.mockResolvedValue(authCode)

      await expect(
        issueTokenFromCode.execute({
          code: 'auth-code-123',
          clientId: 'react-client',
          redirectUri: 'http://wrong-uri.com/callback',
          codeVerifier: 'verifier-123'
        })
      ).rejects.toThrow('Redirect URI mismatch')
    })

    it('should throw error for invalid code verifier', async () => {
      jest.spyOn(authCode, 'isExpired').mockReturnValue(false)
      jest.spyOn(authCode, 'verifyCodeVerifier').mockReturnValue(false)
      mockCodeRepo.findByCode.mockResolvedValue(authCode)

      await expect(
        issueTokenFromCode.execute({
          code: 'auth-code-123',
          clientId: 'react-client',
          redirectUri: 'http://localhost:3000/callback',
          codeVerifier: 'wrong-verifier'
        })
      ).rejects.toThrow('Invalid code verifier')
    })
  })
})













