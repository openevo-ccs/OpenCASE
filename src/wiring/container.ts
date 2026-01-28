import { loadConfig, type AppConfig } from '../infrastructure/config/Config'
import { logger } from '../infrastructure/logging/Logger'
import { OidcJwtVerifier } from '../infrastructure/auth/OidcJwtVerifier'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FileFrameworkStore } from '../infrastructure/persistence/file/FileFrameworkStore'
import { FileCFPackageRepository } from '../infrastructure/persistence/file/FileCFPackageRepository'
import { CreateFramework } from '../application/case/endpoints/CreateFramework'
import { ImportFrameworkFromEndpoint } from '../application/case/endpoints/ImportFrameworkFromEndpoint'
import { GetCFPackage } from '../application/case/endpoints/GetCFPackage'
import { GetCFDocument } from '../application/case/endpoints/GetCFDocument'
import { GetAllCFDocuments } from '../application/case/endpoints/GetAllCFDocuments'
import { GetCFItem } from '../application/case/endpoints/GetCFItem'
import { GetCFAssociation } from '../application/case/endpoints/GetCFAssociation'
import { GetCFItemAssociations } from '../application/case/endpoints/GetCFItemAssociations'
import { GetCFRubric } from '../application/case/endpoints/GetCFRubric'
import { GetCFSubject } from '../application/case/endpoints/GetCFSubject'
import { GetCFConcept } from '../application/case/endpoints/GetCFConcept'
import { GetCFAssociationGrouping } from '../application/case/endpoints/GetCFAssociationGrouping'
import { GetCFItemType } from '../application/case/endpoints/GetCFItemType'
import { GetCFLicense } from '../application/case/endpoints/GetCFLicense'
import { UpdateCFDocument } from '../application/case/endpoints/UpdateCFDocument'
import { UpdateCFItem } from '../application/case/endpoints/UpdateCFItem'
import { UpdateCFAssociation } from '../application/case/endpoints/UpdateCFAssociation'
import { DeleteCFDocument } from '../application/case/endpoints/DeleteCFDocument'
import { DeleteCFItem } from '../application/case/endpoints/DeleteCFItem'
import { DeleteCFAssociation } from '../application/case/endpoints/DeleteCFAssociation'
import { FrameworksController } from '../interfaces/http/http-admin/controllers/FrameworksController'
import { CFPackagesControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFPackagesController'
import { CFDocumentsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFDocumentsController'
import { GetAllCFDocumentsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/GetAllCFDocumentsController'
import { CFItemsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFItemsController'
import { CFAssociationsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFAssociationsController'
import { CFItemAssociationsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFItemAssociationsController'
import { CFRubricsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFRubricsController'
import { CFSubjectsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFSubjectsController'
import { CFConceptsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFConceptsController'
import { CFAssociationGroupingsControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFAssociationGroupingsController'
import { CFItemTypesControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFItemTypesController'
import { CFLicensesControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFLicensesController'
import { DiscoveryControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/DiscoveryController'
import { CFDocumentsManagementController } from '../interfaces/http/http-management/controllers/CFDocumentsManagementController'
import { CFItemsManagementController } from '../interfaces/http/http-management/controllers/CFItemsManagementController'
import { CFAssociationsManagementController } from '../interfaces/http/http-management/controllers/CFAssociationsManagementController'
import { FrameworksManagementController } from '../interfaces/http/http-management/controllers/FrameworksManagementController'
import { TenantsManagementController } from '../interfaces/http/http-management/controllers/TenantsManagementController'
import { ListFrameworks } from '../application/case/endpoints/ListFrameworks'
import { ListTenants } from '../application/case/endpoints/ListTenants'
import { CreateTenant } from '../application/case/endpoints/CreateTenant'
import { CaseApiClient } from '../infrastructure/http/CaseApiClient'
import { JsonSchemaValidator } from '../infrastructure/validation/JsonSchemaValidator'
import { KeycloakAdminClient } from '../infrastructure/keycloak/KeycloakAdminClient'
import { KeycloakTenantProvisioner } from '../infrastructure/keycloak/KeycloakTenantProvisioner'

export interface Container {
  config: AppConfig
  logger: typeof logger
  jwtVerifier: OidcJwtVerifier
  store: FileFrameworkStore
  controllers: {
    v1p1: {
      cfPackages: CFPackagesControllerV1p1
      cfDocuments: CFDocumentsControllerV1p1
      getAllCFDocuments: GetAllCFDocumentsControllerV1p1
      cfItems: CFItemsControllerV1p1
      cfAssociations: CFAssociationsControllerV1p1
      cfItemAssociations: CFItemAssociationsControllerV1p1
      cfRubrics: CFRubricsControllerV1p1
      cfSubjects: CFSubjectsControllerV1p1
      cfConcepts: CFConceptsControllerV1p1
      cfAssociationGroupings: CFAssociationGroupingsControllerV1p1
      cfItemTypes: CFItemTypesControllerV1p1
      cfLicenses: CFLicensesControllerV1p1
      discovery: DiscoveryControllerV1p1
    }
    admin: {
      frameworks: FrameworksController
    }
    management: {
      cfDocuments: CFDocumentsManagementController
      cfItems: CFItemsManagementController
      cfAssociations: CFAssociationsManagementController
      frameworks: FrameworksManagementController
      tenants: TenantsManagementController
    }
  }
}

export async function buildContainer(): Promise<Container> {
  const config = loadConfig()

  const jwtVerifier = new OidcJwtVerifier({
    issuerUrl: config.oidcIssuerUrl,
    clientIdPrefix: config.oidcClientIdPrefix
  })

  // Initialize CASE services
  const store = new FileFrameworkStore({ baseDataDir: config.caseDataDir })
  await store.loadAll()

  const pkgRepo = new FileCFPackageRepository(store)

  // Initialize HTTP client for fetching frameworks from endpoints
  const caseApiClient = new CaseApiClient({
    timeout: 30000 // 30 second timeout
  })

  // Initialize JSON schema validator and load CASE schemas
  const jsonSchemaValidator = new JsonSchemaValidator()
  try {
    // Try multiple paths to support both development and production builds
    const possiblePaths = [
      join(__dirname, '../../schemas'), // Development: src/wiring -> schemas
      join(__dirname, '../../../schemas'), // Production: dist/wiring -> schemas
      join(process.cwd(), 'schemas') // Fallback: project root
    ]
    
    let schemasDir: string | null = null
    for (const path of possiblePaths) {
      try {
        const testFile = join(path, 'case-v1p1-cfpackage.json')
        readFileSync(testFile, 'utf-8')
        schemasDir = path
        break
      } catch {
        // Try next path
      }
    }
    
    if (!schemasDir) {
      throw new Error('Could not find schemas directory')
    }
    
    const cfPackageSchema = JSON.parse(readFileSync(join(schemasDir, 'case-v1p1-cfpackage.json'), 'utf-8'))
    const cfDocumentSchema = JSON.parse(readFileSync(join(schemasDir, 'case-v1p1-cfdocument.json'), 'utf-8'))
    const cfItemSchema = JSON.parse(readFileSync(join(schemasDir, 'case-v1p1-cfitem.json'), 'utf-8'))
    const cfAssociationSchema = JSON.parse(readFileSync(join(schemasDir, 'case-v1p1-cfassociation.json'), 'utf-8'))
    
    jsonSchemaValidator.addSchema('case-v1p1-cfpackage', cfPackageSchema)
    jsonSchemaValidator.addSchema('case-v1p1-cfdocument', cfDocumentSchema)
    jsonSchemaValidator.addSchema('case-v1p1-cfitem', cfItemSchema)
    jsonSchemaValidator.addSchema('case-v1p1-cfassociation', cfAssociationSchema)
    
    logger.info('Loaded CASE JSON schemas for validation')
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to load JSON schemas - validation will be skipped')
  }

  const createFramework = new CreateFramework(pkgRepo, jsonSchemaValidator)
  const importFramework = new ImportFrameworkFromEndpoint(pkgRepo, caseApiClient, jsonSchemaValidator)
  
  // Initialize CASE endpoints
  const getCFPackage = new GetCFPackage(pkgRepo)
  const getCFDocument = new GetCFDocument(pkgRepo)
  const getAllCFDocuments = new GetAllCFDocuments(store)
  const getCFItem = new GetCFItem(pkgRepo, store)
  const getCFAssociation = new GetCFAssociation(pkgRepo, store)
  const getCFItemAssociations = new GetCFItemAssociations(pkgRepo, store)
  const getCFRubric = new GetCFRubric(pkgRepo, store)
  const getCFSubject = new GetCFSubject(pkgRepo, store)
  const getCFConcept = new GetCFConcept(pkgRepo, store)
  const getCFAssociationGrouping = new GetCFAssociationGrouping(pkgRepo, store)
  const getCFItemType = new GetCFItemType(pkgRepo, store)
  const getCFLicense = new GetCFLicense(pkgRepo, store)

  // Initialize management commands
  const updateCFDocument = new UpdateCFDocument(pkgRepo, jsonSchemaValidator)
  const updateCFItem = new UpdateCFItem(pkgRepo, store, jsonSchemaValidator)
  const updateCFAssociation = new UpdateCFAssociation(pkgRepo, store, jsonSchemaValidator)
  const deleteCFDocument = new DeleteCFDocument(pkgRepo, store)
  const deleteCFItem = new DeleteCFItem(pkgRepo, store)
  const deleteCFAssociation = new DeleteCFAssociation(pkgRepo, store)

  // Initialize controllers
  const frameworksController = new FrameworksController(createFramework, importFramework)
  const cfPackagesControllerV1p1 = new CFPackagesControllerV1p1(getCFPackage)
  const cfDocumentsControllerV1p1 = new CFDocumentsControllerV1p1(getCFDocument)
  const getAllCFDocumentsControllerV1p1 = new GetAllCFDocumentsControllerV1p1(getAllCFDocuments)
  const cfItemsControllerV1p1 = new CFItemsControllerV1p1(getCFItem)
  const cfAssociationsControllerV1p1 = new CFAssociationsControllerV1p1(getCFAssociation)
  const cfItemAssociationsControllerV1p1 = new CFItemAssociationsControllerV1p1(getCFItemAssociations)
  const cfRubricsControllerV1p1 = new CFRubricsControllerV1p1(getCFRubric)
  const cfSubjectsControllerV1p1 = new CFSubjectsControllerV1p1(getCFSubject)
  const cfConceptsControllerV1p1 = new CFConceptsControllerV1p1(getCFConcept)
  const cfAssociationGroupingsControllerV1p1 = new CFAssociationGroupingsControllerV1p1(getCFAssociationGrouping)
  const cfItemTypesControllerV1p1 = new CFItemTypesControllerV1p1(getCFItemType)
  const cfLicensesControllerV1p1 = new CFLicensesControllerV1p1(getCFLicense)
  const discoveryControllerV1p1 = new DiscoveryControllerV1p1()
  
  // Initialize management commands
  const listFrameworks = new ListFrameworks(store)
  const listTenants = new ListTenants()
  const keycloakAdmin = new KeycloakAdminClient({
    baseUrl: config.keycloakBaseUrl,
    realm: config.keycloakRealm,
    adminRealm: config.keycloakAdminRealm,
    clientId: config.keycloakAdminClientId,
    clientSecret: config.keycloakAdminClientSecret,
    username: config.keycloakAdminUsername,
    password: config.keycloakAdminPassword
  })
  const keycloakTenantProvisioner = new KeycloakTenantProvisioner(keycloakAdmin, {
    realm: config.keycloakRealm,
    clientIdPrefix: config.oidcClientIdPrefix,
    spaRedirectUris: config.keycloakSpaRedirectUris,
    spaWebOrigins: config.keycloakSpaWebOrigins,
    bootstrapSystemAdmin: config.keycloakBootstrapSystemAdmin,
    systemAdminEmail: config.keycloakSystemAdminEmail,
    systemAdminPassword: config.keycloakSystemAdminPassword
  })

  // Best-effort Keycloak bootstrap (do not fail server startup if Keycloak isn't reachable yet)
  await keycloakAdmin.ensureRealmExists().catch((error: any) => {
    logger.warn({ error: error?.message }, 'Keycloak realm ensure failed (continuing)')
  })
  await keycloakTenantProvisioner.bootstrapSystemAdmin().catch((error: any) => {
    logger.warn({ error: error?.message }, 'Keycloak system-admin bootstrap failed (continuing)')
  })
  const createTenant = new CreateTenant(keycloakTenantProvisioner)

  // Initialize management controllers
  const cfDocumentsManagementController = new CFDocumentsManagementController(
    updateCFDocument,
    deleteCFDocument
  )
  const cfItemsManagementController = new CFItemsManagementController(
    updateCFItem,
    deleteCFItem
  )
  const cfAssociationsManagementController = new CFAssociationsManagementController(
    updateCFAssociation,
    deleteCFAssociation
  )
  const frameworksManagementController = new FrameworksManagementController(
    listFrameworks
  )
  const tenantsManagementController = new TenantsManagementController(
    listTenants,
    createTenant,
    config.caseDataDir
  )

  return {
    config,
    logger,
    jwtVerifier,
    store,
    controllers: {
      v1p1: {
        cfPackages: cfPackagesControllerV1p1,
        cfDocuments: cfDocumentsControllerV1p1,
        getAllCFDocuments: getAllCFDocumentsControllerV1p1,
        cfItems: cfItemsControllerV1p1,
        cfAssociations: cfAssociationsControllerV1p1,
        cfItemAssociations: cfItemAssociationsControllerV1p1,
        cfRubrics: cfRubricsControllerV1p1,
        cfSubjects: cfSubjectsControllerV1p1,
        cfConcepts: cfConceptsControllerV1p1,
        cfAssociationGroupings: cfAssociationGroupingsControllerV1p1,
        cfItemTypes: cfItemTypesControllerV1p1,
        cfLicenses: cfLicensesControllerV1p1,
        discovery: discoveryControllerV1p1
      },
      admin: {
        frameworks: frameworksController
      },
      management: {
        cfDocuments: cfDocumentsManagementController,
        cfItems: cfItemsManagementController,
        cfAssociations: cfAssociationsManagementController,
        frameworks: frameworksManagementController,
        tenants: tenantsManagementController
      }
    }
  }
}
