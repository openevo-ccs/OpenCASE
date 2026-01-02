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
import { KeyManager } from '../infrastructure/oauth/KeyManager'
import { JwtSignerImpl } from '../infrastructure/oauth/JwtSignerImpl'
import { FileOAuthClientRepository } from '../infrastructure/oauth/FileOAuthClientRepository'
import { IssueToken } from '../application/oauth/endpoints/IssueToken'
import { TokenController } from '../interfaces/http/http-oauth/controllers/TokenController'
import { AuthorizeController } from '../interfaces/http/http-oauth/controllers/AuthorizeController'
import { RevokeController } from '../interfaces/http/http-oauth/controllers/RevokeController'
import { AccountsManagementController } from '../interfaces/http/http-management/controllers/AccountsManagementController'
import { CaseApiClient } from '../infrastructure/http/CaseApiClient'
import { JsonSchemaValidator } from '../infrastructure/validation/JsonSchemaValidator'
import { BcryptPasswordHasher } from '../application/user/services/PasswordHasher'
import { FileUserAccountRepository } from '../infrastructure/user/FileUserAccountRepository'
import { FileTenantMembershipRepository } from '../infrastructure/user/FileTenantMembershipRepository'
import { FileAuthorizationCodeRepository } from '../infrastructure/oauth/FileAuthorizationCodeRepository'
import { FileRefreshTokenRepository } from '../infrastructure/oauth/FileRefreshTokenRepository'
import { CreateUserAccount } from '../application/user/endpoints/CreateUserAccount'
import { DeleteUserAccount } from '../application/user/endpoints/DeleteUserAccount'
import { UpdateUserAccount } from '../application/user/endpoints/UpdateUserAccount'
import { ListTenantAccounts } from '../application/user/endpoints/ListTenantAccounts'
import { AddTenantMembership } from '../application/user/endpoints/AddTenantMembership'
import { RemoveTenantMembership } from '../application/user/endpoints/RemoveTenantMembership'
import { Authorize } from '../application/oauth/endpoints/Authorize'
import { IssueTokenFromCode } from '../application/oauth/endpoints/IssueTokenFromCode'
import { IssueTokenFromRefresh } from '../application/oauth/endpoints/IssueTokenFromRefresh'
import { RevokeToken } from '../application/oauth/endpoints/RevokeToken'
import { CreateOAuthClient } from '../application/oauth/endpoints/CreateOAuthClient'
import { DeleteOAuthClient } from '../application/oauth/endpoints/DeleteOAuthClient'
import { ListTenantClients } from '../application/oauth/endpoints/ListTenantClients'
import { OAuthClientsManagementController } from '../interfaces/http/http-management/controllers/OAuthClientsManagementController'
import path from 'path'

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
      authorize?: AuthorizeController
      revoke?: RevokeController
    }
    management: {
      cfDocuments: CFDocumentsManagementController
      cfItems: CFItemsManagementController
      cfAssociations: CFAssociationsManagementController
      frameworks: FrameworksManagementController
      tenants: TenantsManagementController
      accounts?: AccountsManagementController
      oauthClients?: OAuthClientsManagementController
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

  // Initialize user account repositories
  const userAccountRepo = new FileUserAccountRepository({
    accountsFile: path.join(config.caseDataDir, 'users', 'accounts.json')
  })
  await userAccountRepo.load()

  const tenantMembershipRepo = new FileTenantMembershipRepository({
    membershipsFile: path.join(config.caseDataDir, 'users', 'tenant-memberships.json')
  })
  await tenantMembershipRepo.load()

  // Initialize OAuth repositories
  const authorizationCodeRepo = new FileAuthorizationCodeRepository()
  const refreshTokenRepo = new FileRefreshTokenRepository({
    tokensFile: path.join(config.caseDataDir, 'oauth', 'refresh-tokens.json')
  })
  await refreshTokenRepo.load()

  // Initialize password hasher
  const passwordHasher = new BcryptPasswordHasher()

  // Initialize user account commands
  const createUserAccount = new CreateUserAccount(userAccountRepo, tenantMembershipRepo, passwordHasher)
  const deleteUserAccount = new DeleteUserAccount(userAccountRepo, tenantMembershipRepo)
  const updateUserAccount = new UpdateUserAccount(userAccountRepo, passwordHasher)
  const listTenantAccounts = new ListTenantAccounts(tenantMembershipRepo, userAccountRepo)
  const addTenantMembership = new AddTenantMembership(userAccountRepo, tenantMembershipRepo)
  const removeTenantMembership = new RemoveTenantMembership(tenantMembershipRepo)

  // Initialize OAuth authorization code flow commands
  const authorize = new Authorize(userAccountRepo, tenantMembershipRepo, passwordHasher, authorizationCodeRepo, oauthClientRepo)
  const issueTokenFromCode = new IssueTokenFromCode(authorizationCodeRepo, tenantMembershipRepo, refreshTokenRepo, jwtSigner, config.jwtAudience)
  const issueTokenFromRefresh = new IssueTokenFromRefresh(refreshTokenRepo, tenantMembershipRepo, jwtSigner, config.jwtAudience)
  const revokeToken = new RevokeToken(refreshTokenRepo)

  // Initialize OAuth client management commands
  const createOAuthClient = new CreateOAuthClient(oauthClientRepo)
  const deleteOAuthClient = new DeleteOAuthClient(oauthClientRepo)
  const listTenantClients = new ListTenantClients(oauthClientRepo)

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

  // Initialize management commands
  const updateCFDocument = new UpdateCFDocument(pkgRepo)
  const updateCFItem = new UpdateCFItem(pkgRepo, store)
  const updateCFAssociation = new UpdateCFAssociation(pkgRepo, store)
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
  
  // Initialize OAuth controllers
  const tokenController = new TokenController(issueToken, issueTokenFromCode, issueTokenFromRefresh)
  const authorizeController = new AuthorizeController(authorize)
  const revokeController = new RevokeController(revokeToken)

  // Initialize management commands
  const listFrameworks = new ListFrameworks(store)
  const listTenants = new ListTenants()
  const createTenant = new CreateTenant(createUserAccount) // Pass createUserAccount for auto-creating admin account

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

  // Initialize account management controller
  const accountsManagementController = new AccountsManagementController(
    createUserAccount,
    deleteUserAccount,
    updateUserAccount,
    listTenantAccounts,
    addTenantMembership,
    removeTenantMembership
  )

  // Initialize OAuth client management controller
  const oauthClientsManagementController = new OAuthClientsManagementController(
    createOAuthClient,
    deleteOAuthClient,
    listTenantClients
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
      oauth: {
        token: tokenController,
        authorize: authorizeController!,
        revoke: revokeController!
      },
      management: {
        cfDocuments: cfDocumentsManagementController,
        cfItems: cfItemsManagementController,
        cfAssociations: cfAssociationsManagementController,
        frameworks: frameworksManagementController,
        tenants: tenantsManagementController,
        accounts: accountsManagementController!
      }
    }
  }
}
