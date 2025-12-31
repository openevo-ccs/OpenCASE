import { GetCFAssociationGrouping } from '../GetCFAssociationGrouping'
import { CFPackageRepository } from '../../ports/CFPackageRepository'
import { FileFrameworkStore } from '../../../../infrastructure/persistence/file/FileFrameworkStore'
import { CFPackage } from '../../../../domain/case/entities/CFPackage'
import { CFDocument } from '../../../../domain/case/entities/CFDocument'

describe('GetCFAssociationGrouping', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>
  let mockStore: jest.Mocked<FileFrameworkStore>
  let getCFAssociationGrouping: GetCFAssociationGrouping

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any

    mockStore = {
      getAllDocuments: jest.fn()
    } as any

    getCFAssociationGrouping = new GetCFAssociationGrouping(mockRepository, mockStore)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'
    const caseVersion = '1.1'
    const groupingId = 'grouping-123'

    it('should return null when grouping is not found', async () => {
      mockStore.getAllDocuments.mockReturnValue([])

      const result = await getCFAssociationGrouping.execute({ tenantId, caseVersion, sourcedId: groupingId })

      expect(result).toBeNull()
    })

    it('should return CFAssociationGrouping when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: 'doc-123',
        uri: '/ims/case/v1p1/CFDocuments/doc-123',
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      })

      const grouping = {
        identifier: groupingId,
        title: 'Test Grouping',
        uri: '/ims/case/v1p1/CFAssociationGroupings/grouping-123'
      }

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: [],
        definitions: {
          CFAssociationGroupings: [grouping]
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

      const result = await getCFAssociationGrouping.execute({ tenantId, caseVersion, sourcedId: groupingId })

      expect(result).toEqual({
        CFAssociationGrouping: grouping
      })
    })
  })
})

