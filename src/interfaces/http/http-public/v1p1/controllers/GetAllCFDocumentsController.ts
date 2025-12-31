import type { Request, Response } from 'express'
import { GetAllCFDocuments } from '../../../../../application/case/endpoints/GetAllCFDocuments'
import { StatusInfoFormatter } from '../../../../../infrastructure/http/StatusInfoFormatter'

export class GetAllCFDocumentsControllerV1p1 {
  constructor (private readonly getAllCFDocuments: GetAllCFDocuments) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? 'demo'

      // Parse query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
      const sort = req.query.sort as string | undefined
      const orderBy = req.query.orderBy as 'asc' | 'desc' | undefined
      const filter = req.query.filter as string | undefined
      const fields = req.query.fields ? (req.query.fields as string).split(',') : undefined

      // Validate limit and offset
      if (limit !== undefined && (isNaN(limit) || limit < 1)) {
        return res.status(400).json(StatusInfoFormatter.invalidSelectionField('Invalid limit parameter.'))
      }
      if (offset !== undefined && (isNaN(offset) || offset < 0)) {
        return res.status(400).json(StatusInfoFormatter.invalidSelectionField('Invalid offset parameter.'))
      }
      if (orderBy && orderBy !== 'asc' && orderBy !== 'desc') {
        return res.status(400).json(StatusInfoFormatter.invalidSelectionField('Invalid orderBy parameter. Must be "asc" or "desc".'))
      }

      const result = await this.getAllCFDocuments.execute({
        tenantId,
        caseVersion: '1.1',
        limit,
        offset,
        sort,
        orderBy,
        filter,
        fields
      })

      return res.status(200).json(result)
    } catch (error: any) {
      if (error.status === 401) {
        return res.status(401).json(StatusInfoFormatter.unauthorized(error.message))
      }
      if (error.status === 403) {
        return res.status(403).json(StatusInfoFormatter.forbidden(error.message))
      }
      if (error.status === 429) {
        return res.status(429).json(StatusInfoFormatter.serverBusy(error.message))
      }
      return res.status(500).json(StatusInfoFormatter.internalError(error.message || 'An internal server error occurred.'))
    }
  }
}

