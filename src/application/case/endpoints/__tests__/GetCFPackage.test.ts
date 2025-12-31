import { GetCFPackage } from '../GetCFPackage';
import { CFPackageRepository } from '../../ports/CFPackageRepository';
import { CFPackage } from '../../../../domain/case/entities/CFPackage';
import { CFDocument } from '../../../../domain/case/entities/CFDocument';
import { CFItem } from '../../../../domain/case/entities/CFItem';
import { CFAssociation } from '../../../../domain/case/entities/CFAssociation';

describe('GetCFPackage', () => {
  let mockRepository: jest.Mocked<CFPackageRepository>;
  let getCFPackage: GetCFPackage;

  beforeEach(() => {
    mockRepository = {
      load: jest.fn(),
      saveNewVersion: jest.fn()
    } as any;

    getCFPackage = new GetCFPackage(mockRepository);
  });

  describe('execute', () => {
    const tenantId = 'test-tenant';
    const caseVersion = '1.1';
    const docId = 'doc-123';

    it('should return null when package is not found', async () => {
      mockRepository.load.mockResolvedValue(null);

      const result = await getCFPackage.execute({ tenantId, caseVersion, docId });

      expect(result).toBeNull();
      expect(mockRepository.load).toHaveBeenCalledWith(tenantId, caseVersion, docId);
    });

    it('should return formatted CFPackage when found', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: docId,
        uri: `/ims/case/v1p1/CFDocuments/${docId}`,
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      });

      const docURI = document.toJSON().uri;

      const item1 = CFItem.create({
        tenantId,
        caseVersion,
        sourcedId: 'item-1',
        uri: '/ims/case/v1p1/CFItems/item-1',
        fullStatement: 'Statement 1',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z'),
        CFDocumentURI: {
          title: 'Document',
          identifier: docId,
          uri: docURI
        }
      });

      const item2 = CFItem.create({
        tenantId,
        caseVersion,
        sourcedId: 'item-2',
        uri: '/ims/case/v1p1/CFItems/item-2',
        fullStatement: 'Statement 2',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z'),
        CFDocumentURI: {
          title: 'Document',
          identifier: docId,
          uri: docURI
        }
      });

      const association = CFAssociation.create({
        tenantId,
        caseVersion,
        sourcedId: 'assoc-1',
        uri: '/ims/case/v1p1/CFAssociations/assoc-1',
        associationType: 'isChildOf',
        originNodeURI: {
          title: 'Item 1',
          identifier: 'item-1',
          uri: '/ims/case/v1p1/CFItems/item-1'
        },
        destinationNodeURI: {
          title: 'Item 2',
          identifier: 'item-2',
          uri: '/ims/case/v1p1/CFItems/item-2'
        },
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      });

      const rubrics = [{ id: 'rubric-1', type: 'test' }];

      const pkg = new CFPackage({
        document,
        items: [item1, item2],
        associations: [association],
        rubrics
      });

      mockRepository.load.mockResolvedValue(pkg);

      const result = await getCFPackage.execute({ tenantId, caseVersion, docId });

      expect(result).toEqual({
        CFPackage: {
          CFDocument: expect.objectContaining({
            identifier: docId,
            title: 'Test Document',
            CFPackageURI: expect.objectContaining({
              identifier: docId
            })
          }),
          CFItems: expect.arrayContaining([
            expect.objectContaining({ identifier: 'item-1' }),
            expect.objectContaining({ identifier: 'item-2' })
          ]),
          CFAssociations: expect.arrayContaining([
            expect.objectContaining({ identifier: 'assoc-1' })
          ]),
          CFRubrics: rubrics
        }
      });
    });

    it('should handle empty items and associations', async () => {
      const document = CFDocument.create({
        tenantId,
        caseVersion,
        sourcedId: docId,
        uri: `/ims/case/v1p1/CFDocuments/${docId}`,
        creator: 'Test Creator',
        title: 'Test Document',
        lastChangeDateTime: new Date('2024-01-01T00:00:00Z')
      });

      const pkg = new CFPackage({
        document,
        items: [],
        associations: [],
        rubrics: []
      });

      mockRepository.load.mockResolvedValue(pkg);

      const result = await getCFPackage.execute({ tenantId, caseVersion, docId });

      expect(result).toEqual({
        CFPackage: {
          CFDocument: expect.objectContaining({
            identifier: docId,
            title: 'Test Document',
            CFPackageURI: expect.objectContaining({
              identifier: docId
            })
          }),
          CFItems: [],
          CFAssociations: []
        }
      });
    });
  });
});

