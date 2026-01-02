import { Express } from 'express'
import { CFDocumentsManagementController } from './controllers/CFDocumentsManagementController'
import { CFItemsManagementController } from './controllers/CFItemsManagementController'
import { CFAssociationsManagementController } from './controllers/CFAssociationsManagementController'
import { FrameworksManagementController } from './controllers/FrameworksManagementController'
import { TenantsManagementController } from './controllers/TenantsManagementController'
import { AccountsManagementController } from './controllers/AccountsManagementController'
import { OAuthClientsManagementController } from './controllers/OAuthClientsManagementController'
import { requireScope, requireAnyScope } from '../middleware/scope'

/**
 * Management API Routes
 * 
 * These endpoints provide UPDATE and DELETE operations for CASE entities.
 * These operations are NOT part of the CASE standard specification and are
 * provided as extended functionality for management purposes.
 * 
 * All endpoints require authentication and are scoped to the authenticated tenant.
 * Tenant management endpoints require the 'case.admin' scope.
 */
export interface ManagementDeps {
  cfDocumentsController: CFDocumentsManagementController
  cfItemsController: CFItemsManagementController
  cfAssociationsController: CFAssociationsManagementController
  frameworksController: FrameworksManagementController
  tenantsController: TenantsManagementController
  accountsController?: AccountsManagementController
  oauthClientsController?: OAuthClientsManagementController
}

export function registerManagementRoutes (app: Express, deps: ManagementDeps): void {
  // CFDocument management endpoints
  app.put(
    '/management/tenants/:tenantId/CFDocuments/:id',
    deps.cfDocumentsController.update
  )
  app.delete(
    '/management/tenants/:tenantId/CFDocuments/:id',
    deps.cfDocumentsController.delete
  )

  // CFItem management endpoints
  app.put(
    '/management/tenants/:tenantId/CFItems/:id',
    deps.cfItemsController.update
  )
  app.delete(
    '/management/tenants/:tenantId/CFItems/:id',
    deps.cfItemsController.delete
  )

  // CFAssociation management endpoints
  app.put(
    '/management/tenants/:tenantId/CFAssociations/:id',
    deps.cfAssociationsController.update
  )
  app.delete(
    '/management/tenants/:tenantId/CFAssociations/:id',
    deps.cfAssociationsController.delete
  )

  // Framework listing endpoint
  app.get(
    '/management/tenants/:tenantId/frameworks',
    deps.frameworksController.list
  )

  // Tenant management endpoints (require case.admin scope)
  app.get(
    '/management/tenants',
    requireScope('case.admin'),
    deps.tenantsController.list
  )
  app.post(
    '/management/tenants',
    requireScope('case.admin'),
    deps.tenantsController.create
  )

  // Account management endpoints (require case.owner scope)
  if (deps.accountsController) {
    app.post(
      '/management/tenants/:tenantId/accounts',
      requireScope('case.owner'),
      deps.accountsController.create
    )
    app.get(
      '/management/tenants/:tenantId/accounts',
      requireScope('case.owner'),
      deps.accountsController.list
    )
    app.put(
      '/management/tenants/:tenantId/accounts/:accountId',
      requireScope('case.owner'),
      deps.accountsController.update
    )
    app.delete(
      '/management/tenants/:tenantId/accounts/:accountId',
      requireScope('case.owner'),
      deps.accountsController.delete
    )
    app.post(
      '/management/tenants/:tenantId/accounts/:accountId/memberships',
      requireScope('case.owner'),
      deps.accountsController.addMembership
    )
    app.delete(
      '/management/tenants/:tenantId/accounts/:accountId/memberships/:targetTenantId',
      requireScope('case.owner'),
      deps.accountsController.removeMembership
    )
  }

  // OAuth client management endpoints (require case.owner or case.admin scope)
  if (deps.oauthClientsController) {
    app.post(
      '/management/tenants/:tenantId/clients',
      requireAnyScope('case.owner', 'case.admin'),
      deps.oauthClientsController.create
    )
    app.get(
      '/management/tenants/:tenantId/clients',
      requireAnyScope('case.owner', 'case.admin'),
      deps.oauthClientsController.list
    )
    app.delete(
      '/management/tenants/:tenantId/clients/:clientId',
      requireAnyScope('case.owner', 'case.admin'),
      deps.oauthClientsController.delete
    )
  }
}

