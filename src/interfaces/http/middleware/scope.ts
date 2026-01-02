import { Request, Response, NextFunction } from 'express'

/**
 * Creates middleware that requires a specific scope in the JWT token
 */
export function requireScope(requiredScope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - no user information' })
    }

    const scopes = (user.scope as string | undefined)?.split(' ') ?? []
    
    if (!scopes.includes(requiredScope)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Required scope '${requiredScope}' not found in token` 
      })
    }

    return next()
  }
}

/**
 * Creates middleware that requires any of the specified scopes in the JWT token
 */
export function requireAnyScope(...requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - no user information' })
    }

    const scopes = (user.scope as string | undefined)?.split(' ') ?? []
    
    const hasRequiredScope = requiredScopes.some(scope => scopes.includes(scope))
    
    if (!hasRequiredScope) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Required scope(s) '${requiredScopes.join(' or ')}' not found in token` 
      })
    }

    return next()
  }
}

