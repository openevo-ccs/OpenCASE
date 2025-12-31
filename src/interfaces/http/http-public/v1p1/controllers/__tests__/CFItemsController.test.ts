import { Request, Response } from 'express'
import { CFItemsControllerV1p1 } from '../CFItemsController'
import { GetCFItem } from '../../../../../../application/case/endpoints/GetCFItem'

describe('CFItemsControllerV1p1', () => {
  let controller: CFItemsControllerV1p1
  let mockGetCFItem: jest.Mocked<GetCFItem>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockGetCFItem = {
      execute: jest.fn()
    } as any

    controller = new CFItemsControllerV1p1(mockGetCFItem)

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
    it('should return CFItem when found', async () => {
      const result = {
        CFItem: {
          identifier: 'item-123',
          uri: '/ims/case/v1p1/CFItems/item-123',
          fullStatement: 'Test Statement',
          lastChangeDateTime: '2024-01-01T00:00:00.000Z',
          CFDocumentURI: {
            title: 'CFDocument',
            identifier: 'doc-123',
            uri: '/ims/case/v1p1/CFDocuments/doc-123'
          }
        }
      }

      mockGetCFItem.execute.mockResolvedValue(result)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(mockGetCFItem.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        caseVersion: '1.1',
        sourcedId: '550e8400-e29b-41d4-a716-446655440000'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith(result)
    })

    it('should return 404 when item is not found', async () => {
      mockGetCFItem.execute.mockResolvedValue(null)
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
    })

    it('should handle errors', async () => {
      const error = new Error('Database error')
      mockGetCFItem.execute.mockRejectedValue(error)
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

