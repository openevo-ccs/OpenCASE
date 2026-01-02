import { AuthorizationCodeRepository } from '../ports/AuthorizationCodeRepository'
import { TenantMembershipRepository } from '../../user/ports/TenantMembershipRepository'
import { RefreshTokenRepository } from '../ports/RefreshTokenRepository'
import { JwtSigner } from '../ports/JwtSigner'
import { AuthorizationCode } from '../../../domain/oauth/entities/AuthorizationCode'
import { RefreshToken } from '../../../domain/oauth/entities/RefreshToken'
import { AccessToken } from '../../../domain/oauth/entities/AccessToken'
import { logger } from '../../../infrastructure/logging/Logger'
import { randomBytes } from 'crypto'

export interface IssueTokenFromCodeCommand {
  code: string
  clientId: string
  redirectUri: string
  codeVerifier: string
}

export interface IssueTokenFromCodeResult {
  accessToken: AccessToken
  refreshToken?: RefreshToken
}

export class IssueTokenFromCode {
  constructor(
    private readonly codeRepo: AuthorizationCodeRepository,
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwtSigner: JwtSigner,
    private readonly audience: string,
    private readonly accessTokenExpiresIn: number = 3600, // 1 hour
    private readonly refreshTokenExpiresIn: number = 30 * 24 * 3600 // 30 days
  ) {}

  async execute(cmd: IssueTokenFromCodeCommand): Promise<IssueTokenFromCodeResult> {
    logger.info({ clientId: cmd.clientId }, 'Executing IssueTokenFromCode')

    // Find and validate authorization code
    const authCode = await this.codeRepo.findByCode(cmd.code)
    if (!authCode) {
      throw new Error('Invalid authorization code')
    }

    if (authCode.isExpired()) {
      await this.codeRepo.delete(cmd.code)
      throw new Error('Authorization code has expired')
    }

    // Verify client ID matches
    if (authCode.clientId !== cmd.clientId) {
      throw new Error('Client ID mismatch')
    }

    // Verify redirect URI matches
    if (authCode.redirectUri !== cmd.redirectUri) {
      throw new Error('Redirect URI mismatch')
    }

    // Verify code verifier
    if (!authCode.verifyCodeVerifier(cmd.codeVerifier)) {
      throw new Error('Invalid code verifier')
    }

    // Get user's tenant memberships to determine tenantId and scopes
    const memberships = await this.membershipRepo.findByAccountId(authCode.accountId)
    if (memberships.length === 0) {
      throw new Error('User has no tenant memberships')
    }

    // For now, use the first tenant (in production, might need to handle multi-tenant scenarios)
    const primaryMembership = memberships[0]
    const tenantId = primaryMembership.tenantId

    // Use scopes from authorization code (already validated during authorization)
    const scopes = authCode.scopes.join(' ')

    // Create JWT payload
    const payload: Record<string, unknown> = {
      sub: authCode.accountId,
      tenantId,
      account_id: authCode.accountId,
      aud: this.audience,
      scope: scopes
    }

    // Sign access token
    const accessTokenString = this.jwtSigner.sign(payload, this.accessTokenExpiresIn)
    const accessToken = AccessToken.create({
      accessToken: accessTokenString,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenExpiresIn,
      scope: scopes
    })

    // Generate refresh token
    const refreshTokenString = randomBytes(32).toString('base64url')
    const refreshTokenExpiresAt = new Date(Date.now() + this.refreshTokenExpiresIn * 1000)

    const refreshToken = RefreshToken.create({
      token: refreshTokenString,
      accountId: authCode.accountId,
      clientId: cmd.clientId,
      scopes: authCode.scopes,
      expiresAt: refreshTokenExpiresAt,
      createdAt: new Date(),
      revoked: false
    })

    await this.refreshTokenRepo.save(refreshToken)

    // Delete authorization code (single use)
    await this.codeRepo.delete(cmd.code)

    logger.info({ accountId: authCode.accountId, clientId: cmd.clientId }, 'Tokens issued from authorization code')

    return {
      accessToken,
      refreshToken
    }
  }
}

