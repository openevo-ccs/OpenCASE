import { Request, Response } from 'express'
import { CFAssociationGroupingsControllerV1p1 } from '../CFAssociationGroupingsController'
import { GetCFAssociationGrouping } from '../../../../../../application/case/endpoints/GetCFAssociationGrouping'

describe('CFAssociationGroupingsControllerV1p1', () => {
  let controller: CFAssociationGroupingsControllerV1p1
  let mockGetCFAssociationGrouping: jest.Mocked<GetCFAssociationGrouping>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockGetCFAssociationGrouping = {
      execute: jest.fn()
    } as any

    controller = new CFAssociationGroupingsControllerV1p1(mockGetCFAssociationGrouping)

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
    it('should return CFAssociationGrouping when found', async () => {
      const result = {
        CFAssociationGrouping: {
          identifier: 'grouping-123',
          uri: '/ims/case/v1p1/CFAssociationGroupings/grouping-123',
          title: 'Test Grouping',
          lastChangeDateTime: '2024-01-01T00:00:00.000Z'
        }
      }

      mockGetCFAssociationGrouping.execute.mockResolvedValue(result)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(mockGetCFAssociationGrouping.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        caseVersion: '1.1',
        sourcedId: '550e8400-e29b-41d4-a716-446655440000'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith(result)
    })

    it('should return 404 when grouping is not found', async () => {
      mockGetCFAssociationGrouping.execute.mockResolvedValue(null)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
    })

    it('should return 404 for invalid UUID', async () => {
      mockRequest.params = { id: 'invalid-uuid' }
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
    })

    it('should handle errors', async () => {
      const error = new Error('Database error')
      mockGetCFAssociationGrouping.execute.mockRejectedValue(error)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
    })
  })
})













