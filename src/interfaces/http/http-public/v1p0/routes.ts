import type { Express } from 'express'
import type { CFPackagesControllerV1p0 } from './controllers/CFPackagesController'
import type { CFDocumentsControllerV1p0 } from './controllers/CFDocumentsController'
import type { GetAllCFDocumentsControllerV1p0 } from './controllers/GetAllCFDocumentsController'
import type { CFItemsControllerV1p0 } from './controllers/CFItemsController'
import type { CFAssociationsControllerV1p0 } from './controllers/CFAssociationsController'
import type { CFItemAssociationsControllerV1p0 } from './controllers/CFItemAssociationsController'
import type { CFRubricsControllerV1p0 } from './controllers/CFRubricsController'
import type { CFSubjectsControllerV1p0 } from './controllers/CFSubjectsController'
import type { CFConceptsControllerV1p0 } from './controllers/CFConceptsController'
import type { CFAssociationGroupingsControllerV1p0 } from './controllers/CFAssociationGroupingsController'
import type { CFItemTypesControllerV1p0 } from './controllers/CFItemTypesController'
import type { CFLicensesControllerV1p0 } from './controllers/CFLicensesController'

export interface PublicV1p0Deps {
  cfPackagesController: CFPackagesControllerV1p0
  cfDocumentsController: CFDocumentsControllerV1p0
  getAllCFDocumentsController: GetAllCFDocumentsControllerV1p0
  cfItemsController: CFItemsControllerV1p0
  cfAssociationsController: CFAssociationsControllerV1p0
  cfItemAssociationsController: CFItemAssociationsControllerV1p0
  cfRubricsController: CFRubricsControllerV1p0
  cfSubjectsController: CFSubjectsControllerV1p0
  cfConceptsController: CFConceptsControllerV1p0
  cfAssociationGroupingsController: CFAssociationGroupingsControllerV1p0
  cfItemTypesController: CFItemTypesControllerV1p0
  cfLicensesController: CFLicensesControllerV1p0
}

export function registerV1p0Routes (app: Express, deps: PublicV1p0Deps) {
  // CFPackage endpoint
  app.get('/ims/case/v1p0/CFPackages/:id', deps.cfPackagesController.getById)

  // CFDocument endpoints
  app.get('/ims/case/v1p0/CFDocuments', deps.getAllCFDocumentsController.getAll)
  app.get('/ims/case/v1p0/CFDocuments/:id', deps.cfDocumentsController.getById)

  // CFItem endpoints
  app.get('/ims/case/v1p0/CFItems/:id', deps.cfItemsController.getById)
  app.get('/ims/case/v1p0/CFItemAssociations/:id', deps.cfItemAssociationsController.getById)

  // CFAssociation endpoint
  app.get('/ims/case/v1p0/CFAssociations/:id', deps.cfAssociationsController.getById)

  // CFRubric endpoint
  app.get('/ims/case/v1p0/CFRubrics/:id', deps.cfRubricsController.getById)

  // CFSubject endpoint
  app.get('/ims/case/v1p0/CFSubjects/:id', deps.cfSubjectsController.getById)

  // CFConcept endpoint
  app.get('/ims/case/v1p0/CFConcepts/:id', deps.cfConceptsController.getById)

  // CFAssociationGrouping endpoint
  app.get('/ims/case/v1p0/CFAssociationGroupings/:id', deps.cfAssociationGroupingsController.getById)

  // CFItemType endpoint
  app.get('/ims/case/v1p0/CFItemTypes/:id', deps.cfItemTypesController.getById)

  // CFLicense endpoint
  app.get('/ims/case/v1p0/CFLicenses/:id', deps.cfLicensesController.getById)
}

