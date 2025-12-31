import { GetCFConcept } from '../GetCFConcept'
import { CFPackageRepository } from '../../ports/CFPackageRepository'
import { FileFrameworkStore } from '../../../../infrastructure/persistence/file/FileFrameworkStore'
import { CFPackage } from '../../../../domain/case/entities/CFPackage'
import { CFDocument } from '../../../../domain/case/entities/CFDocument'

describe('GetCFConcept', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>
  let mockStore: jest.Mocked<FileFrameworkStore>
  let getCFConcept: GetCFConcept

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any

    mockStore = {
      getAllDocuments: jest.fn()
    } as any

    getCFConcept = new GetCFConcept(mockRepository, mockStore)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'
    const caseVersion = '1.1'
    const conceptId = 'concept-123'

    it('should return null when concept is not found', async () => {
      mockStore.getAllDocuments.mockReturnValue([])

      const result = await getCFConcept.execute({ tenantId, caseVersion, sourcedId: conceptId })

      expect(result).toBeNull()
    })

    it('should return CFConcept when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: 'doc-123',
        uri: '/ims/case/v1p1/CFDocuments/doc-123',
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      })

      const concept = {
        identifier: conceptId,
        title: 'Test Concept',
        uri: '/ims/case/v1p1/CFConcepts/concept-123'
      }

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: [],
        definitions: {
          CFConcepts: [concept]
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

      const result = await getCFConcept.execute({ tenantId, caseVersion, sourcedId: conceptId })

      expect(result).toEqual({
        CFConcept: concept
      })
    })
  })
})

