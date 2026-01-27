import { Request, Response } from 'express'
import { CFConceptsControllerV1p1 } from '../CFConceptsController'
import { GetCFConcept } from '../../../../../../application/case/endpoints/GetCFConcept'

describe('CFConceptsControllerV1p1', () => {
  let controller: CFConceptsControllerV1p1
  let mockGetCFConcept: jest.Mocked<GetCFConcept>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockGetCFConcept = {
      execute: jest.fn()
    } as any

    controller = new CFConceptsControllerV1p1(mockGetCFConcept)

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
    it('should return CFConcept when found', async () => {
      const result = {
        CFConcept: {
          identifier: 'concept-123',
          uri: '/ims/case/v1p1/CFConcepts/concept-123',
          title: 'Test Concept',
          lastChangeDateTime: '2024-01-01T00:00:00.000Z'
        }
      }

      mockGetCFConcept.execute.mockResolvedValue(result)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(mockGetCFConcept.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        caseVersion: '1.1',
        sourcedId: '550e8400-e29b-41d4-a716-446655440000'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith(result)
    })

    it('should return 404 when concept is not found', async () => {
      mockGetCFConcept.execute.mockResolvedValue(null)
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
      mockGetCFConcept.execute.mockRejectedValue(error)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
    })
  })
})













