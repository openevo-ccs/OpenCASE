import { UserAccountRepository } from '../../user/ports/UserAccountRepository'
import { TenantMembershipRepository } from '../../user/ports/TenantMembershipRepository'
import { PasswordHasher } from '../../user/services/PasswordHasher'
import { AuthorizationCodeRepository } from '../ports/AuthorizationCodeRepository'
import { OAuthClientRepository } from '../ports/OAuthClientRepository'
import { AuthorizationCode, type CodeChallengeMethod } from '../../../domain/oauth/entities/AuthorizationCode'
import { logger } from '../../../infrastructure/logging/Logger'
import { randomBytes } from 'crypto'

export interface AuthorizeCommand {
  email: string
  password: string
  clientId: string
  redirectUri: string
  scope?: string
  codeChallenge: string
  codeChallengeMethod: CodeChallengeMethod
  state?: string
}

export interface AuthorizeResult {
  code: string
  state?: string
}

export class Authorize {
  constructor(
    private readonly accountRepo: UserAccountRepository,
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly codeRepo: AuthorizationCodeRepository,
    private readonly clientRepo: OAuthClientRepository,
    private readonly codeExpiresInSeconds: number = 600 // 10 minutes
  ) {}

  async execute(cmd: AuthorizeCommand): Promise<AuthorizeResult> {
    logger.info({ email: cmd.email, clientId: cmd.clientId }, 'Executing Authorize')

    // Verify client exists and supports authorization_code grant
    const client = await this.clientRepo.findByClientId(cmd.clientId)
    if (!client) {
      throw new Error('Invalid client_id')
    }

    if (!client.supportsGrantType('authorization_code')) {
      throw new Error('Client does not support authorization_code grant type')
    }

    // Verify redirect URI matches client configuration (simplified - in production, validate against registered redirect URIs)
    // For now, we'll accept any redirect URI

    // Authenticate user
    const account = await this.accountRepo.findByEmail(cmd.email)
    if (!account) {
      throw new Error('Invalid credentials')
    }

    if (!account.isActive()) {
      throw new Error('Account is not active')
    }

    const isValidPassword = await this.passwordHasher.verify(cmd.password, account.passwordHash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Get user's scopes from tenant memberships
    const memberships = await this.membershipRepo.findByAccountId(account.id)
    const availableScopes = new Set<string>()
    for (const membership of memberships) {
      const scopes = membership.getScopes()
      scopes.forEach(scope => availableScopes.add(scope))
    }

    // Validate requested scopes
    const requestedScopes = cmd.scope ? cmd.scope.split(' ') : []
    const grantedScopes: string[] = []
    
    for (const scope of requestedScopes) {
      if (availableScopes.has(scope)) {
        grantedScopes.push(scope)
      }
    }

    // If no scopes requested, grant default scopes (case.read)
    if (grantedScopes.length === 0) {
      grantedScopes.push('case.read')
    }

    // Generate authorization code
    const code = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + this.codeExpiresInSeconds * 1000)

    const authCode = AuthorizationCode.create({
      code,
      accountId: account.id,
      clientId: cmd.clientId,
      redirectUri: cmd.redirectUri,
      scopes: grantedScopes,
      codeChallenge: cmd.codeChallenge,
      codeChallengeMethod: cmd.codeChallengeMethod,
      expiresAt,
      createdAt: new Date()
    })

    await this.codeRepo.save(authCode)

    logger.info({ accountId: account.id, clientId: cmd.clientId }, 'Authorization code generated')

    return {
      code,
      state: cmd.state
    }
  }
}

