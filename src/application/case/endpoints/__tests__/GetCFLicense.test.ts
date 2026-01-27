import { GetCFLicense } from '../GetCFLicense'
import { CFPackageRepository } from '../../ports/CFPackageRepository'
import { FileFrameworkStore } from '../../../../infrastructure/persistence/file/FileFrameworkStore'
import { CFPackage } from '../../../../domain/case/entities/CFPackage'
import { CFDocument } from '../../../../domain/case/entities/CFDocument'

describe('GetCFLicense', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>
  let mockStore: jest.Mocked<FileFrameworkStore>
  let getCFLicense: GetCFLicense

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any

    mockStore = {
      getAllDocuments: jest.fn()
    } as any

    getCFLicense = new GetCFLicense(mockRepository, mockStore)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'
    const caseVersion = '1.1'
    const licenseId = 'license-123'

    it('should return null when license is not found', async () => {
      mockStore.getAllDocuments.mockReturnValue([])

      const result = await getCFLicense.execute({ tenantId, caseVersion, sourcedId: licenseId })

      expect(result).toBeNull()
    })

    it('should return CFLicense when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: 'doc-123',
        uri: '/ims/case/v1p1/CFDocuments/doc-123',
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      })

      const license = {
        identifier: licenseId,
        title: 'Test License',
        licenseText: 'License text here',
        uri: '/ims/case/v1p1/CFLicenses/license-123',
        lastChangeDateTime: '2024-01-01T00:00:00.000Z'
      }

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: [],
        definitions: {
          CFLicenses: [license]
        }
      })

      mockStore.getAllDocuments.mockReturnValue([
        {
          sourcedId: 'doc-123',
          title: 'Test Document',
          lastChangeDateTime: new Date('2024-01-01T00:00:00Z'),
          currentFile: 'file.json'
        }
      ] as any)
      mockRepository.load.mockResolvedValue(pkg)

      const result = await getCFLicense.execute({ tenantId, caseVersion, sourcedId: licenseId })

      expect(result).toEqual({
        CFLicense: license
      })
    })
  })
})













