import { Express } from 'express';
import { FrameworksController } from './controllers/FrameworksController';

export interface AdminDeps {
  frameworksController: FrameworksController;
}

/**
 * @openapi
 * /admin/tenants/{tenantId}/frameworks:
 *   post:
 *     operationId: adminCreateFramework
 *     summary: Create/publish a framework (non-CASE extension)
 *     tags: [Admin]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Unchanged }
 *       201: { description: Created/Published }
 *
 * /admin/tenants/{tenantId}/frameworks/import:
 *   post:
 *     operationId: adminImportFramework
 *     summary: Import a framework from endpoint (non-CASE extension)
 *     tags: [Admin]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       201: { description: Imported }
 *
 * /admin/tenants/{tenantId}/frameworks/{docId}:
 *   delete:
 *     operationId: adminDeleteFramework
 *     summary: Delete a framework (non-CASE extension)
 *     tags: [Admin]
 *     parameters:
 *       - { name: tenantId, in: path, required: true, schema: { type: string } }
 *       - { name: docId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: caseVersion, in: query, required: false, schema: { type: string, enum: [1.0, 1.1], default: 1.1 } }
 *     responses:
 *       200: { description: Deleted }
 */
export function registerAdminRoutes(app: Express, deps: AdminDeps) {
  app.post(
    '/admin/tenants/:tenantId/frameworks',
    deps.frameworksController.create
  );

  app.post(
    '/admin/tenants/:tenantId/frameworks/import',
    deps.frameworksController.importFromEndpoint
  );

  app.delete(
    '/admin/tenants/:tenantId/frameworks/:docId',
    deps.frameworksController.delete
  );
}

