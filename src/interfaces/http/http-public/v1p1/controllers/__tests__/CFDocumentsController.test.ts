import { Request, Response } from 'express'
import { CFDocumentsControllerV1p1 } from '../CFDocumentsController'
import { GetCFDocument } from '../../../../../../application/case/endpoints/GetCFDocument'

describe('CFDocumentsControllerV1p1', () => {
  let controller: CFDocumentsControllerV1p1
  let mockGetCFDocument: jest.Mocked<GetCFDocument>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockGetCFDocument = {
      execute: jest.fn()
    } as any

    controller = new CFDocumentsControllerV1p1(mockGetCFDocument)

    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnValue({ json: responseJson })

    mockRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' }
    }

    mockResponse = {
      status: responseStatus,
      json: responseJson
    }
  })

  describe('getById', () => {
    it('should return CFDocument when found', async () => {
      const result = {
        CFDocument: {
          identifier: 'doc-123',
          uri: '/ims/case/v1p1/CFDocuments/doc-123',
          creator: 'Test Creator',
          title: 'Test Document',
          lastChangeDateTime: '2024-01-01T00:00:00.000Z'
        }
      }

      mockGetCFDocument.execute.mockResolvedValue(result)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(mockGetCFDocument.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        caseVersion: '1.1',
        sourcedId: '550e8400-e29b-41d4-a716-446655440000'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith(result)
    })

    it('should return 404 when document is not found', async () => {
      mockGetCFDocument.execute.mockResolvedValue(null)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          imsx_codeMajor: 'failure',
          imsx_severity: 'error'
        })
      )
    })

    it('should return 404 for invalid UUID', async () => {
      mockRequest.params = { id: 'invalid-uuid' }
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          imsx_codeMajor: 'failure',
          imsx_severity: 'error'
        })
      )
    })

    it('should handle errors', async () => {
      const error = new Error('Database error')
      mockGetCFDocument.execute.mockRejectedValue(error)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          imsx_codeMajor: 'failure',
          imsx_severity: 'error'
        })
      )
    })
  })
})













