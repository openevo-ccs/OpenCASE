import { loadConfig, type AppConfig } from '../infrastructure/config/Config'
import { logger } from '../infrastructure/logging/Logger'
import { JwtVerifier } from '../infrastructure/auth/JwtVerifier'
import { FileFrameworkStore } from '../infrastructure/persistence/file/FileFrameworkStore'
import { FileCFPackageRepository } from '../infrastructure/persistence/file/FileCFPackageRepository'
import { CreateFramework } from '../application/case/endpoints/CreateFramework'
import { ImportFrameworkFromEndpoint } from '../application/case/endpoints/ImportFrameworkFromEndpoint'
import { GetCFPackage } from '../application/case/endpoints/GetCFPackage'
import { FrameworksController } from '../interfaces/http/http-admin/controllers/FrameworksController'
import { CFPackagesControllerV1p1 } from '../interfaces/http/http-public/v1p1/controllers/CFPackagesController'
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
  const getCFPackage = new GetCFPackage(pkgRepo)

  // Initialize controllers
  const frameworksController = new FrameworksController(createFramework, importFramework)
  const cfPackagesControllerV1p1 = new CFPackagesControllerV1p1(getCFPackage)
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
