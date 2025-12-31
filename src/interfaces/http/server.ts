import express, { type RequestHandler } from 'express'
import { makeAuthMiddleware } from './middleware/auth'
import { registerV1p1Routes } from './http-public/v1p1/routes'
import { registerAdminRoutes } from './http-admin/routes'
import { registerOAuthRoutes } from './http-oauth/routes'
import { type Container } from '../../wiring/container'

export function createServer (container: Container): express.Express {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true })) // For OAuth form-encoded requests

  // OAuth routes (no auth required - used to get tokens)
  registerOAuthRoutes(app, {
    tokenController: container.controllers.oauth.token
  })

  // Service Discovery endpoint (no auth required - used for service discovery)
  app.get(
    '/ims/case/v1p1/discovery/imscasev1p1_openapi3_v1p0.json',
    container.controllers.v1p1.discovery.getOpenAPISpec as RequestHandler
  )

  // Protected routes
  const authMiddleware = makeAuthMiddleware(container.jwtVerifier)
  app.use('/ims/case', authMiddleware)
  app.use('/admin', authMiddleware)

  registerV1p1Routes(app, {
    cfPackagesController: container.controllers.v1p1.cfPackages
  })

  registerAdminRoutes(app, {
    frameworksController: container.controllers.admin.frameworks
  })

  // simple health endpoint
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  return app
}
