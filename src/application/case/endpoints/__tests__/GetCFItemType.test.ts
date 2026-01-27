import { GetCFItemType } from '../GetCFItemType'
import { CFPackageRepository } from '../../ports/CFPackageRepository'
import { FileFrameworkStore } from '../../../../infrastructure/persistence/file/FileFrameworkStore'
import { CFPackage } from '../../../../domain/case/entities/CFPackage'
import { CFDocument } from '../../../../domain/case/entities/CFDocument'

describe('GetCFItemType', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>
  let mockStore: jest.Mocked<FileFrameworkStore>
  let getCFItemType: GetCFItemType

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any

    mockStore = {
      getAllDocuments: jest.fn()
    } as any

    getCFItemType = new GetCFItemType(mockRepository, mockStore)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'
    const caseVersion = '1.1'
    const itemTypeId = 'itemtype-123'

    it('should return null when item type is not found', async () => {
      mockStore.getAllDocuments.mockReturnValue([])

      const result = await getCFItemType.execute({ tenantId, caseVersion, sourcedId: itemTypeId })

      expect(result).toBeNull()
    })

    it('should return CFItemType when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: 'doc-123',
        uri: '/ims/case/v1p1/CFDocuments/doc-123',
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      })

      const itemType = {
        identifier: itemTypeId,
        title: 'Test Item Type',
        description: 'Test Description',
        hierarchyCode: '01',
        uri: '/ims/case/v1p1/CFItemTypes/itemtype-123',
        lastChangeDateTime: '2024-01-01T00:00:00.000Z'
      }

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: [],
        definitions: {
          CFItemTypes: [itemType]
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

      const result = await getCFItemType.execute({ tenantId, caseVersion, sourcedId: itemTypeId })

      expect(result).toEqual({
        CFItemType: itemType
      })
    })
  })
})













