import { AuthorizationCodeRepository } from '../../application/oauth/ports/AuthorizationCodeRepository'
import { AuthorizationCode } from '../../domain/oauth/entities/AuthorizationCode'
import { logger } from '../logging/Logger'

export class FileAuthorizationCodeRepository implements AuthorizationCodeRepository {
  private codes = new Map<string, AuthorizationCode>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired codes every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.deleteExpired().catch(err => {
        logger.error({ err }, 'Error cleaning up expired authorization codes')
      })
    }, 5 * 60 * 1000)
  }

  async findByCode(code: string): Promise<AuthorizationCode | null> {
    const authCode = this.codes.get(code)
    if (!authCode) {
      return null
    }

    // Check if expired
    if (authCode.isExpired()) {
      await this.delete(code)
      return null
    }

    return authCode
  }

  async save(code: AuthorizationCode): Promise<void> {
    this.codes.set(code.code, code)
  }

  async delete(code: string): Promise<void> {
    this.codes.delete(code)
  }

  async deleteExpired(): Promise<void> {
    const now = new Date()
    const expiredCodes: string[] = []

    for (const [code, authCode] of this.codes.entries()) {
      if (authCode.expiresAt < now) {
        expiredCodes.push(code)
      }
    }

    for (const code of expiredCodes) {
      this.codes.delete(code)
    }

    if (expiredCodes.length > 0) {
      logger.debug({ count: expiredCodes.length }, 'Cleaned up expired authorization codes')
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}













