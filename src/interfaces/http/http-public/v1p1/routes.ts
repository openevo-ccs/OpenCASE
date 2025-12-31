import type { Express } from 'express'
import type { CFPackagesControllerV1p1 } from './controllers/CFPackagesController'
import type { CFDocumentsControllerV1p1 } from './controllers/CFDocumentsController'
import type { GetAllCFDocumentsControllerV1p1 } from './controllers/GetAllCFDocumentsController'
import type { CFItemsControllerV1p1 } from './controllers/CFItemsController'
import type { CFAssociationsControllerV1p1 } from './controllers/CFAssociationsController'
import type { CFItemAssociationsControllerV1p1 } from './controllers/CFItemAssociationsController'
import type { CFRubricsControllerV1p1 } from './controllers/CFRubricsController'
import type { CFSubjectsControllerV1p1 } from './controllers/CFSubjectsController'
import type { CFConceptsControllerV1p1 } from './controllers/CFConceptsController'
import type { CFAssociationGroupingsControllerV1p1 } from './controllers/CFAssociationGroupingsController'
import type { CFItemTypesControllerV1p1 } from './controllers/CFItemTypesController'
import type { CFLicensesControllerV1p1 } from './controllers/CFLicensesController'

export interface PublicV1p1Deps {
  cfPackagesController: CFPackagesControllerV1p1
  cfDocumentsController: CFDocumentsControllerV1p1
  getAllCFDocumentsController: GetAllCFDocumentsControllerV1p1
  cfItemsController: CFItemsControllerV1p1
  cfAssociationsController: CFAssociationsControllerV1p1
  cfItemAssociationsController: CFItemAssociationsControllerV1p1
  cfRubricsController: CFRubricsControllerV1p1
  cfSubjectsController: CFSubjectsControllerV1p1
  cfConceptsController: CFConceptsControllerV1p1
  cfAssociationGroupingsController: CFAssociationGroupingsControllerV1p1
  cfItemTypesController: CFItemTypesControllerV1p1
  cfLicensesController: CFLicensesControllerV1p1
}

export function registerV1p1Routes (app: Express, deps: PublicV1p1Deps) {
  // Note: Discovery endpoint is registered in server.ts before auth middleware
  // to ensure it's accessible without authentication (as required by spec)

  // CFPackage endpoint
  app.get('/ims/case/v1p1/CFPackages/:id', deps.cfPackagesController.getById)

  // CFDocument endpoints
  app.get('/ims/case/v1p1/CFDocuments', deps.getAllCFDocumentsController.getAll)
  app.get('/ims/case/v1p1/CFDocuments/:id', deps.cfDocumentsController.getById)

  // CFItem endpoints
  app.get('/ims/case/v1p1/CFItems/:id', deps.cfItemsController.getById)
  app.get('/ims/case/v1p1/CFItemAssociations/:id', deps.cfItemAssociationsController.getById)

  // CFAssociation endpoint
  app.get('/ims/case/v1p1/CFAssociations/:id', deps.cfAssociationsController.getById)

  // CFRubric endpoint
  app.get('/ims/case/v1p1/CFRubrics/:id', deps.cfRubricsController.getById)

  // CFSubject endpoint
  app.get('/ims/case/v1p1/CFSubjects/:id', deps.cfSubjectsController.getById)

  // CFConcept endpoint
  app.get('/ims/case/v1p1/CFConcepts/:id', deps.cfConceptsController.getById)

  // CFAssociationGrouping endpoint
  app.get('/ims/case/v1p1/CFAssociationGroupings/:id', deps.cfAssociationGroupingsController.getById)

  // CFItemType endpoint
  app.get('/ims/case/v1p1/CFItemTypes/:id', deps.cfItemTypesController.getById)

  // CFLicense endpoint
  app.get('/ims/case/v1p1/CFLicenses/:id', deps.cfLicensesController.getById)
}
