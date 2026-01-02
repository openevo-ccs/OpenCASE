import { type UserAccountId } from '../../../domain/user/entities/UserAccount'

export type CodeChallengeMethod = 'S256' | 'plain'

export interface AuthorizationCodeProps {
  code: string
  accountId: UserAccountId
  clientId: string
  redirectUri: string
  scopes: string[]
  codeChallenge: string
  codeChallengeMethod: CodeChallengeMethod
  expiresAt: Date
  createdAt: Date
}

export class AuthorizationCode {
  private constructor(private readonly props: AuthorizationCodeProps) {}

  static create(props: AuthorizationCodeProps): AuthorizationCode {
    if (!props.code) throw new Error('AuthorizationCode.code is required')
    if (!props.accountId) throw new Error('AuthorizationCode.accountId is required')
    if (!props.clientId) throw new Error('AuthorizationCode.clientId is required')
    if (!props.redirectUri) throw new Error('AuthorizationCode.redirectUri is required')
    if (!props.codeChallenge) throw new Error('AuthorizationCode.codeChallenge is required')
    if (!props.codeChallengeMethod) throw new Error('AuthorizationCode.codeChallengeMethod is required')
    if (!props.expiresAt) throw new Error('AuthorizationCode.expiresAt is required')
    if (!props.createdAt) throw new Error('AuthorizationCode.createdAt is required')

    const validMethods: CodeChallengeMethod[] = ['S256', 'plain']
    if (!validMethods.includes(props.codeChallengeMethod)) {
      throw new Error(`AuthorizationCode.codeChallengeMethod must be one of: ${validMethods.join(', ')}`)
    }

    return new AuthorizationCode(props)
  }

  get code(): string { return this.props.code }
  get accountId(): UserAccountId { return this.props.accountId }
  get clientId(): string { return this.props.clientId }
  get redirectUri(): string { return this.props.redirectUri }
  get scopes(): string[] { return [...this.props.scopes] }
  get codeChallenge(): string { return this.props.codeChallenge }
  get codeChallengeMethod(): CodeChallengeMethod { return this.props.codeChallengeMethod }
  get expiresAt(): Date { return this.props.expiresAt }
  get createdAt(): Date { return this.props.createdAt }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt
  }

  /**
   * Verify the code verifier against the stored code challenge
   */
  verifyCodeVerifier(codeVerifier: string): boolean {
    if (this.props.codeChallengeMethod === 'plain') {
      return this.props.codeChallenge === codeVerifier
    }

    // S256: codeChallenge = base64url(sha256(codeVerifier))
    const crypto = require('crypto')
    const hash = crypto.createHash('sha256').update(codeVerifier).digest()
    const base64Url = hash.toString('base64url')
    return this.props.codeChallenge === base64Url
  }
}

