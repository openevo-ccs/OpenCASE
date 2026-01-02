import { RefreshTokenRepository } from '../ports/RefreshTokenRepository'
import { RefreshToken } from '../../../domain/oauth/entities/RefreshToken'
import { logger } from '../../../infrastructure/logging/Logger'

export interface RevokeTokenCommand {
  token: string
  clientId: string
}

export class RevokeToken {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository
  ) {}

  async execute(cmd: RevokeTokenCommand): Promise<void> {
    logger.info({ clientId: cmd.clientId }, 'Executing RevokeToken')

    const refreshToken = await this.refreshTokenRepo.findByToken(cmd.token)
    if (!refreshToken) {
      // According to RFC 7009, revocation should succeed even if token doesn't exist
      // to prevent token scanning attacks
      logger.debug({ token: cmd.token }, 'Token not found for revocation (ignoring)')
      return
    }

    // Verify client ID matches
    if (refreshToken.clientId !== cmd.clientId) {
      throw new Error('Client ID mismatch')
    }

    // Revoke token
    const revokedToken = refreshToken.revoke()
    await this.refreshTokenRepo.save(revokedToken)

    logger.info({ accountId: refreshToken.accountId, clientId: cmd.clientId }, 'Refresh token revoked')
  }
}

