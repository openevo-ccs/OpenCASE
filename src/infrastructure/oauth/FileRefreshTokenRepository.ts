import fs from 'node:fs/promises'
import path from 'node:path'
import { RefreshTokenRepository } from '../../application/oauth/ports/RefreshTokenRepository'
import { RefreshToken } from '../../domain/oauth/entities/RefreshToken'
import { logger } from '../logging/Logger'

export interface FileRefreshTokenRepositoryConfig {
  tokensFile: string
}

interface TokenData {
  token: string
  accountId: string
  clientId: string
  scopes: string[]
  expiresAt: string
  createdAt: string
  revoked: boolean
}

export class FileRefreshTokenRepository implements RefreshTokenRepository {
  private tokens = new Map<string, RefreshToken>()

  constructor(private readonly cfg: FileRefreshTokenRepositoryConfig) {}

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.cfg.tokensFile, 'utf8')
      const tokensData: TokenData[] = JSON.parse(data)

      for (const tokenData of tokensData) {
        const token = RefreshToken.create({
          token: tokenData.token,
          accountId: tokenData.accountId,
          clientId: tokenData.clientId,
          scopes: tokenData.scopes,
          expiresAt: new Date(tokenData.expiresAt),
          createdAt: new Date(tokenData.createdAt),
          revoked: tokenData.revoked
        })
        this.tokens.set(token.token, token)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create empty file
        await this.ensureFileExists()
      } else {
        throw error
      }
    }
  }

  private async ensureFileExists(): Promise<void> {
    const dir = path.dirname(this.cfg.tokensFile)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(this.cfg.tokensFile, JSON.stringify([], null, 2), 'utf8')
  }

  private async persist(): Promise<void> {
    const tokensData: TokenData[] = Array.from(this.tokens.values()).map(token => ({
      token: token.token,
      accountId: token.accountId,
      clientId: token.clientId,
      scopes: token.scopes,
      expiresAt: token.expiresAt.toISOString(),
      createdAt: token.createdAt.toISOString(),
      revoked: token.revoked
    }))

    await fs.writeFile(
      this.cfg.tokensFile,
      JSON.stringify(tokensData, null, 2),
      'utf8'
    )
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.tokens.get(token) ?? null
  }

  async save(token: RefreshToken): Promise<void> {
    this.tokens.set(token.token, token)
    await this.persist()
  }

  async delete(token: string): Promise<void> {
    this.tokens.delete(token)
    await this.persist()
  }

  async findByAccountId(accountId: string): Promise<RefreshToken[]> {
    return Array.from(this.tokens.values()).filter(
      t => t.accountId === accountId
    )
  }
}

