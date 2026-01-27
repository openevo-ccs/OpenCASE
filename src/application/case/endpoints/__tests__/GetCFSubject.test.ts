import { GetCFSubject } from '../GetCFSubject'
import { CFPackageRepository } from '../../ports/CFPackageRepository'
import { FileFrameworkStore } from '../../../../infrastructure/persistence/file/FileFrameworkStore'
import { CFPackage } from '../../../../domain/case/entities/CFPackage'
import { CFDocument } from '../../../../domain/case/entities/CFDocument'

describe('GetCFSubject', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>
  let mockStore: jest.Mocked<FileFrameworkStore>
  let getCFSubject: GetCFSubject

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any

    mockStore = {
      getAllDocuments: jest.fn()
    } as any

    getCFSubject = new GetCFSubject(mockRepository, mockStore)
  })

  describe('execute', () => {
    const tenantId = 'test-tenant'
    const caseVersion = '1.1'
    const subjectId = 'subject-123'

    it('should return null when subject is not found', async () => {
      mockStore.getAllDocuments.mockReturnValue([])

      const result = await getCFSubject.execute({ tenantId, caseVersion, sourcedId: subjectId })

      expect(result).toBeNull()
    })

    it('should return CFSubject when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: 'doc-123',
        uri: '/ims/case/v1p1/CFDocuments/doc-123',
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      })

      const subject = {
        identifier: subjectId,
        title: 'Mathematics',
        uri: '/ims/case/v1p1/CFSubjects/subject-123'
      }

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: [],
        definitions: {
          CFSubjects: [subject]
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

      const result = await getCFSubject.execute({ tenantId, caseVersion, sourcedId: subjectId })

      expect(result).toEqual({
        CFSubject: subject
      })
    })
  })
})













