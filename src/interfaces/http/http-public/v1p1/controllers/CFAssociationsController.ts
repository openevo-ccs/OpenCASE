import type { Request, Response } from 'express'
import { GetCFAssociation } from '../../../../../application/case/endpoints/GetCFAssociation'
import { StatusInfoFormatter } from '../../../../../infrastructure/http/StatusInfoFormatter'

export class CFAssociationsControllerV1p1 {
  constructor (private readonly getCFAssociation: GetCFAssociation) {}

  getById = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? 'demo'
      const sourcedId = req.params.id

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(sourcedId)) {
        return res.status(404).json(StatusInfoFormatter.invalidUUID('The supplied identifier is not a valid UUID.'))
      }

      const result = await this.getCFAssociation.execute({
        tenantId,
        caseVersion: '1.1',
        sourcedId
      })

      if (!result) {
        return res.status(404).json(StatusInfoFormatter.notFound('The requested CFAssociation was not found.'))
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

