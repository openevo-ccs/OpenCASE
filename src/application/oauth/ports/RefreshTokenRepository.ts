import { type RefreshToken } from '../../../domain/oauth/entities/RefreshToken'

export interface RefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>
  save(token: RefreshToken): Promise<void>
  delete(token: string): Promise<void>
  findByAccountId(accountId: string): Promise<RefreshToken[]>
}

