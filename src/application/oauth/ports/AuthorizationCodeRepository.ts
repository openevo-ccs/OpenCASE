import { type AuthorizationCode } from '../../../domain/oauth/entities/AuthorizationCode'

export interface AuthorizationCodeRepository {
  findByCode(code: string): Promise<AuthorizationCode | null>
  save(code: AuthorizationCode): Promise<void>
  delete(code: string): Promise<void>
  deleteExpired(): Promise<void>
}

