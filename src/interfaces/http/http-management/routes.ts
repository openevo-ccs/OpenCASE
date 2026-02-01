import type { Express, RequestHandler } from 'express'
import type { CFDocumentsManagementController } from './controllers/CFDocumentsManagementController'
import type { CFItemsManagementController } from './controllers/CFItemsManagementController'
import type { CFAssociationsManagementController } from './controllers/CFAssociationsManagementController'
import type { FrameworksManagementController } from './controllers/FrameworksManagementController'
import type { TenantsManagementController } from './controllers/TenantsManagementController'
import { requireScope } from '../middleware/scope'

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
}

/**
 * @openapi
 * /management/tenants:
 *   get:
 *     operationId: listTenants
 *     summary: List all tenants (non-CASE extension)
 *     tags: [DefinitionsManager]
 *     security:
 *       - BearerAuth: []
 *     x-required-scopes: [case.admin]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     operationId: createTenant
 *     summary: Create a tenant (non-CASE extension)
 *     tags: [DefinitionsManager]
 *     security:
 *       - BearerAuth: []
 *     x-required-scopes: [case.admin]
 *     responses:
 *       201: { description: Created }
 *
 * /management/tenants/{tenantId}/CFDocuments/{id}:
 *   put:
 *     operationId: updateCFDocument
 *     summary: Update a CFDocument (non-CASE extension)
 *     tags: [DocumentsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     operationId: deleteCFDocument
 *     summary: Delete a CFDocument (non-CASE extension)
 *     tags: [DocumentsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Deleted }
 *
 * /management/tenants/{tenantId}/CFItems/{id}:
 *   put:
 *     operationId: updateCFItem
 *     summary: Update a CFItem (non-CASE extension)
 *     tags: [ItemsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     operationId: deleteCFItem
 *     summary: Delete a CFItem (non-CASE extension)
 *     tags: [ItemsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Deleted }
 *
 * /management/tenants/{tenantId}/CFAssociations/{id}:
 *   put:
 *     operationId: updateCFAssociation
 *     summary: Update a CFAssociation (non-CASE extension)
 *     tags: [AssociationsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     operationId: deleteCFAssociation
 *     summary: Delete a CFAssociation (non-CASE extension)
 *     tags: [AssociationsManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Deleted }
 *
 * /management/tenants/{tenantId}/frameworks:
 *   get:
 *     operationId: listFrameworks
 *     summary: List frameworks for a tenant (non-CASE extension)
 *     tags: [PackagesManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1] } }
 *     responses:
 *       200: { description: OK }
 *
 * /management/tenants/{tenantId}/frameworks/{docId}:
 *   delete:
 *     operationId: deleteFramework
 *     summary: Delete a framework for a tenant (non-CASE extension)
 *     tags: [PackagesManager]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: docId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Deleted }
 */
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

  // Framework delete endpoint
  app.delete(
    '/management/tenants/:tenantId/frameworks/:docId',
    deps.frameworksController.delete as RequestHandler<{ tenantId: string, docId: string }>
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
}
