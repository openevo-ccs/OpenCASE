import { loadConfig, type AppConfig } from '../infrastructure/config/Config'
import { logger } from '../infrastructure/logging/Logger'
import { JwtVerifier } from '../infrastructure/auth/JwtVerifier'
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
import { KeyManager } from '../infrastructure/oauth/KeyManager'
import { JwtSignerImpl } from '../infrastructure/oauth/JwtSignerImpl'
import { FileOAuthClientRepository } from '../infrastructure/oauth/FileOAuthClientRepository'
import { IssueToken } from '../application/oauth/endpoints/IssueToken'
import { TokenController } from '../interfaces/http/http-oauth/controllers/TokenController'
import { CaseApiClient } from '../infrastructure/http/CaseApiClient'
import { JsonSchemaValidator } from '../infrastructure/validation/JsonSchemaValidator'

export interface Container {
  config: AppConfig
  logger: typeof logger
  jwtVerifier: JwtVerifier
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
    oauth: {
      token: TokenController
    }
  }
}

export async function buildContainer(): Promise<Container> {
  const config = loadConfig()

  // Initialize OAuth key management
  const keyManager = new KeyManager(config.oauthKeyDir)
  const keyPair = await keyManager.ensureKeys()

  // Use OAuth public key for JWT verification (or fallback to config)
  const publicKey = config.jwtPublicKey !== 'changeme' ? config.jwtPublicKey : keyPair.publicKey

  const jwtVerifier = new JwtVerifier({
    issuer: config.oauthIssuer,
    audience: config.jwtAudience,
    publicKey
  })

  // Initialize OAuth client repository
  const oauthClientRepo = new FileOAuthClientRepository({
    clientsFile: config.oauthClientsFile
  })
  await oauthClientRepo.load()

  // Initialize JWT signer
  const jwtSigner = new JwtSignerImpl({
    privateKey: keyPair.privateKey,
    issuer: config.oauthIssuer,
    algorithm: 'RS256'
  })

  // Initialize OAuth command
  const issueToken = new IssueToken(oauthClientRepo, jwtSigner, config.jwtAudience)

  // Initialize CASE services
  const store = new FileFrameworkStore({ baseDataDir: config.caseDataDir })
  await store.loadAll()

  const pkgRepo = new FileCFPackageRepository(store)

  // Initialize HTTP client for fetching frameworks from endpoints
  const caseApiClient = new CaseApiClient({
    timeout: 30000 // 30 second timeout
  })

  // Initialize JSON schema validator (optional - can be configured with schemas later)
  const jsonSchemaValidator = new JsonSchemaValidator()
  // TODO: Load CASE JSON schemas if available
  // Example: jsonSchemaValidator.addSchema('case-v1p1', caseV1p1Schema)

  const createFramework = new CreateFramework(pkgRepo)
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
  const tokenController = new TokenController(issueToken)

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
      oauth: {
        token: tokenController
      }
    }
  }
}
