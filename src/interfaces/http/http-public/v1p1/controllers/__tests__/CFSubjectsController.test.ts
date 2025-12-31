import { Request, Response } from 'express'
import { CFSubjectsControllerV1p1 } from '../CFSubjectsController'
import { GetCFSubject } from '../../../../../../application/case/endpoints/GetCFSubject'

describe('CFSubjectsControllerV1p1', () => {
  let controller: CFSubjectsControllerV1p1
  let mockGetCFSubject: jest.Mocked<GetCFSubject>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockGetCFSubject = {
      execute: jest.fn()
    } as any

    controller = new CFSubjectsControllerV1p1(mockGetCFSubject)

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
    it('should return CFSubject when found', async () => {
      const result = {
        CFSubject: {
          identifier: 'subject-123',
          uri: '/ims/case/v1p1/CFSubjects/subject-123',
          title: 'Mathematics',
          lastChangeDateTime: '2024-01-01T00:00:00.000Z'
        }
      }

      mockGetCFSubject.execute.mockResolvedValue(result)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(mockGetCFSubject.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        caseVersion: '1.1',
        sourcedId: '550e8400-e29b-41d4-a716-446655440000'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith(result)
    })

    it('should return 404 when subject is not found', async () => {
      mockGetCFSubject.execute.mockResolvedValue(null)
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
      mockGetCFSubject.execute.mockRejectedValue(error)
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.getById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
    })
  })
})

