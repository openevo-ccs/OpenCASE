import type { Express } from 'express';
import type { CFPackagesControllerV1p1 } from './controllers/CFPackagesController';

export interface PublicV1p1Deps {
  cfPackagesController: CFPackagesControllerV1p1;
}

export function registerV1p1Routes(app: Express, deps: PublicV1p1Deps) {
  // Note: Discovery endpoint is registered in server.ts before auth middleware
  // to ensure it's accessible without authentication (as required by spec)

  // CFPackage endpoint
  app.get(
    '/ims/case/v1p1/CFPackages/:id',
    deps.cfPackagesController.getById
  );

  // TODO: add CFDocuments, CFItems, CFAssociations, CFRubrics, etc.
}
