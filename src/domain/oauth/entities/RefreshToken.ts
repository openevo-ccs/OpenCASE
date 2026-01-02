import { type UserAccountId } from '../../../domain/user/entities/UserAccount'

export interface RefreshTokenProps {
  token: string
  accountId: UserAccountId
  clientId: string
  scopes: string[]
  expiresAt: Date
  createdAt: Date
  revoked: boolean
}

export class RefreshToken {
  private constructor(private readonly props: RefreshTokenProps) {}

  static create(props: RefreshTokenProps): RefreshToken {
    if (!props.token) throw new Error('RefreshToken.token is required')
    if (!props.accountId) throw new Error('RefreshToken.accountId is required')
    if (!props.clientId) throw new Error('RefreshToken.clientId is required')
    if (!props.expiresAt) throw new Error('RefreshToken.expiresAt is required')
    if (!props.createdAt) throw new Error('RefreshToken.createdAt is required')

    return new RefreshToken({
      ...props,
      revoked: props.revoked ?? false
    })
  }

  get token(): string { return this.props.token }
  get accountId(): UserAccountId { return this.props.accountId }
  get clientId(): string { return this.props.clientId }
  get scopes(): string[] { return [...this.props.scopes] }
  get expiresAt(): Date { return this.props.expiresAt }
  get createdAt(): Date { return this.props.createdAt }
  get revoked(): boolean { return this.props.revoked }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt
  }

  isValid(): boolean {
    return !this.props.revoked && !this.isExpired()
  }

  revoke(): RefreshToken {
    return new RefreshToken({
      ...this.props,
      revoked: true
    })
  }
}

