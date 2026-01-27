import { RefreshTokenRepository } from '../ports/RefreshTokenRepository'
import { TenantMembershipRepository } from '../../user/ports/TenantMembershipRepository'
import { JwtSigner } from '../ports/JwtSigner'
import { RefreshToken } from '../../../domain/oauth/entities/RefreshToken'
import { AccessToken } from '../../../domain/oauth/entities/AccessToken'
import { logger } from '../../../infrastructure/logging/Logger'

export interface IssueTokenFromRefreshCommand {
  refreshToken: string
  clientId: string
}

export interface IssueTokenFromRefreshResult {
  accessToken: AccessToken
}

export class IssueTokenFromRefresh {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly jwtSigner: JwtSigner,
    private readonly audience: string,
    private readonly accessTokenExpiresIn: number = 3600 // 1 hour
  ) {}

  async execute(cmd: IssueTokenFromRefreshCommand): Promise<IssueTokenFromRefreshResult> {
    logger.info({ clientId: cmd.clientId }, 'Executing IssueTokenFromRefresh')

    // Find refresh token
    const refreshToken = await this.refreshTokenRepo.findByToken(cmd.refreshToken)
    if (!refreshToken) {
      throw new Error('Invalid refresh token')
    }

    // Verify token is valid
    if (!refreshToken.isValid()) {
      throw new Error('Refresh token is expired or revoked')
    }

    // Verify client ID matches
    if (refreshToken.clientId !== cmd.clientId) {
      throw new Error('Client ID mismatch')
    }

    // Get user's tenant memberships
    const memberships = await this.membershipRepo.findByAccountId(refreshToken.accountId)
    if (memberships.length === 0) {
      throw new Error('User has no tenant memberships')
    }

    // Use first tenant (in production, might need to handle multi-tenant scenarios)
    const primaryMembership = memberships[0]
    const tenantId = primaryMembership.tenantId

    // Use scopes from refresh token
    const scopes = refreshToken.scopes.join(' ')

    // Create JWT payload
    const payload: Record<string, unknown> = {
      sub: refreshToken.accountId,
      tenantId,
      account_id: refreshToken.accountId,
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

    logger.info({ accountId: refreshToken.accountId, clientId: cmd.clientId }, 'Access token issued from refresh token')

    return {
      accessToken
    }
  }
}













