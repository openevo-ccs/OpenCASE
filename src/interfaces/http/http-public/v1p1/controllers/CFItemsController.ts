import type { Request, Response } from 'express'
import { GetCFItem } from '../../../../../application/case/endpoints/GetCFItem'
import { StatusInfoFormatter } from '../../../../../infrastructure/http/StatusInfoFormatter'

export class CFItemsControllerV1p1 {
  constructor (private readonly getCFItem: GetCFItem) {}

  getById = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? 'demo'
      const sourcedId = req.params.id

      // Validate UUID format (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(sourcedId)) {
        return res.status(404).json(StatusInfoFormatter.invalidUUID('The supplied identifier is not a valid UUID.'))
      }

      const result = await this.getCFItem.execute({
        tenantId,
        caseVersion: '1.1',
        sourcedId
      })

      if (!result) {
        return res.status(404).json(StatusInfoFormatter.notFound('The requested CFItem was not found.'))
      }

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

